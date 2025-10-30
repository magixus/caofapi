import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Patient, Quotation } from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    this.logger.log(`Creating patient: ${createPatientDto.firstName} ${createPatientDto.lastName}`);
    try {
      const patient = await this.prisma.patient.create({
        data: createPatientDto,
      });
      this.logger.log(`Patient created with ID: ${patient.id}`);
      return patient;
    } catch (error) {
      this.logger.error(`Failed to create patient: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, search?: string): Promise<{ data: Patient[]; total: number; page: number; limit: number }> {
    this.logger.log(`Fetching patients - page: ${page}, limit: ${limit}, search: ${search}`);
    try {
      const skip = (page - 1) * limit;
      const where = search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
              { nationalId: { contains: search, mode: 'insensitive' as const } },
              { socialSecurityNumber: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const [patients, total] = await Promise.all([
        this.prisma.patient.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.patient.count({ where }),
      ]);

      this.logger.log(`Retrieved ${patients.length} patients out of ${total}`);
      return { data: patients, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to fetch patients: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Patient> {
    this.logger.log(`Fetching patient with ID: ${id}`);
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id },
        include: {
          Quotation: {
            include: {
              createdBy: true,
            },
          },
        },
      });

      if (!patient) {
        this.logger.error(`Patient not found: ${id}`);
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }

      this.logger.log(`Patient retrieved: ${id}`);
      return patient;
    } catch (error) {
      this.logger.error(`Failed to fetch patient ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    this.logger.log(`Updating patient with ID: ${id}`);
    try {
      const patient = await this.prisma.patient.findUnique({ where: { id } });
      if (!patient) {
        this.logger.error(`Patient not found: ${id}`);
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }

      const updatedPatient = await this.prisma.patient.update({
        where: { id },
        data: updatePatientDto,
      });

      this.logger.log(`Patient updated: ${id}`);
      return updatedPatient;
    } catch (error) {
      this.logger.error(`Failed to update patient ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting patient with ID: ${id}`);
    try {
      const patient = await this.prisma.patient.findUnique({ where: { id } });
      if (!patient) {
        this.logger.error(`Patient not found: ${id}`);
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }

      await this.prisma.patient.delete({ where: { id } });
      this.logger.log(`Patient deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete patient ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPatientQuotations(id: string): Promise<Quotation[]> {
    this.logger.log(`Fetching quotations for patient: ${id}`);
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id },
        include: {
          Quotation: {
            include: {
              createdBy: true,
              Diagnosis: true,
              FabricationOrder: true,
              ExecutionOrder: true,
              FinalizedDevice: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!patient) {
        this.logger.error(`Patient not found: ${id}`);
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }

      this.logger.log(`Retrieved ${patient.Quotation.length} quotations for patient ${id}`);
      return patient.Quotation;
    } catch (error) {
      this.logger.error(`Failed to fetch quotations for patient ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPatientDevices(id: string) {
    this.logger.log(`Fetching devices for patient: ${id}`);
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id },
        include: {
          Quotation: {
            include: {
              FinalizedDevice: true,
            },
            where: {
              FinalizedDevice: {
                isNot: null,
              },
            },
          },
        },
      });

      if (!patient) {
        this.logger.error(`Patient not found: ${id}`);
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }

      const devices = patient.Quotation.map((q) => q.FinalizedDevice);
      this.logger.log(`Retrieved ${devices.length} devices for patient ${id}`);
      return devices;
    } catch (error) {
      this.logger.error(`Failed to fetch devices for patient ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
