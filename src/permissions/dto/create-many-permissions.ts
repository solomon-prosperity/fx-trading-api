import { CreatePermissionDto } from './create-permission.dto';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateManyPermissionDto {
  @ApiProperty({
    description: 'Array of permissions',
    type: [CreatePermissionDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'There must be at least one permission object' })
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  permissions: CreatePermissionDto[];
}
