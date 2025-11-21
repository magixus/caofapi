import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DocumentType } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MRZExtractionResult } from './dto/upload-documents.dto';
import { createWorker } from 'tesseract.js';
import { parse } from 'mrz';
import * as sharp from 'sharp';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${error.message}`);
    }
  }

  /**
   * Extract MRZ (Machine Readable Zone) data from ID card using OCR
   */
  private async extractMRZFromIDCard(file: Express.Multer.File): Promise<any> {
    this.logger.log(`Extracting MRZ from ID card: ${file.originalname}`);
    
    try {
      // Preprocess image for better OCR
      const processedBuffer = await sharp(file.buffer)
        .grayscale()
        .normalize()
        .threshold(128)
        .toBuffer();

      // Initialize Tesseract worker
      const worker = await createWorker('eng');
      
      // Perform OCR
      const { data: { text } } = await worker.recognize(processedBuffer);
      await worker.terminate();

      this.logger.log('OCR completed, analyzing text for MRZ...');
      
      // Extract MRZ lines (typically last 2-3 lines of ID card)
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const mrzLines = lines.slice(-3); // Get last 3 lines, MRZ is usually at bottom

      this.logger.log(`Found ${mrzLines.length} potential MRZ lines`);

      // Try to parse MRZ
      try {
        // MRZ format for ID cards (TD1, TD2, TD3)
        const mrzString = mrzLines.join('\n');
        const parsedMRZ = parse(mrzString);
        
        if (parsedMRZ && parsedMRZ.valid) {
          this.logger.log('Successfully parsed MRZ data');
          
          // Extract data from parsed MRZ
          return {
            success: true,
            documentType: 'ID_CARD',
            extractedData: {
              firstName: parsedMRZ.fields.firstName || '',
              lastName: parsedMRZ.fields.lastName || '',
              nationalId: parsedMRZ.fields.documentNumber || '',
              dateOfBirth: this.formatMRZDate(parsedMRZ.fields.birthDate),
              gender: parsedMRZ.fields.sex === 'M' ? 'Male' : parsedMRZ.fields.sex === 'F' ? 'Female' : '',
              nationality: parsedMRZ.fields.nationality || 'DZA',
              expiryDate: this.formatMRZDate(parsedMRZ.fields.expirationDate),
              documentNumber: parsedMRZ.fields.documentNumber || '',
              mrzLines: mrzLines,
              rawText: text,
            },
            confidence: 1.0,
          };
        }
      } catch (mrzError: any) {
        this.logger.warn(`MRZ parsing failed: ${mrzError.message}, falling back to text extraction`);
      }

      // Fallback: Extract data from raw text if MRZ parsing fails
      return {
        success: false,
        documentType: 'ID_CARD',
        extractedData: {
          rawText: text,
          mrzLines: mrzLines,
          message: 'MRZ parsing failed. Please verify the document quality and try again.',
        },
        confidence: 0.5,
      };
    } catch (error) {
      this.logger.error(`Failed to extract MRZ: ${error.message}`, error.stack);
      return {
        success: false,
        documentType: 'ID_CARD',
        extractedData: {
          error: error.message,
          message: 'OCR extraction failed. Please ensure the image is clear and well-lit.',
        },
        confidence: 0,
      };
    }
  }

  /**
   * Extract Social Security Number from Chifa card using OCR
   */
  private async extractChifaCardData(file: Express.Multer.File): Promise<any> {
    this.logger.log(`Extracting data from Chifa card: ${file.originalname}`);
    
    try {
      // Preprocess image
      const processedBuffer = await sharp(file.buffer)
        .grayscale()
        .normalize()
        .threshold(128)
        .toBuffer();

      // Initialize Tesseract worker
      const worker = await createWorker('eng+fra'); // English and French for Algerian cards
      
      // Perform OCR
      const { data: { text } } = await worker.recognize(processedBuffer);
      await worker.terminate();

      this.logger.log('OCR completed for Chifa card');

      // Extract social security number
      // Algerian SSN format: typically 15 digits
      const ssnMatch = text.match(/\b\d{15}\b/);
      const socialSecurityNumber = ssnMatch ? ssnMatch[0] : '';

      // Extract other identifiable numbers
      const numbers = text.match(/\d+/g) || [];
      
      return {
        success: !!socialSecurityNumber,
        documentType: 'CHIFA_CARD',
        extractedData: {
          socialSecurityNumber: socialSecurityNumber || '',
          cardNumber: numbers.length > 0 ? numbers[0] : '',
          rawText: text,
          message: socialSecurityNumber 
            ? 'Social security number extracted successfully' 
            : 'Could not extract SSN automatically. Please enter manually.',
        },
        confidence: socialSecurityNumber ? 0.85 : 0.3,
      };
    } catch (error) {
      this.logger.error(`Failed to extract Chifa data: ${error.message}`, error.stack);
      return {
        success: false,
        documentType: 'CHIFA_CARD',
        extractedData: {
          error: error.message,
          message: 'OCR extraction failed. Please ensure the image is clear.',
        },
        confidence: 0,
      };
    }
  }

  /**
   * Format MRZ date (YYMMDD) to ISO format
   */
  private formatMRZDate(mrzDate: string | null | undefined): string {
    if (!mrzDate || mrzDate.length !== 6) return '';
    
    const year = parseInt(mrzDate.substring(0, 2));
    const month = mrzDate.substring(2, 4);
    const day = mrzDate.substring(4, 6);
    
    // Assume 2000s for years < 50, 1900s for >= 50
    const fullYear = year < 50 ? 2000 + year : 1900 + year;
    
    return `${fullYear}-${month}-${day}`;
  }

  /**
   * Save file to disk and return URL
   */
  private async saveFile(file: Express.Multer.File): Promise<{ url: string; path: string }> {
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedFilename}`;
    const filepath = path.join(this.uploadDir, filename);
    
    await fs.writeFile(filepath, file.buffer);
    
    return {
      url: `/uploads/${filename}`,
      path: filepath,
    };
  }

  /**
   * Main endpoint for extracting MRZ from uploaded documents
   */
  async extractMRZ(files: {
    idCard?: Express.Multer.File[];
    chifaCard?: Express.Multer.File[];
    prescription?: Express.Multer.File[];
  }, patientId: string): Promise<{
    idCardData?: MRZExtractionResult;
    chifaCardData?: MRZExtractionResult;
    prescriptionUrl?: string;
    patientData: any;
    savedDocuments: any[];
  }> {
    this.logger.log(`Starting MRZ extraction process for patient: ${patientId}`);
    
    if (!patientId) {
      throw new BadRequestException('Patient ID is required');
    }

    let idCardData: any = null;
    let chifaCardData: any = null;
    let prescriptionUrl: string | null = null;
    const savedDocuments: any[] = [];

    // Process ID Card
    if (files.idCard && files.idCard[0]) {
      const idCardFile = files.idCard[0];
      idCardData = await this.extractMRZFromIDCard(idCardFile);
      const { url } = await this.saveFile(idCardFile);
      idCardData.fileUrl = url;

      const doc = await this.prisma.patientDocument.create({
        data: {
          patientId,
          type: DocumentType.ID_CARD,
          fileName: idCardFile.originalname,
          fileUrl: url,
          fileSize: idCardFile.size,
          mimeType: idCardFile.mimetype,
          extractedData: idCardData.extractedData,
        },
      });
      savedDocuments.push(doc);
    }

    // Process Chifa Card
    if (files.chifaCard && files.chifaCard[0]) {
      const chifaCardFile = files.chifaCard[0];
      chifaCardData = await this.extractChifaCardData(chifaCardFile);
      const { url } = await this.saveFile(chifaCardFile);
      chifaCardData.fileUrl = url;

      const doc = await this.prisma.patientDocument.create({
        data: {
          patientId,
          type: DocumentType.CHIFA_CARD,
          fileName: chifaCardFile.originalname,
          fileUrl: url,
          fileSize: chifaCardFile.size,
          mimeType: chifaCardFile.mimetype,
          extractedData: chifaCardData.extractedData,
        },
      });
      savedDocuments.push(doc);
    }

    // Process Prescription (no extraction, just save)
    if (files.prescription && files.prescription[0]) {
      const prescriptionFile = files.prescription[0];
      const { url } = await this.saveFile(prescriptionFile);
      prescriptionUrl = url;

      const doc = await this.prisma.patientDocument.create({
        data: {
          patientId,
          type: DocumentType.PRESCRIPTION,
          fileName: prescriptionFile.originalname,
          fileUrl: url,
          fileSize: prescriptionFile.size,
          mimeType: prescriptionFile.mimetype,
        },
      });
      savedDocuments.push(doc);
    }

    // Combine extracted data for patient creation/update
    const patientData = {
      firstName: idCardData?.extractedData?.firstName || '',
      lastName: idCardData?.extractedData?.lastName || '',
      nationalId: idCardData?.extractedData?.nationalId || '',
      dateOfBirth: idCardData?.extractedData?.dateOfBirth || '',
      gender: idCardData?.extractedData?.gender || '',
      socialSecurityNumber: chifaCardData?.extractedData?.socialSecurityNumber || '',
    };

    return {
      idCardData,
      chifaCardData,
      prescriptionUrl: prescriptionUrl || undefined,
      patientData,
      savedDocuments,
    };
  }

  async uploadPhotos(files: Express.Multer.File[]) {
    this.logger.log(`Uploading ${files.length} photos`);
    try {
      const photoUrls: string[] = [];
      
      for (const file of files) {
        const { url } = await this.saveFile(file);
        photoUrls.push(url);
      }

      this.logger.log(`Photos uploaded successfully: ${photoUrls.length}`);
      return { photos: photoUrls };
    } catch (error) {
      this.logger.error(`Failed to upload photos: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFile(id: string) {
    this.logger.log(`Fetching file: ${id}`);
    const doc = await this.prisma.patientDocument.findUnique({
      where: { id },
      include: { patient: true },
    });
    
    if (!doc) {
      throw new BadRequestException(`Document ${id} not found`);
    }
    
    return doc;
  }

  async deleteFile(id: string) {
    this.logger.log(`Deleting file: ${id}`);
    const doc = await this.prisma.patientDocument.findUnique({
      where: { id },
    });
    
    if (!doc) {
      throw new BadRequestException(`Document ${id} not found`);
    }
    
    // Delete from disk
    try {
      const filename = doc.fileUrl.split('/').pop();
      const filepath = path.join(this.uploadDir, filename!);
      await fs.unlink(filepath);
    } catch (error) {
      this.logger.warn(`Could not delete physical file: ${error.message}`);
    }
    
    // Delete from database
    await this.prisma.patientDocument.delete({ where: { id } });
    
    return { success: true, message: 'File deleted successfully' };
  }

  async getPatientDocuments(patientId: string) {
    return this.prisma.patientDocument.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuotationDocuments(quotationId: string) {
    return this.prisma.patientDocument.findMany({
      where: { quotationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Link existing patient documents to a quotation
   * Called after quotation is created
   */
  async linkDocumentsToQuotation(documentIds: string[], quotationId: string) {
    this.logger.log(`Linking ${documentIds.length} documents to quotation ${quotationId}`);
    
    const updated = await this.prisma.patientDocument.updateMany({
      where: {
        id: { in: documentIds },
      },
      data: {
        quotationId,
      },
    });

    return {
      success: true,
      count: updated.count,
      message: `${updated.count} documents linked to quotation`,
    };
  }
}
