import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Name of the Role', type: String })
  @IsString()
  @MinLength(5, { message: 'name must be at least five characters long' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the Permission', type: String })
  @IsString()
  @MinLength(5, {
    message: 'description must be at least five characters long',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'ID of Permissions for the role',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  permissions: string[];
}
