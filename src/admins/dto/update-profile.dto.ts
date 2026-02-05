import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../users/enums/user.enum';

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
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Country code for phone number', example: '+1' })
  @IsOptional()
  @IsString()
  country_code?: string;

  @ApiProperty({ description: 'Phone number', example: '123456789' })
  @IsOptional()
  @IsString()
  phone_number?: string;

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
