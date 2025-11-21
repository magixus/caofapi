import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class EmergencyContactDto {
  @ApiProperty({ example: 'Billal Boumaad', description: 'Emergency contact name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Sibling', description: 'Relationship to patient' })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ example: '+2323232323', description: 'Emergency contact phone' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class CreatePatientDto {
  @ApiProperty({ example: 'Oussama', description: 'Patient first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Boumaad', description: 'Patient last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'boumaadoussama@gmail.com',
    description: 'Patient email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+213553213139', description: 'Patient phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '1992-07-31',
    description: 'Date of birth (ISO format)',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({
    example: 'Male',
    description: 'Patient gender',
    enum: ['Male', 'Female'],
  })
  @IsEnum(['Male', 'Female'])
  @IsNotEmpty()
  gender: 'Male' | 'Female';

  @ApiProperty({ example: 'Rue 1 er novembre', description: 'Patient address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Khemisti', description: 'Patient city' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: '1013241234124134',
    description: 'National ID',
  })
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @ApiProperty({
    example: '234234234234',
    description: 'Social Security Number',
  })
  @IsString()
  @IsNotEmpty()
  socialSecurityNumber: string;

  @ApiPropertyOptional({
    example: null,
    description: 'Insurance type (nullable)',
  })
  @IsString()
  @IsOptional()
  insuranceType?: string | null;

  @ApiProperty({
    example: 'A+',
    description: 'Blood type',
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  })
  @IsEnum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  @IsNotEmpty()
  bloodType: string;

  @ApiPropertyOptional({
    example: [],
    description: 'List of allergies',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @ApiPropertyOptional({
    example: [],
    description: 'List of current medications',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentMedications?: string[];

  @ApiProperty({
    description: 'Emergency contact information',
    type: EmergencyContactDto,
  })
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  @IsNotEmpty()
  emergencyContact: EmergencyContactDto;
}
