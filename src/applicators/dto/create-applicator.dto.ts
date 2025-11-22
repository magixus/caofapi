import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsDateString, IsEnum, IsNotEmpty, IsInt, Min } from 'class-validator';
import { EmployeeStatus } from '@prisma/client';

export class CreateApplicatorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  specialization: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  certificationNumber: string;

  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: ['Male', 'Female'] })
  @IsString()
  @IsNotEmpty()
  gender: 'Male' | 'Female';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsDateString()
  hireDate: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  experienceYears: number;

  @ApiProperty({ enum: EmployeeStatus, default: EmployeeStatus.active })
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
