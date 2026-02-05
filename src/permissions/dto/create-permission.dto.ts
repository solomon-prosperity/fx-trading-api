import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Name of the Permission', type: String })
  @IsString()
  @MinLength(5, { message: 'name must be at least five characters long' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Entity of the Permission', type: String })
  @IsString()
  @MinLength(2, {
    message: 'entity must be at least two characters long',
  })
  @IsNotEmpty()
  entity: string;

  @ApiProperty({ description: 'Action of the Permission', type: String })
  @IsString()
  @MinLength(2, {
    message: 'action must be at least two characters long',
  })
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'Description of the Permission', type: String })
  @IsString()
  @MinLength(5, {
    message: 'description must be at least five characters long',
  })
  @IsNotEmpty()
  description: string;
}
