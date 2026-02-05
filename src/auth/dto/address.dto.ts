import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({
    description: 'House Number',
    example: '12A',
  })
  @IsString()
  @IsNotEmpty()
  house_number: string;

  @ApiProperty({
    description: 'Street Name',
    example: 'Main Street',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    description: 'Landmark',
    example: 'Near Central Park',
    required: false,
  })
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiProperty({
    description: 'Local Government Area',
    example: 'Ikeja',
  })
  @IsString()
  @IsNotEmpty()
  lga: string;

  @ApiProperty({
    description: 'State',
    example: 'Lagos',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Country',
    example: 'Nigeria',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'Zip Code',
    example: '100001',
    required: false,
  })
  @IsString()
  @IsOptional()
  zip_code?: string;
}
