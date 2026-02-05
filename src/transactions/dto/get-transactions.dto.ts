import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  ValidateIf,
  IsNotEmpty,
  //   Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsGreaterThan } from 'src/common/decorators/greater-than.decorator';
import { TransactionType } from '../enums/transaction.enum';

export class GetTransactionsDto {
  @ApiProperty({ description: 'Page Number', type: String })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Transactions per page', type: String })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({
    description: 'Search transactions by transaction reference',
    type: String,
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({
    description: 'Filter transactions by type',
    type: String,
    enum: TransactionType,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString({ strict: true })
  start_date: string;

  @ValidateIf((o) => o.startDate)
  @IsDateString({ strict: true })
  @IsNotEmpty()
  @IsGreaterThan('startDate', {
    message: 'endDate must be greater than startDate',
  })
  end_date: string;
}
