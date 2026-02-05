import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PhoneNumberDto {
  @ApiProperty({ description: 'Country Code', example: '+1' })
  @IsString()
  @MinLength(1, { message: 'country_code must be at least one character long' })
  @IsNotEmpty()
  country_code: string;

  @ApiProperty({ description: 'Phone Number', example: '1234567890' })
  @IsString()
  @MinLength(10, { message: 'phone must be at least ten characters long' })
  @MaxLength(11, { message: 'phone must be at most eleven characters long' })
  @IsNotEmpty()
  phone: string;
}
