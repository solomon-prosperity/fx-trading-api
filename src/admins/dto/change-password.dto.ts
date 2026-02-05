import { MinLength, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: "Admin's current password",
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  current_password: string;

  @ApiProperty({
    description: "Admin's new password",
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  new_password: string;
}
