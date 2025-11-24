import { QuotationStatus } from '@prisma/client';
import { IsEnum, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuotationDto {
  @ApiProperty({ description: 'Patient UUID' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({ 
    description: 'Employee UUID who creates the quotation (optional - defaults to authenticated user)',
  })
  @IsOptional()
  @IsUUID()
  createdById?: string;

  @ApiPropertyOptional({ enum: QuotationStatus, default: QuotationStatus.created })
  @IsEnum(QuotationStatus)
  status?: QuotationStatus = QuotationStatus.created;
}
