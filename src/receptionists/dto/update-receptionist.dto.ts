import { PartialType } from '@nestjs/swagger';
import { CreateReceptionistDto } from './create-receptionist.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReceptionistDto extends PartialType(CreateReceptionistDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;
}
