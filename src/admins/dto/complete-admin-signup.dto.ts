import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Match } from '../../common/decorators/match.decorator';
import { Gender } from '../../users/enums/user.enum';

export class CompleteAdminSignupDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Admin first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'Admin last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiPropertyOptional({ description: 'Admin middle name', example: 'Michael' })
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiProperty({ description: 'Country code for phone number', example: '+1' })
  @IsString()
  @IsNotEmpty()
  country_code: string;

  @ApiProperty({ description: 'Phone number', example: '123456789' })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiPropertyOptional({
    description: 'Admin gender',
    enum: Gender,
    example: 'not_set',
    default: 'not_set',
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123##',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiProperty({
    description: 'Password confirmation',
    example: 'Password123##',
  })
  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;
}
