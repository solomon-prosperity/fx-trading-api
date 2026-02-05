import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteAdminDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Admin Role' })
  @IsString()
  @IsNotEmpty()
  role_id: string;
}
