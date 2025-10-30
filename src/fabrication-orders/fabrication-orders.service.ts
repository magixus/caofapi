import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FabricationOrder, FabricationOrderStatus } from '@prisma/client';
import { CreateFabricationOrderDto } from './dto/create-fabrication-order.dto';
import { UpdateFabricationOrderDto } from './dto/update-fabrication-order.dto';
import { AssignFabricationOrderDto } from './dto/assign-fabrication-order.dto';

@Injectable()
export class FabricationOrdersService {
  private readonly logger = new Logger(FabricationOrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    quotationId: string,
    createFabricationOrderDto: CreateFabricationOrderDto,
  ): Promise<FabricationOrder> {
    this.logger.log(`Creating fabrication order for quotation: ${quotationId}`);
    try {
      // Check if quotation exists
      const quotation = await this.prisma.quotation.findUnique({
        where: { id: quotationId },
        include: { FabricationOrder: true },
      });

      if (!quotation) {
        throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
      }

      if (quotation.FabricationOrder) {
        throw new BadRequestException(`Fabrication order already exists for quotation ${quotationId}`);
      }

      const data: any = {
        quotationId,
      };

      if (createFabricationOrderDto.assignedToId) {
        data.assignedToId = createFabricationOrderDto.assignedToId;
        data.assignedById = createFabricationOrderDto.assignedById;
        data.assignedAt = new Date();
        data.status = FabricationOrderStatus.assigned;
      }

      const fabricationOrder = await this.prisma.fabricationOrder.create({
        data,
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

      this.logger.log(`Fabrication order created with ID: ${fabricationOrder.id}`);
      return fabricationOrder;
    } catch (error) {
      this.logger.error(`Failed to create fabrication order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(status?: FabricationOrderStatus): Promise<FabricationOrder[]> {
    this.logger.log(`Fetching fabrication orders${status ? ` with status: ${status}` : ''}`);
    try {
      const where = status ? { status } : {};
      const orders = await this.prisma.fabricationOrder.findMany({
        where,
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

      this.logger.log(`Retrieved ${orders.length} fabrication orders`);
      return orders;
    } catch (error) {
      this.logger.error(`Failed to fetch fabrication orders: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<FabricationOrder> {
    this.logger.log(`Fetching fabrication order: ${id}`);
    try {
      const order = await this.prisma.fabricationOrder.findUnique({
        where: { id },
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

      if (!order) {
        throw new NotFoundException(`Fabrication order with ID ${id} not found`);
      }

      this.logger.log(`Fabrication order retrieved: ${id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch fabrication order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByQuotation(quotationId: string): Promise<FabricationOrder> {
    this.logger.log(`Fetching fabrication order for quotation: ${quotationId}`);
    try {
      const order = await this.prisma.fabricationOrder.findUnique({
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

      if (!order) {
        throw new NotFoundException(`Fabrication order not found for quotation ${quotationId}`);
      }

      this.logger.log(`Fabrication order retrieved: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch fabrication order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateFabricationOrderDto: UpdateFabricationOrderDto): Promise<FabricationOrder> {
    this.logger.log(`Updating fabrication order: ${id}`);
    try {
      const order = await this.prisma.fabricationOrder.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Fabrication order with ID ${id} not found`);
      }

      const updatedOrder = await this.prisma.fabricationOrder.update({
        where: { id },
        data: updateFabricationOrderDto,
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

      this.logger.log(`Fabrication order updated: ${id}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to update fabrication order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateStatus(id: string, status: FabricationOrderStatus): Promise<FabricationOrder> {
    this.logger.log(`Updating fabrication order ${id} status to: ${status}`);
    try {
      const order = await this.prisma.fabricationOrder.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Fabrication order with ID ${id} not found`);
      }

      const updatedOrder = await this.prisma.fabricationOrder.update({
        where: { id },
        data: { status },
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

      this.logger.log(`Fabrication order status updated: ${id}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to update fabrication order status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async assign(id: string, assignDto: AssignFabricationOrderDto): Promise<FabricationOrder> {
    this.logger.log(`Assigning fabrication order ${id} to employee ${assignDto.assignedToId}`);
    try {
      // Validate order exists
      const order = await this.prisma.fabricationOrder.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Fabrication order with ID ${id} not found`);
      }

      // Validate employees exist
      const [assignedTo, assignedBy] = await Promise.all([
        this.prisma.employee.findUnique({ where: { id: assignDto.assignedToId } }),
        this.prisma.employee.findUnique({ where: { id: assignDto.assignedById } }),
      ]);

      if (!assignedTo) {
        throw new NotFoundException(`Employee with ID ${assignDto.assignedToId} not found`);
      }
      if (!assignedBy) {
        throw new NotFoundException(`Employee with ID ${assignDto.assignedById} not found`);
      }

      const updatedOrder = await this.prisma.fabricationOrder.update({
        where: { id },
        data: {
          assignedToId: assignDto.assignedToId,
          assignedById: assignDto.assignedById,
          assignedAt: new Date(),
          status: FabricationOrderStatus.assigned,
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

      this.logger.log(`Fabrication order assigned: ${id}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to assign fabrication order: ${error.message}`, error.stack);
      throw error;
    }
  }
}
