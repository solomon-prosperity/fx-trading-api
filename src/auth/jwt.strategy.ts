import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { AdminsService } from 'src/admins/admins.service';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from './interfaces/auth.interfaces';
import { UserStatus } from 'src/users/enums/user.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminsService: AdminsService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: IJwtPayload) {
    const { user_id, user_type, env } = payload;
    if (env !== this.configService.get('NODE_ENV')) {
      throw new UnauthorizedException(
        `You cannot use ${env} tokens for ${this.configService.get('NODE_ENV')} environment`,
      );
    }
    let service;
    let query;
    switch (user_type) {
      case 'user':
        service = this.usersService;
        query = { user_id };
        break;
      case 'admin':
        service = this.adminsService;
        query = { admin_id: user_id };
        break;
      default:
        service = this.usersService;
        query = { user_id };
        break;
    }
    const user = await service.findOne(query);
    if (!user) throw new UnauthorizedException('Invalid Token');
    if (user.status === UserStatus.LOCKED)
      throw new UnauthorizedException(
        'Your account is currently locked, please reset your password',
      );
    if (user.status === UserStatus.SUSPENDED)
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact support.',
      );
    if (user.status === UserStatus.INACTIVE && user.is_email_verified)
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact support.',
      );
    if (user.status === UserStatus.DELETED)
      throw new UnauthorizedException(
        'Your account has been deleted. Please contact support.',
      );
    return user;
  }
}
