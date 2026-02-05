import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  Min,
  IsString,
  IsEnum,
  IsEmail,
  IsDateString,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsGreaterThan } from 'src/common/decorators/greater-than.decorator';

export class GetAdminsDto {
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

  @ApiPropertyOptional({
    description: 'Filter admins by status',
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['active', 'inactive', 'suspended', 'deleted'])
  status?: string;

  @ApiPropertyOptional({ description: 'Search admins by email', type: String })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Search admins by name', type: String })
  @IsOptional()
  @IsString()
  name?: string;

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
