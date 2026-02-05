import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserEmailDto {
  @ApiProperty({
    description: 'User email address',
    example: 'prosperoera@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
