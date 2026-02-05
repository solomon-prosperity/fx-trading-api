import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from 'src/permissions/entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (!permissions || isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const userPermissions: Permission[] = request.user.role?.permissions;
    const isPermitted = permissions.some((item) =>
      userPermissions?.map((permission) => permission.name).includes(item),
    );
    if (!isPublic && !isPermitted) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'You are not authorized to use this resource',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return true;
  }
}
