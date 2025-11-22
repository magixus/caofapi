import { IsString, IsEmail, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReceptionistDto {
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

  @ApiProperty({ enum: ['morning', 'afternoon', 'evening', 'night'] })
  @IsEnum(['morning', 'afternoon', 'evening', 'night'])
  shift: 'morning' | 'afternoon' | 'evening' | 'night';

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'on_leave'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'on_leave'])
  status?: 'active' | 'inactive' | 'on_leave';

  @ApiProperty({ description: 'Password for the user account' })
  @IsString()
  password: string;
}
