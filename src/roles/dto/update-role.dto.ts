import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional({
    description: 'ID of Permissions for the role',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  remove_permissions?: string[];
}
