import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Component } from '@prisma/client';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';

@Injectable()
export class ComponentsService {
  private readonly logger = new Logger(ComponentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createComponentDto: CreateComponentDto): Promise<Component> {
    this.logger.log(`Creating component: ${createComponentDto.name}`);
    try {
      const component = await this.prisma.component.create({
        data: createComponentDto,
      });
      this.logger.log(`Component created with ID: ${component.id}`);
      return component;
    } catch (error) {
      this.logger.error(`Failed to create component: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, type?: string, search?: string): Promise<{ data: Component[]; total: number; page: number; limit: number }> {
    this.logger.log(`Fetching components - page: ${page}, limit: ${limit}, type: ${type}, search: ${search}`);
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' as const } },
          { type: { contains: search, mode: 'insensitive' as const } },
        ];
      }

      const [components, total] = await Promise.all([
        this.prisma.component.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.component.count({ where }),
      ]);

      this.logger.log(`Retrieved ${components.length} components out of ${total}`);
      return { data: components, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to fetch components: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Component> {
    this.logger.log(`Fetching component with ID: ${id}`);
    try {
      const component = await this.prisma.component.findUnique({
        where: { id },
        include: {
          executionOrderComponents: {
            include: {
              executionOrder: {
                include: {
                  quotation: {
                    include: {
                      patient: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!component) {
        this.logger.error(`Component not found: ${id}`);
        throw new NotFoundException(`Component with ID ${id} not found`);
      }

      this.logger.log(`Component retrieved: ${id}`);
      return component;
    } catch (error) {
      this.logger.error(`Failed to fetch component ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateComponentDto: UpdateComponentDto): Promise<Component> {
    this.logger.log(`Updating component with ID: ${id}`);
    try {
      const component = await this.prisma.component.findUnique({ where: { id } });
      if (!component) {
        this.logger.error(`Component not found: ${id}`);
        throw new NotFoundException(`Component with ID ${id} not found`);
      }

      const updatedComponent = await this.prisma.component.update({
        where: { id },
        data: updateComponentDto,
      });

      this.logger.log(`Component updated: ${id}`);
      return updatedComponent;
    } catch (error) {
      this.logger.error(`Failed to update component ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting component with ID: ${id}`);
    try {
      const component = await this.prisma.component.findUnique({ where: { id } });
      if (!component) {
        this.logger.error(`Component not found: ${id}`);
        throw new NotFoundException(`Component with ID ${id} not found`);
      }

      await this.prisma.component.delete({ where: { id } });
      this.logger.log(`Component deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete component ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getComponentTypes(): Promise<string[]> {
    this.logger.log('Fetching unique component types');
    try {
      const components = await this.prisma.component.findMany({
        select: { type: true },
        distinct: ['type'],
      });

      const types = components.map((c) => c.type);
      this.logger.log(`Retrieved ${types.length} component types`);
      return types;
    } catch (error) {
      this.logger.error(`Failed to fetch component types: ${error.message}`, error.stack);
      throw error;
    }
  }
}
