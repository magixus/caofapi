import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Diagnosis } from '@prisma/client';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { AssignDiagnosisDto } from './dto/assign-diagnosis.dto';

@Injectable()
export class DiagnosisService {
  private readonly logger = new Logger(DiagnosisService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(quotationId: string, createDiagnosisDto: CreateDiagnosisDto): Promise<Diagnosis> {
    this.logger.log(`Creating diagnosis for quotation: ${quotationId}`);
    try {
      // Check if quotation exists
      const quotation = await this.prisma.quotation.findUnique({
        where: { id: quotationId },
        include: { Diagnosis: true },
      });

      if (!quotation) {
        throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
      }

      if (quotation.Diagnosis) {
        throw new BadRequestException(`Diagnosis already exists for quotation ${quotationId}`);
      }

      const diagnosis = await this.prisma.diagnosis.create({
        data: {
          ...createDiagnosisDto,
          quotationId,
        },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      this.logger.log(`Diagnosis created with ID: ${diagnosis.id}`);
      return diagnosis;
    } catch (error) {
      this.logger.error(`Failed to create diagnosis: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByQuotation(quotationId: string): Promise<Diagnosis> {
    this.logger.log(`Fetching diagnosis for quotation: ${quotationId}`);
    try {
      const diagnosis = await this.prisma.diagnosis.findUnique({
        where: { quotationId },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      if (!diagnosis) {
        throw new NotFoundException(`Diagnosis not found for quotation ${quotationId}`);
      }

      this.logger.log(`Diagnosis retrieved: ${diagnosis.id}`);
      return diagnosis;
    } catch (error) {
      this.logger.error(`Failed to fetch diagnosis: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateDiagnosisDto: UpdateDiagnosisDto): Promise<Diagnosis> {
    this.logger.log(`Updating diagnosis: ${id}`);
    try {
      const diagnosis = await this.prisma.diagnosis.findUnique({ where: { id } });
      if (!diagnosis) {
        throw new NotFoundException(`Diagnosis with ID ${id} not found`);
      }

      const updatedDiagnosis = await this.prisma.diagnosis.update({
        where: { id },
        data: updateDiagnosisDto,
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      this.logger.log(`Diagnosis updated: ${id}`);
      return updatedDiagnosis;
    } catch (error) {
      this.logger.error(`Failed to update diagnosis: ${error.message}`, error.stack);
      throw error;
    }
  }

  async assign(id: string, assignDiagnosisDto: AssignDiagnosisDto): Promise<Diagnosis> {
    this.logger.log(`Assigning diagnosis ${id} to employee ${assignDiagnosisDto.assignedToId}`);
    try {
      // Validate diagnosis exists
      const diagnosis = await this.prisma.diagnosis.findUnique({ where: { id } });
      if (!diagnosis) {
        throw new NotFoundException(`Diagnosis with ID ${id} not found`);
      }

      // Validate employees exist
      const [assignedTo, assignedBy] = await Promise.all([
        this.prisma.employee.findUnique({ where: { id: assignDiagnosisDto.assignedToId } }),
        this.prisma.employee.findUnique({ where: { id: assignDiagnosisDto.assignedById } }),
      ]);

      if (!assignedTo) {
        throw new NotFoundException(`Employee with ID ${assignDiagnosisDto.assignedToId} not found`);
      }
      if (!assignedBy) {
        throw new NotFoundException(`Employee with ID ${assignDiagnosisDto.assignedById} not found`);
      }

      const updatedDiagnosis = await this.prisma.diagnosis.update({
        where: { id },
        data: {
          assignedToId: assignDiagnosisDto.assignedToId,
          assignedById: assignDiagnosisDto.assignedById,
          assignedAt: new Date(),
        },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      this.logger.log(`Diagnosis assigned: ${id}`);
      return updatedDiagnosis;
    } catch (error) {
      this.logger.error(`Failed to assign diagnosis: ${error.message}`, error.stack);
      throw error;
    }
  }

  async uploadPhotos(id: string, photos: string[]): Promise<Diagnosis> {
    this.logger.log(`Uploading photos to diagnosis: ${id}`);
    try {
      const diagnosis = await this.prisma.diagnosis.findUnique({ where: { id } });
      if (!diagnosis) {
        throw new NotFoundException(`Diagnosis with ID ${id} not found`);
      }

      const updatedDiagnosis = await this.prisma.diagnosis.update({
        where: { id },
        data: {
          photos: [...diagnosis.photos, ...photos],
        },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      this.logger.log(`Photos uploaded to diagnosis: ${id}`);
      return updatedDiagnosis;
    } catch (error) {
      this.logger.error(`Failed to upload photos: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Diagnosis[]> {
    this.logger.log('Fetching all diagnoses');
    try {
      const diagnoses = await this.prisma.diagnosis.findMany({
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(`Retrieved ${diagnoses.length} diagnoses`);
      return diagnoses;
    } catch (error) {
      this.logger.error(`Failed to fetch diagnoses: ${error.message}`, error.stack);
      throw error;
    }
  }
}
