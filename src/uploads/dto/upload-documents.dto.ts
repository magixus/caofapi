import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadDocumentsDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'ID Card image' })
  idCard: any;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Chifa (Social Security) Card image' })
  chifaCard: any;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Prescription image', required: false })
  prescription?: any;

  @ApiProperty({ description: 'Patient ID (required)' })
  @IsUUID()
  patientId: string;
}

export class MRZExtractionResult {
  success: boolean;
  documentType: string;
  extractedData: {
    // ID Card fields
    firstName?: string;
    lastName?: string;
    nationalId?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    
    // Chifa Card fields
    socialSecurityNumber?: string;
    
    // Raw MRZ data
    mrzLines?: string[];
    rawText?: string;
  };
  confidence?: number;
  fileUrl?: string;
}
