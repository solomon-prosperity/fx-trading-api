import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FundWalletDto {
  @ApiProperty({ description: 'Amount to fund', example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency to fund', example: 'NGN' })
  @IsNotEmpty()
  @IsString()
  currency: string;
}
