import { PartialType } from '@nestjs/swagger';
import { CreateQuotationDto } from './create-quotation.dto';

import { QuotationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @IsEnum(QuotationStatus)
  @IsOptional()
  status?: QuotationStatus;
}
