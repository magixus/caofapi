import { IsString, IsEmail, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  specialization: string;

  @ApiProperty()
  @IsString()
  licenseNumber: string;

  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: ['Male', 'Female'] })
  @IsEnum(['Male', 'Female'])
  gender: 'Male' | 'Female';

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsDateString()
  hireDate: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'on_leave'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'on_leave'])
  status?: 'active' | 'inactive' | 'on_leave';

  @ApiPropertyOptional({ description: 'Password for the user account (optional - will be auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  password?: string;
}
