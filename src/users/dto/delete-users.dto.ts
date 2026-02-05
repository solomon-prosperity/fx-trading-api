import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUsersDto {
  @ApiProperty({
    description: 'Comma seperated ID of the users to delete',
    example: '123,456,789',
  })
  @IsString()
  @IsNotEmpty()
  user_ids: string;
}
