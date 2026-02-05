import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  MinLength,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PhoneNumberDto } from './phone-number-dto';

export class SignupDto {
  @ApiProperty({ description: 'First Name of User', type: String })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'Last Name of User', type: String })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiPropertyOptional({ description: 'Middle Name of User', type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  middle_name?: string;

  @ApiProperty({ description: 'Phone Number of User', type: PhoneNumberDto })
  @ValidateNested()
  @Type(() => PhoneNumberDto)
  @IsNotEmpty()
  phone_number: PhoneNumberDto;

  @ApiProperty({ description: 'Email of User', type: String })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password of User', type: String })
  @IsString()
  @MinLength(6, { message: 'password must be at least six characters long' })
  @IsNotEmpty()
  password: string;
}
