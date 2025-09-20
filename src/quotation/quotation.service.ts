/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/quotations/quotations.service.ts
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Quotation } from '@prisma/client';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createQuotationDto: CreateQuotationDto,
    createdById: string,
  ): Promise<Quotation> {
    this.logger.log(
      `Creating quotation for patient ID: ${createQuotationDto.patientId}`,
    );
    try {
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

      const quotation = await this.prisma.quotation.create({
        data: {
          patientId: createQuotationDto.patientId,
          createdById,
          status: createQuotationDto.status,
        },
        include: {
          patient: true,
          createdBy: true,
        },
      });
      this.logger.log(`Quotation created with ID: ${quotation.id}`);
      return quotation;
    } catch (error) {
      this.logger.error(
        `Failed to create quotation: ${error.message}`,
        error.stack,
      );
      throw error;
    }
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
