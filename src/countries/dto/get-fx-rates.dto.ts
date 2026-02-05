import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetFxRatesDto {
  @ApiProperty({
    description: 'Base currency',
    default: 'USD',
    required: false,
  })
  @IsOptional()
  @IsString()
  base?: string;
}
