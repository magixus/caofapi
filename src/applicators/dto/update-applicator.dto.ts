import { PartialType } from '@nestjs/swagger';
import { CreateApplicatorDto } from './create-applicator.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicatorDto extends PartialType(CreateApplicatorDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;
}
