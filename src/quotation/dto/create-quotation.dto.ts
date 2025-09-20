import { QuotationStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class CreateQuotationDto {
  @IsUUID()
  patientId: string;

  @IsEnum(QuotationStatus)
  status?: QuotationStatus = QuotationStatus.created;
}
