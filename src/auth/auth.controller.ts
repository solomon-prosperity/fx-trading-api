import {
  Controller,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin-dto';
import { SignupDto } from './dto/signup-dto';
import { ResendSignUpOtpDto } from './dto/resend-signup-otp-dto';
import { instanceToPlain } from 'class-transformer';
import { Request as ExpressRequest } from 'express';

@ApiTags('Auth')
@Controller('/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create a User Account' })
  @ApiBody({ type: SignupDto })
  @Post('/register')
  async signUpUser(@Body() payload: SignupDto) {
    const response = await this.authService.signUpUser(payload);
    return {
      response: instanceToPlain(response),
      message: 'User created successfully!',
    };
  }

  @ApiOperation({ summary: 'Resend Email Verification OTP' })
  @ApiBody({ type: ResendSignUpOtpDto })
  @Post('/resend-email-otp')
  @HttpCode(HttpStatus.OK)
  async resendSignUpOtp(@Body() payload: ResendSignUpOtpDto) {
    const response = await this.authService.resendEmailConfirmationOtp(payload);
    return {
      response: instanceToPlain(response),
      message: 'An OTP has been sent to your email',
    };
  }

  @ApiOperation({ summary: 'Sign In' })
  @ApiBody({ type: SigninDto })
  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() payload: SigninDto, @Request() request: ExpressRequest) {
    const response = await this.authService.signIn(payload, 'user', request);
    return {
      response: instanceToPlain(response),
      message: 'Signed in successfully!',
    };
  }

  @ApiOperation({ summary: 'Sign In Admin' })
  @ApiBody({ type: SigninDto })
  @Post('/admin/signin')
  @HttpCode(HttpStatus.OK)
  async signInAdmin(
    @Body() payload: SigninDto,
    @Request() request: ExpressRequest,
  ) {
    const response = await this.authService.signIn(payload, 'admin', request);
    return {
      response: instanceToPlain(response),
      message: 'Signed in successfully!',
    };
  }

  @ApiOperation({ summary: 'Confirm user email' })
  @ApiParam({
    name: 'confirmation_token',
    description: 'Confirmation Token sent to the user email',
  })
  @Post('/verify/:confirmation_token')
  @HttpCode(HttpStatus.OK)
  async confirmation_token(
    @Param('confirmation_token') confirmation_token: string,
    @Request() request: ExpressRequest,
  ) {
    const response = await this.authService.verifyEmail(
      confirmation_token,
      request,
    );
    return {
      response: instanceToPlain(response),
      message: 'User email address has been verified successfully!',
    };
  }
}
