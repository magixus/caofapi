import { PartialType } from '@nestjs/swagger';
import { CreateDoctorDto } from './create-doctor.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;
}
