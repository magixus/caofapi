/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/quotations/quotations.service.ts
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Quotation } from '@prisma/client';
import { CreateQuotationDto } from './dto/create-quotations.dto';
import { UpdateQuotationDto } from './dto/update-quotations.dto';

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate sequential quotation code in format: CA-YYYYMM0000000001
   * Example: CA-202501000000001 (January 2025, sequence 1)
   */
  private async generateQuotationCode(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `CA-${year}${month}`;

    // Find the last quotation for this year-month
    const lastQuotation = await this.prisma.quotation.findFirst({
      where: {
        code: {
          startsWith: prefix,
        },
      },
      orderBy: {
        code: 'desc',
      },
    });

    let sequence = 1;
    if (lastQuotation && lastQuotation.code) {
      // Extract the last 10 digits and increment
      const lastSequence = parseInt(lastQuotation.code.slice(-10), 10);
      sequence = lastSequence + 1;
    }

    // Format: CA-YYYYMM0000000001 (10 digits for sequence)
    const sequenceStr = String(sequence).padStart(10, '0');
    const code = `${prefix}${sequenceStr}`;
    
    this.logger.log(`Generated quotation code: ${code}`);
    return code;
  }

  async create(
    createQuotationDto: CreateQuotationDto,
    userId: string,
  ): Promise<Quotation> {
    this.logger.log(
      `Creating quotation for patient ID: ${createQuotationDto.patientId}, userId: ${userId}`,
    );
    try {
      // Validate userId is provided
      if (!userId) {
        throw new NotFoundException('User ID is required (should come from authentication token)');
      }

      // Validate patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id: createQuotationDto.patientId },
      });
      if (!patient) {
        this.logger.error(`Patient not found: ${createQuotationDto.patientId}`);
        throw new NotFoundException(
          `Patient with ID ${createQuotationDto.patientId} not found`,
        );
      }

      // Validate that user is an employee (has employee record)
      const employee = await this.prisma.employee.findUnique({
        where: { userId },
      });

      if (!employee) {
        throw new NotFoundException(
          `User with ID ${userId} is not registered as an employee. Only employees can create quotations.`,
        );
      }

      // Generate sequential code
      const code = await this.generateQuotationCode();

      const quotation = await this.prisma.quotation.create({
        data: {
          code,
          patient: {
            connect: { id: createQuotationDto.patientId }
          },
          createdBy: {
            connect: { userId }
          },
          status: createQuotationDto.status || 'created',
        },
        include: {
          patient: true,
          createdBy: true,
        },
      });
      this.logger.log(`Quotation created with ID: ${quotation.id}, code: ${quotation.code}`);
      return quotation;
    } catch (error) {
      this.logger.error(
        `Failed to create quotation: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async count(): Promise<number> {
    return await this.prisma.quotation.count();
  }

  async findAll(): Promise<Quotation[]> {
    this.logger.log('Fetching all quotations');
    try {
      const quotations = await this.prisma.quotation.findMany({
        include: {
          patient: true,
          createdBy: true,
        },
      });
      this.logger.log(`Retrieved ${quotations.length} quotations`);
      return quotations;
    } catch (error) {
      this.logger.error(
        `Failed to fetch quotations: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<Quotation> {
    this.logger.log(`Fetching quotation with ID: ${id}`);
    try {
      const quotation = await this.prisma.quotation.findUnique({
        where: { id },
        include: {
          patient: true,
          createdBy: true,
        },
      });
      if (!quotation) {
        this.logger.error(`Quotation not found: ${id}`);
        throw new NotFoundException(`Quotation with ID ${id} not found`);
      }
      this.logger.log(`Quotation retrieved: ${id}`);
      return quotation;
    } catch (error) {
      this.logger.error(
        `Failed to fetch quotation ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateQuotationDto: UpdateQuotationDto,
  ): Promise<Quotation> {
    this.logger.log(`Updating quotation with ID: ${id}`);
    try {
      // Check if quotation exists
      const quotation = await this.prisma.quotation.findUnique({
        where: { id },
      });
      if (!quotation) {
        this.logger.error(`Quotation not found: ${id}`);
        throw new NotFoundException(`Quotation with ID ${id} not found`);
      }

      // Validate patient if provided
      if (updateQuotationDto.patientId) {
        const patient = await this.prisma.patient.findUnique({
          where: { id: updateQuotationDto.patientId },
        });
        if (!patient) {
          this.logger.error(
            `Patient not found: ${updateQuotationDto.patientId}`,
          );
          throw new NotFoundException(
            `Patient with ID ${updateQuotationDto.patientId} not found`,
          );
        }
      }

      const updatedQuotation = await this.prisma.quotation.update({
        where: { id },
        data: {
          patientId: updateQuotationDto.patientId,
          status: updateQuotationDto.status,
        },
        include: {
          patient: true,
          createdBy: true,
        },
      });
      this.logger.log(`Quotation updated: ${id}`);
      return updatedQuotation;
    } catch (error) {
      this.logger.error(
        `Failed to update quotation ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting quotation with ID: ${id}`);
    try {
      const quotation = await this.prisma.quotation.findUnique({
        where: { id },
      });
      if (!quotation) {
        this.logger.error(`Quotation not found: ${id}`);
        throw new NotFoundException(`Quotation with ID ${id} not found`);
      }

      await this.prisma.quotation.delete({
        where: { id },
      });
      this.logger.log(`Quotation deleted: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete quotation ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
