import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PhoneNumberDto } from './phone-number-dto';

export class ResendSignUpOtpDto {
  @ApiProperty({ description: 'Email of User', type: PhoneNumberDto })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
