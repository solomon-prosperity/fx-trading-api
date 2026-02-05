import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  Min,
  IsString,
  // IsEnum,
  IsDateString,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsGreaterThan } from 'src/common/decorators/greater-than.decorator';

export class GetOwnActivitiesDto {
  @ApiPropertyOptional({
    description: 'Filter activities by activity_id',
    type: String,
  })
  @IsOptional()
  @IsString()
  public readonly activity_id?: string;

  // @ApiPropertyOptional({
  //   description: 'Filter activities by entity_id',
  //   type: String,
  // })
  // @IsOptional()
  // @IsString()
  // public readonly entity_id?: string;

  // @ApiPropertyOptional({
  //   description: 'Filter activities by entity',
  //   type: String,
  //   enum: ['admin', 'user'],
  // })
  // @IsOptional()
  // @IsString()
  // @IsEnum(['admin', 'user'])
  // entity?: string;

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

  @IsOptional()
  @IsDateString({ strict: true })
  from?: string;

  @ValidateIf((o) => o.startDate)
  @IsDateString({ strict: true })
  @IsNotEmpty()
  @IsGreaterThan('from', {
    message: 'to must be greater than from',
  })
  to?: string;
}
