import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Match } from '../../common/decorators/match.decorator';
import { Gender } from '../../users/enums/user.enum';
import { PhoneNumberDto } from 'src/auth/dto/phone-number-dto';
import { AddressDto } from 'src/auth/dto/address.dto';
import { Type } from 'class-transformer';

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

  @ApiProperty({ description: 'Phone Number of Admin', type: PhoneNumberDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PhoneNumberDto)
  phone_number?: PhoneNumberDto;

  @ApiProperty({ description: 'Address of Admin', type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

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
    description: 'Admin password',
    example: 'Password123##',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiProperty({
    description: 'Admin password confirmation',
    example: 'Password123##',
  })
  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;
}
