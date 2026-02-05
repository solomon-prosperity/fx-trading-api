import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { SigninDto } from './dto/signin-dto';
import { SignupDto } from './dto/signup-dto';
import { ResendSignUpOtpDto } from './dto/resend-signup-otp-dto';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { UsersService } from 'src/users/users.service';
import { AdminsService } from 'src/admins/admins.service';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { UserStatus } from 'src/users/enums/user.enum';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminsService: AdminsService,
    private readonly rabitmqService: RabbitmqService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async signUpUser(payload: SignupDto): Promise<User> {
    try {
      const response: User = await this.dataSource.transaction(
        async (manager) => {
          const { email } = payload;
          const user = await this.usersService.findOne({
            email,
          });
          if (user) throw new ConflictException('User already exists');
          const otp = await this.generateOtp(this.usersService);
          const otp_expires_at = Date.now() + 300000; // 5 minutes
          const new_user = await this.usersService.create(
            {
              ...payload,
              email_confirmation_token: otp,
              email_confirmation_sent_at: Date.now(),
              email_confirmation_expires_at: otp_expires_at,
            },
            manager,
          );
          await this.rabitmqService.publishMessage([
            {
              worker: 'notification',
              message: {
                action: 'send',
                type: 'email',
                data: {
                  recipient: email,
                  subject: 'Welcome to the FX Trading API!',
                  template_id:
                    this.configService.get(
                      'ZEPTOMAIL_TEMPLATE_EMAIL_VERIFICATION',
                    ) ||
                    '2d6f.25986f17b20ef1dd.k1.fa1fd4a0-0208-11f1-8688-fae9afc80e45.19c2a5d8eea',
                  template_variables: { name: new_user.first_name, otp },
                  cc: null,
                  bcc: null,
                  attachments: null,
                },
              },
            },
          ]);
          return new_user;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async signIn(payload: SigninDto, user_type: string, request: Request) {
    try {
      const response = await this.dataSource.transaction(async (manager) => {
        const { email, password } = payload;
        let service;
        switch (user_type) {
          case 'user':
            service = this.usersService;
            break;
          case 'admin':
            service = this.adminsService;
            break;
          default:
            service = this.usersService;
            break;
        }
        const user = await service.findOne({
          email,
        });
        if (!user) throw new UnauthorizedException('Invalid credentials');
        if (user.status === UserStatus.LOCKED)
          throw new UnauthorizedException(
            'Your account is currently locked, please reset your password',
          );
        const match = await bcrypt.compare(password, user.password as string);
        const user_id = 'user_id' in user ? user.user_id : user.admin_id;
        if (!match) {
          const allowed_login_attempts = this.configService.get(
            'ALLOWED_LOGIN_ATTEMPTS',
          );
          if (user.login_attempts >= Number(allowed_login_attempts)) {
            await service.updateWithoutTxn(user_id, {
              status: UserStatus.LOCKED,
            });
            throw new UnauthorizedException(
              'Too many login attempts, Your account has been locked. Please reset your password.',
            );
          }
          const login_attempts = (user.login_attempts += 1);
          await service.updateWithoutTxn(user_id, { login_attempts });
          throw new UnauthorizedException('Invalid credentials');
        }
        if (user.status === UserStatus.SUSPENDED)
          throw new UnauthorizedException(
            'Your account has been suspended. Please contact support.',
          );
        if (user.status === UserStatus.INACTIVE && user.is_email_verified) {
          throw new UnauthorizedException(
            'Your account has been deactivated. Please contact support.',
          );
        }
        if (user.status === UserStatus.DELETED) {
          throw new UnauthorizedException(
            'Your account has been deleted. Please contact support.',
          );
        }
        const token = this.jwtService.sign({
          user_id: user_id,
          user_type,
          env: this.configService.get('NODE_ENV'),
          iat: Math.floor(new Date().getTime() / 1000),
        });
        const login_times = user.login_times as unknown as Date[];
        login_times.push(new Date());
        const updated_user = await service.update(
          user_id,
          { login_attempts: 0, login_times },
          manager,
        );
        const data = updated_user;
        const request_meta = {
          ip:
            request.ip ||
            request.headers['x-forwarded-for'] ||
            request.socket.remoteAddress,
          user_agent: request.headers['user-agent'],
        };
        await this.rabitmqService.publishMessage([
          {
            worker: 'activity',
            message: {
              action: 'log',
              type: 'activity',
              data: {
                entity_id: user_id,
                activity: `${data.first_name} logged in`,
                entity: user_type,
                resource: 'Auth',
                event: 'Login',
                event_date: new Date(),
                request: request_meta,
              },
            },
          },
        ]);
        return { user: data, token, user_type };
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async generateOtp(
    service: UsersService | AdminsService,
    type?: string,
  ): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    let query;
    switch (type) {
      case 'reset-password':
        query = { reset_password_token: otp };
        break;
      default:
        query = { email_confirmation_token: otp };
        break;
    }
    const user = await service.findOne(query);
    if (user) {
      await this.generateOtp(service, type);
    }
    return otp;
  }

  async resendEmailConfirmationOtp(
    payload: ResendSignUpOtpDto,
  ): Promise<object> {
    try {
      const response = await this.dataSource.transaction(async (manager) => {
        const { email } = payload;
        const user = await this.usersService.findOne({
          email,
        });
        if (!user) throw new NotFoundException('User not found');
        if (user.is_email_verified)
          throw new ForbiddenException("User's email already verified");
        const otp = await this.generateOtp(this.usersService);
        const otp_expires_at = Date.now() + 300000; // 5 minutes
        await this.usersService.update(
          user.user_id,
          {
            email_confirmation_token: otp,
            email_confirmation_expires_at: otp_expires_at,
          },
          manager,
        );
        await this.rabitmqService.publishMessage([
          {
            worker: 'notification',
            message: {
              action: 'send',
              type: 'email',
              data: {
                recipient: email,
                subject: 'Confirm your email',
                template_id:
                  this.configService.get(
                    'ZEPTOMAIL_TEMPLATE_EMAIL_VERIFICATION',
                  ) ||
                  '2d6f.25986f17b20ef1dd.k1.fa1fd4a0-0208-11f1-8688-fae9afc80e45.19c2a5d8eea',
                template_variables: { name: user.first_name, otp },
                cc: null,
                bcc: null,
                attachments: null,
              },
            },
          },
        ]);
        return {};
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(confirmation_token: string, request: Request) {
    try {
      const response = await this.dataSource.transaction(async (manager) => {
        const user = await this.usersService.findOne({
          email_confirmation_token: confirmation_token,
        });
        if (!user) throw new NotFoundException('Invalid Email Token');
        if (user.is_email_verified)
          throw new ForbiddenException('Email has already been verified');
        user.is_email_verified = true;
        user.status = UserStatus.ACTIVE;
        const token = this.jwtService.sign(
          {
            user_id: user.user_id,
            user_type: 'user',
            env: this.configService.get('NODE_ENV'),
            iat: Math.floor(new Date().getTime() / 1000),
          },
          {
            secret: this.configService.get('JWT_USER_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRY_TIME'),
          },
        );
        const login_times = user.login_times as unknown as Date[];
        login_times.push(new Date());
        const updated_user = await this.usersService.update(
          user.user_id,
          {
            is_email_verified: true,
            status: UserStatus.ACTIVE,
            login_attempts: 0,
            login_times,
          },
          manager,
        );
        const request_meta = {
          ip:
            request.ip ||
            request.headers['x-forwarded-for'] ||
            request.socket.remoteAddress,
          user_agent: request.headers['user-agent'],
        };
        await this.rabitmqService.publishMessage([
          {
            worker: 'activity',
            message: {
              action: 'log',
              type: 'activity',
              data: {
                entity_id: user.user_id,
                activity: `${user.first_name} verified their email`,
                entity: 'user',
                resource: 'Auth',
                event: 'Verify',
                event_date: new Date(),
                request: request_meta,
              },
            },
          },
        ]);
        return { user: updated_user, token, user_type: 'user' };
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}
