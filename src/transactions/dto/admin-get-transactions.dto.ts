import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  Min,
  ValidateIf,
  IsNotEmpty,
  //   Validate,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsGreaterThan } from 'src/common/decorators/greater-than.decorator';
import {
  TransactionStatus,
  TransactionType,
  TransactionFlow,
} from '../enums/transaction.enum';

export class AdminGetTransactionsDto {
  @ApiPropertyOptional({ description: 'Page Number', type: String })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Transactions per page', type: String })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Search transactions by transaction reference',
    type: String,
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Search transactions by transaction session_id',
    type: String,
  })
  @IsOptional()
  @IsString()
  session_id?: string;

  @ApiPropertyOptional({
    description: 'Search transactions by product_id',
    type: String,
  })
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiPropertyOptional({
    description: 'Search transactions by operator_id',
    type: String,
  })
  @IsOptional()
  @IsString()
  operator_id?: string;

  @ApiPropertyOptional({
    description: 'Get transactions by user',
    type: String,
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Get transfer transactions',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  is_transfer?: boolean;

  @ApiPropertyOptional({
    description: 'Filter transactions by type',
    type: String,
    enum: TransactionType,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    description: 'Filter transactions by flow',
    type: String,
    enum: TransactionFlow,
  })
  @IsOptional()
  @IsEnum(TransactionFlow)
  flow?: TransactionFlow;

  @ApiPropertyOptional({
    description: 'Filter transactions by status',
    type: String,
    enum: TransactionStatus,
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsDateString({ strict: true })
  start_date: string;

  @ValidateIf((o) => o.startDate)
  @IsDateString({ strict: true })
  @IsNotEmpty()
  @IsGreaterThan('start_date', {
    message: 'end_date must be greater than startDate',
  })
  end_date: string;
}
