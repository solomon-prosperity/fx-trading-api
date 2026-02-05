import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminsService } from 'src/admins/admins.service';
import { RolesService } from 'src/roles/roles.service';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from './interfaces/auth.interfaces';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly rolesService: RolesService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ADMIN_SECRET,
    });
  }

  async validate(payload: IJwtPayload) {
    const { user_id, jti, user_type, env } = payload;
    if (env !== this.configService.get('NODE_ENV')) {
      throw new UnauthorizedException(
        `You cannot use ${env} tokens for ${this.configService.get('NODE_ENV')} environment`,
      );
    }
    let service;
    switch (user_type) {
      case 'admin':
        service = this.adminsService;
        break;
      default:
        service = this.adminsService;
        break;
    }
    const user = await service.findOne({ admin_id: user_id });
    if (!user) throw new UnauthorizedException('Invalid Token');
    if (user.jti !== jti) throw new UnauthorizedException('Invalid Token');
    if (user.status === 'locked')
      throw new UnauthorizedException(
        'Your account is currently locked, please reset your password',
      );
    if (user.status === 'suspended')
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact support.',
      );
    if (user.status === 'inactive')
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact support.',
      );
    if (user.status === 'deleted')
      throw new UnauthorizedException(
        'Your account has been deleted. Please contact support.',
      );
    // if (user.password_changed_at) {
    //   if (iat < user.password_changed_at)
    //     throw new UnauthorizedException(
    //       'Token revoked because your password was changed. Please Signin again.',
    //     );
    // }
    const { role_id } = user;
    const role = await this.rolesService.findOne(role_id as string);
    if (!role) throw new UnauthorizedException('Invalid Role');
    const role_permissions = role.permissions.map((perm) => perm.name);
    const $user = { ...user, permissions: role_permissions };
    return $user;
  }
}
