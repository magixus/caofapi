import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Device } from '@prisma/client';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    this.logger.log(`Creating device: ${createDeviceDto.name}`);
    try {
      const device = await this.prisma.device.create({
        data: createDeviceDto,
      });
      this.logger.log(`Device created with ID: ${device.id}`);
      return device;
    } catch (error) {
      this.logger.error(`Failed to create device: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, type?: string, search?: string): Promise<{ data: Device[]; total: number; page: number; limit: number }> {
    this.logger.log(`Fetching devices - page: ${page}, limit: ${limit}, type: ${type}, search: ${search}`);
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' as const } },
          { reference: { contains: search, mode: 'insensitive' as const } },
          { type: { contains: search, mode: 'insensitive' as const } },
        ];
      }

      const [devices, total] = await Promise.all([
        this.prisma.device.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.device.count({ where }),
      ]);

      this.logger.log(`Retrieved ${devices.length} devices out of ${total}`);
      return { data: devices, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to fetch devices: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Device> {
    this.logger.log(`Fetching device with ID: ${id}`);
    try {
      const device = await this.prisma.device.findUnique({
        where: { id },
        include: {
          ExecutionOrder: {
            include: {
              quotation: {
                include: {
                  patient: true,
                },
              },
            },
          },
        },
      });

      if (!device) {
        this.logger.error(`Device not found: ${id}`);
        throw new NotFoundException(`Device with ID ${id} not found`);
      }

      this.logger.log(`Device retrieved: ${id}`);
      return device;
    } catch (error) {
      this.logger.error(`Failed to fetch device ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    this.logger.log(`Updating device with ID: ${id}`);
    try {
      const device = await this.prisma.device.findUnique({ where: { id } });
      if (!device) {
        this.logger.error(`Device not found: ${id}`);
        throw new NotFoundException(`Device with ID ${id} not found`);
      }

      const updatedDevice = await this.prisma.device.update({
        where: { id },
        data: updateDeviceDto,
      });

      this.logger.log(`Device updated: ${id}`);
      return updatedDevice;
    } catch (error) {
      this.logger.error(`Failed to update device ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting device with ID: ${id}`);
    try {
      const device = await this.prisma.device.findUnique({ where: { id } });
      if (!device) {
        this.logger.error(`Device not found: ${id}`);
        throw new NotFoundException(`Device with ID ${id} not found`);
      }

      await this.prisma.device.delete({ where: { id } });
      this.logger.log(`Device deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete device ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getDeviceTypes(): Promise<string[]> {
    this.logger.log('Fetching unique device types');
    try {
      const devices = await this.prisma.device.findMany({
        select: { type: true },
        distinct: ['type'],
      });

      const types = devices.map((d) => d.type);
      this.logger.log(`Retrieved ${types.length} device types`);
      return types;
    } catch (error) {
      this.logger.error(`Failed to fetch device types: ${error.message}`, error.stack);
      throw error;
    }
  }
}
