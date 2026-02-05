import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConvertCurrencyDto {
  @ApiProperty({ description: 'Currency to convert from', example: 'NGN' })
  @IsNotEmpty()
  @IsString()
  from_currency: string;

  @ApiProperty({ description: 'Currency to convert to', example: 'USD' })
  @IsNotEmpty()
  @IsString()
  to_currency: string;

  @ApiProperty({ description: 'Amount to convert', example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}
