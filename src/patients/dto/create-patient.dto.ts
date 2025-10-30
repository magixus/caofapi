import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'John', description: 'Patient first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Patient last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '123456789012345678',
    description: 'National ID (18 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(18, 18)
  nationalId: string;

  @ApiProperty({
    example: '123456789012345',
    description: 'Social Security Number (15 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  socialSecurityNumber: string;

  @ApiProperty({
    example: 'Public',
    description: 'Insurance type (e.g., Public, Private)',
  })
  @IsString()
  @IsNotEmpty()
  insuranceType: string;
}
