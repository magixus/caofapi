import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFiles,
  Body,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { UploadDocumentsDto } from './dto/upload-documents.dto';

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('extract-mrz')
  @ApiOperation({ 
    summary: 'Extract MRZ data from ID card and Chifa card',
    description: 'Upload ID card, Chifa card (social security), and optional prescription for a patient. Returns extracted patient data from MRZ. Documents are saved and linked to the patient. Quotation should be created separately after this step.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idCard: {
          type: 'string',
          format: 'binary',
          description: 'ID Card image (required)',
        },
        chifaCard: {
          type: 'string',
          format: 'binary',
          description: 'Chifa/Social Security Card image (required)',
        },
        prescription: {
          type: 'string',
          format: 'binary',
          description: 'Prescription image (optional)',
        },
        patientId: {
          type: 'string',
          description: 'Patient UUID (required - must create patient first)',
        },
      },
      required: ['idCard', 'chifaCard', 'patientId'],
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'MRZ data extracted successfully',
    schema: {
      type: 'object',
      properties: {
        idCardData: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            documentType: { type: 'string' },
            extractedData: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                nationalId: { type: 'string' },
                dateOfBirth: { type: 'string' },
                gender: { type: 'string' },
                address: { type: 'string' },
                city: { type: 'string' },
              },
            },
            fileUrl: { type: 'string' },
          },
        },
        chifaCardData: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            documentType: { type: 'string' },
            extractedData: {
              type: 'object',
              properties: {
                socialSecurityNumber: { type: 'string' },
              },
            },
            fileUrl: { type: 'string' },
          },
        },
        prescriptionUrl: { type: 'string' },
        patientData: {
          type: 'object',
          description: 'Combined patient data ready for patient creation',
        },
        savedDocuments: {
          type: 'array',
          description: 'Array of saved document records (if patientId was provided)',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'idCard', maxCount: 1 },
      { name: 'chifaCard', maxCount: 1 },
      { name: 'prescription', maxCount: 1 },
    ]),
  )
  async extractMRZ(
    @UploadedFiles()
    files: {
      idCard?: Express.Multer.File[];
      chifaCard?: Express.Multer.File[];
      prescription?: Express.Multer.File[];
    },
    @Body('patientId') patientId: string,
  ) {
    return this.uploadsService.extractMRZ(files, patientId);
  }

  @Post('photos')
  @ApiOperation({ summary: 'Upload multiple photos' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Photos uploaded successfully' })
  @UseInterceptors(FilesInterceptor('photos', 10))
  uploadPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadsService.uploadPhotos(files);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all documents for a patient' })
  @ApiResponse({ status: 200, description: 'List of patient documents' })
  getPatientDocuments(@Param('patientId') patientId: string) {
    return this.uploadsService.getPatientDocuments(patientId);
  }

  @Get('quotation/:quotationId')
  @ApiOperation({ summary: 'Get all documents for a quotation' })
  @ApiResponse({ status: 200, description: 'List of quotation documents' })
  getQuotationDocuments(@Param('quotationId') quotationId: string) {
    return this.uploadsService.getQuotationDocuments(quotationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document details' })
  getFile(@Param('id') id: string) {
    return this.uploadsService.getFile(id);
  }

  @Post('link-to-quotation')
  @ApiOperation({ 
    summary: 'Link existing documents to a quotation',
    description: 'After creating a quotation, link previously uploaded patient documents to it',
  })
  @ApiResponse({ status: 200, description: 'Documents linked successfully' })
  linkDocumentsToQuotation(
    @Body('documentIds') documentIds: string[],
    @Body('quotationId') quotationId: string,
  ) {
    return this.uploadsService.linkDocumentsToQuotation(documentIds, quotationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document by ID' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  deleteFile(@Param('id') id: string) {
    return this.uploadsService.deleteFile(id);
  }
}
