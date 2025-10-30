import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ExecutionOrder, ExecutionOrderStatus } from '@prisma/client';
import { CreateExecutionOrderDto } from './dto/create-execution-order.dto';
import { UpdateExecutionOrderDto } from './dto/update-execution-order.dto';
import { AssignExecutionOrderDto } from './dto/assign-execution-order.dto';
import { AddComponentsDto } from './dto/add-components.dto';

@Injectable()
export class ExecutionOrdersService {
  private readonly logger = new Logger(ExecutionOrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    quotationId: string,
    createExecutionOrderDto: CreateExecutionOrderDto,
  ): Promise<ExecutionOrder> {
    this.logger.log(`Creating execution order for quotation: ${quotationId}`);
    try {
      // Check if quotation exists
      const quotation = await this.prisma.quotation.findUnique({
        where: { id: quotationId },
      });

      if (!quotation) {
        throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
      }

      // Validate device exists
      const device = await this.prisma.device.findUnique({
        where: { id: createExecutionOrderDto.deviceId },
      });

      if (!device) {
        throw new NotFoundException(`Device with ID ${createExecutionOrderDto.deviceId} not found`);
      }

      // Validate all components exist
      const componentIds = createExecutionOrderDto.components.map((c) => c.componentId);
      const components = await this.prisma.component.findMany({
        where: { id: { in: componentIds } },
      });

      if (components.length !== componentIds.length) {
        throw new BadRequestException('One or more components not found');
      }

      const data: any = {
        quotationId,
        deviceId: createExecutionOrderDto.deviceId,
        assignedAt: new Date(),
        eta: createExecutionOrderDto.eta ? new Date(createExecutionOrderDto.eta) : null,
      };

      if (createExecutionOrderDto.assignedToId) {
        data.assignedToId = createExecutionOrderDto.assignedToId;
        data.assignedById = createExecutionOrderDto.assignedById;
        data.status = ExecutionOrderStatus.assigned;
      }

      const executionOrder = await this.prisma.executionOrder.create({
        data,
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          device: true,
          components: {
            include: {
              component: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      // Add components
      for (const comp of createExecutionOrderDto.components) {
        await this.prisma.executionOrderComponents.create({
          data: {
            executionOrderId: executionOrder.id,
            componentId: comp.componentId,
            quantity: comp.quantity,
          },
        });
      }

      // Fetch with components included
      const createdOrder = await this.prisma.executionOrder.findUnique({
        where: { id: executionOrder.id },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          device: true,
          components: {
            include: {
              component: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      this.logger.log(`Execution order created with ID: ${executionOrder.id}`);
      return createdOrder!;
    } catch (error) {
      this.logger.error(`Failed to create execution order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(status?: ExecutionOrderStatus): Promise<ExecutionOrder[]> {
    this.logger.log(`Fetching execution orders${status ? ` with status: ${status}` : ''}`);
    try {
      const where = status ? { status } : {};
      const orders = await this.prisma.executionOrder.findMany({
        where,
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          device: true,
          components: {
            include: {
              component: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(`Retrieved ${orders.length} execution orders`);
      return orders;
    } catch (error) {
      this.logger.error(`Failed to fetch execution orders: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<ExecutionOrder> {
    this.logger.log(`Fetching execution order: ${id}`);
    try {
      const order = await this.prisma.executionOrder.findUnique({
        where: { id },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          device: true,
          components: {
            include: {
              component: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Execution order with ID ${id} not found`);
      }

      this.logger.log(`Execution order retrieved: ${id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch execution order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateExecutionOrderDto: UpdateExecutionOrderDto): Promise<ExecutionOrder> {
    this.logger.log(`Updating execution order: ${id}`);
    try {
      const order = await this.prisma.executionOrder.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Execution order with ID ${id} not found`);
      }

      const data: any = {};
      
      if (updateExecutionOrderDto.status) {
        data.status = updateExecutionOrderDto.status;
      }
      if (updateExecutionOrderDto.eta) {
        data.eta = new Date(updateExecutionOrderDto.eta);
      }
      if (updateExecutionOrderDto.deviceId) {
        data.deviceId = updateExecutionOrderDto.deviceId;
      }

      const updatedOrder = await this.prisma.executionOrder.update({
        where: { id },
        data,
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          device: true,
          components: {
            include: {
              component: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      this.logger.log(`Execution order updated: ${id}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to update execution order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateStatus(id: string, status: ExecutionOrderStatus): Promise<ExecutionOrder> {
    this.logger.log(`Updating execution order ${id} status to: ${status}`);
    return this.update(id, { status });
  }

  async assign(id: string, assignDto: AssignExecutionOrderDto): Promise<ExecutionOrder> {
    this.logger.log(`Assigning execution order ${id} to employee ${assignDto.assignedToId}`);
    try {
      // Validate order exists
      const order = await this.prisma.executionOrder.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Execution order with ID ${id} not found`);
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

      const updatedOrder = await this.prisma.executionOrder.update({
        where: { id },
        data: {
          assignedToId: assignDto.assignedToId,
          assignedById: assignDto.assignedById,
          assignedAt: new Date(),
          status: ExecutionOrderStatus.assigned,
        },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          device: true,
          components: {
            include: {
              component: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      this.logger.log(`Execution order assigned: ${id}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to assign execution order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addComponents(id: string, addComponentsDto: AddComponentsDto): Promise<ExecutionOrder> {
    this.logger.log(`Adding components to execution order: ${id}`);
    try {
      const order = await this.prisma.executionOrder.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Execution order with ID ${id} not found`);
      }

      // Validate all components exist
      const componentIds = addComponentsDto.components.map((c) => c.componentId);
      const components = await this.prisma.component.findMany({
        where: { id: { in: componentIds } },
      });

      if (components.length !== componentIds.length) {
        throw new BadRequestException('One or more components not found');
      }

      // Add or update components
      for (const comp of addComponentsDto.components) {
        await this.prisma.executionOrderComponents.upsert({
          where: {
            executionOrderId_componentId: {
              executionOrderId: id,
              componentId: comp.componentId,
            },
          },
          create: {
            executionOrderId: id,
            componentId: comp.componentId,
            quantity: comp.quantity,
          },
          update: {
            quantity: comp.quantity,
          },
        });
      }

      const updatedOrder = await this.prisma.executionOrder.findUnique({
        where: { id },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          device: true,
          components: {
            include: {
              component: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      this.logger.log(`Components added to execution order: ${id}`);
      return updatedOrder!;
    } catch (error) {
      this.logger.error(`Failed to add components: ${error.message}`, error.stack);
      throw error;
    }
  }

  async removeComponent(id: string, componentId: string): Promise<ExecutionOrder> {
    this.logger.log(`Removing component ${componentId} from execution order: ${id}`);
    try {
      const order = await this.prisma.executionOrder.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Execution order with ID ${id} not found`);
      }

      await this.prisma.executionOrderComponents.delete({
        where: {
          executionOrderId_componentId: {
            executionOrderId: id,
            componentId,
          },
        },
      });

      const updatedOrder = await this.prisma.executionOrder.findUnique({
        where: { id },
        include: {
          quotation: {
            include: {
              patient: true,
            },
          },
          device: true,
          components: {
            include: {
              component: true,
            },
          },
          assignedTo: true,
          assignedBy: true,
        },
      });

      this.logger.log(`Component removed from execution order: ${id}`);
      return updatedOrder!;
    } catch (error) {
      this.logger.error(`Failed to remove component: ${error.message}`, error.stack);
      throw error;
    }
  }
}
