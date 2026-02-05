import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PhoneNumberDto } from 'src/auth/dto/phone-number-dto';
import { AddressDto } from 'src/auth/dto/address.dto';
import { Gender } from '../enums/user.enum';

export class UpdateProfileDto {
  @ApiProperty({ description: 'First Name of User', type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ description: 'Last Name of User', type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ description: 'Middle Name of User', type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  middle_name?: string;

  @ApiProperty({ description: 'Phone Number of User', type: PhoneNumberDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PhoneNumberDto)
  phone_number?: PhoneNumberDto;

  @ApiProperty({ description: 'Gender of User', enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ description: 'Address of User', type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address_info?: AddressDto;
}
