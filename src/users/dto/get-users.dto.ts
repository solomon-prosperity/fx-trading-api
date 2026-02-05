import {
  IsOptional,
  // IsPositive,
  IsDateString,
  ValidateIf,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsEmail,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsGreaterThan } from 'src/common/decorators/greater-than.decorator';

export class GetUsersDto {
  @ApiPropertyOptional({ description: 'Page Number', type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per Page', type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search users by name', type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter admins by status',
    type: String,
    enum: [
      'active',
      'inactive',
      'deleted',
      'incomplete_profile',
      'suspended',
      'pending',
      'locked',
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    'active',
    'inactive',
    'deleted',
    'incomplete_profile',
    'suspended',
    'pending',
    'locked',
  ])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter admins by status',
    type: String,
    enum: ['tier_one', 'tier_two', 'tier_three', 'none'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['tier_one', 'tier_two', 'tier_three', 'none'])
  kyc_tier?: string;

  @ApiPropertyOptional({ description: 'Search admins by email', type: String })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  start_date: string;

  @ValidateIf((o) => o.startDate)
  @IsDateString({ strict: true })
  @IsNotEmpty()
  @IsGreaterThan('start_date', {
    message: 'end_date must be greater than start_date',
  })
  end_date: string;
}
