import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TradeAction {
  BUY = 'buy',
  SELL = 'sell',
}

export class TradeCurrencyDto {
  @ApiProperty({
    description: 'The currency being traded (e.g. USD)',
    example: 'USD',
  })
  @IsNotEmpty()
  @IsString()
  base_currency: string;

  @ApiProperty({
    description: 'The currency used for the trade (e.g. NGN)',
    example: 'NGN',
  })
  @IsNotEmpty()
  @IsString()
  quote_currency: string;

  @ApiProperty({
    description: 'The amount of base currency to buy or sell',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'The trade action',
    enum: TradeAction,
    example: TradeAction.BUY,
  })
  @IsNotEmpty()
  @IsEnum(TradeAction)
  action: TradeAction;
}
