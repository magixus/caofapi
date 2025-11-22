import { IsString, IsEmail, IsEnum, IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicatorDto {
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
  certificationNumber: string;

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

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  experienceYears: number;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'on_leave'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'on_leave'])
  status?: 'active' | 'inactive' | 'on_leave';

  @ApiProperty({ description: 'Password for the user account' })
  @IsString()
  password: string;
}
