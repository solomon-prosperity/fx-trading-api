import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetRoleUsersDto {
  @ApiPropertyOptional({ description: 'Page Number', type: Number })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per Page', type: Number })
  @IsOptional()
  limit?: number;
}
