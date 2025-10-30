import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FinalizedDevice } from '@prisma/client';
import { CreateFinalizedDeviceDto } from './dto/create-finalized-device.dto';
import { UpdateFinalizedDeviceDto } from './dto/update-finalized-device.dto';

@Injectable()
export class FinalizedDevicesService {
  private readonly logger = new Logger(FinalizedDevicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(quotationId: string, createDto: CreateFinalizedDeviceDto): Promise<FinalizedDevice> {
    this.logger.log(`Creating finalized device for quotation: ${quotationId}`);
    try {
      const quotation = await this.prisma.quotation.findUnique({
        where: { id: quotationId },
        include: { FinalizedDevice: true },
      });

      if (!quotation) {
        throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
      }

      if (quotation.FinalizedDevice) {
        throw new BadRequestException(`Finalized device already exists for quotation ${quotationId}`);
      }

      const finalizedDevice = await this.prisma.finalizedDevice.create({
        data: {
          quotationId,
          serialNumber: createDto.serialNumber,
          photos: createDto.photos || [],
        },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
        },
      });

      this.logger.log(`Finalized device created with ID: ${finalizedDevice.id}`);
      return finalizedDevice;
    } catch (error) {
      this.logger.error(`Failed to create finalized device: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<FinalizedDevice[]> {
    this.logger.log('Fetching all finalized devices');
    try {
      const devices = await this.prisma.finalizedDevice.findMany({
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(`Retrieved ${devices.length} finalized devices`);
      return devices;
    } catch (error) {
      this.logger.error(`Failed to fetch finalized devices: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<FinalizedDevice> {
    this.logger.log(`Fetching finalized device: ${id}`);
    try {
      const device = await this.prisma.finalizedDevice.findUnique({
        where: { id },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
        },
      });

      if (!device) {
        throw new NotFoundException(`Finalized device with ID ${id} not found`);
      }

      this.logger.log(`Finalized device retrieved: ${id}`);
      return device;
    } catch (error) {
      this.logger.error(`Failed to fetch finalized device: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findBySerialNumber(serialNumber: number): Promise<FinalizedDevice> {
    this.logger.log(`Fetching finalized device by serial number: ${serialNumber}`);
    try {
      const device = await this.prisma.finalizedDevice.findFirst({
        where: { serialNumber },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
        },
      });

      if (!device) {
        throw new NotFoundException(`Finalized device with serial number ${serialNumber} not found`);
      }

      this.logger.log(`Finalized device retrieved: ${device.id}`);
      return device;
    } catch (error) {
      this.logger.error(`Failed to fetch finalized device: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateFinalizedDeviceDto): Promise<FinalizedDevice> {
    this.logger.log(`Updating finalized device: ${id}`);
    try {
      const device = await this.prisma.finalizedDevice.findUnique({ where: { id } });
      if (!device) {
        throw new NotFoundException(`Finalized device with ID ${id} not found`);
      }

      const updatedDevice = await this.prisma.finalizedDevice.update({
        where: { id },
        data: updateDto,
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
        },
      });

      this.logger.log(`Finalized device updated: ${id}`);
      return updatedDevice;
    } catch (error) {
      this.logger.error(`Failed to update finalized device: ${error.message}`, error.stack);
      throw error;
    }
  }

  async uploadPhotos(id: string, photos: string[]): Promise<FinalizedDevice> {
    this.logger.log(`Uploading photos to finalized device: ${id}`);
    try {
      const device = await this.prisma.finalizedDevice.findUnique({ where: { id } });
      if (!device) {
        throw new NotFoundException(`Finalized device with ID ${id} not found`);
      }

      const updatedDevice = await this.prisma.finalizedDevice.update({
        where: { id },
        data: {
          photos: [...device.photos, ...photos],
        },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
        },
      });

      this.logger.log(`Photos uploaded to finalized device: ${id}`);
      return updatedDevice;
    } catch (error) {
      this.logger.error(`Failed to upload photos: ${error.message}`, error.stack);
      throw error;
    }
  }
}
