import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  nationalId: string;

  @IsDateString()
  dateOfBirth: Date;

  @IsString()
  placeOfBirth: string;

  @IsOptional()
  @IsArray()
  photos?: string[];
}
