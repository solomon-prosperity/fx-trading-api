import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.is_email_verified) {
      throw new ForbiddenException(
        'Your email is not verified. Please verify your email',
      );
    }

    return true;
  }
}
