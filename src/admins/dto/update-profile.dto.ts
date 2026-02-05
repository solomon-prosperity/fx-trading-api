import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../users/enums/user.enum';
import { PhoneNumberDto } from 'src/auth/dto/phone-number-dto';
import { AddressDto } from 'src/auth/dto/address.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Admin first name', example: 'John' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ description: 'Admin last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ description: 'Admin middle name', example: 'Michael' })
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiPropertyOptional({ description: 'Admin Address' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({ description: 'Phone Number of User', type: PhoneNumberDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PhoneNumberDto)
  phone_number?: PhoneNumberDto;

  @ApiPropertyOptional({
    description: 'Admin gender',
    enum: Gender,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsUrl()
  image?: string;
}
