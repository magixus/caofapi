import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutionOrdersService } from './execution-orders.service';
import { CreateExecutionOrderDto } from './dto/create-execution-order.dto';
import { UpdateExecutionOrderDto } from './dto/update-execution-order.dto';
import { AssignExecutionOrderDto } from './dto/assign-execution-order.dto';
import { AddComponentsDto } from './dto/add-components.dto';
import { ExecutionOrderStatus } from '@prisma/client';

@ApiTags('execution-orders')
@ApiBearerAuth()
@Controller('execution-orders')
export class ExecutionOrdersController {
  constructor(private readonly executionOrdersService: ExecutionOrdersService) {}

  @Post('quotation/:quotationId')
  @ApiOperation({ summary: 'Create an execution order for a quotation' })
  @ApiResponse({ status: 201, description: 'Execution order created successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  create(
    @Param('quotationId') quotationId: string,
    @Body() createExecutionOrderDto: CreateExecutionOrderDto,
  ) {
    return this.executionOrdersService.create(quotationId, createExecutionOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all execution orders' })
  @ApiQuery({ name: 'status', required: false, enum: ExecutionOrderStatus })
  @ApiResponse({ status: 200, description: 'List of execution orders' })
  findAll(@Query('status') status?: ExecutionOrderStatus) {
    return this.executionOrdersService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an execution order by ID' })
  @ApiResponse({ status: 200, description: 'Execution order details' })
  @ApiResponse({ status: 404, description: 'Execution order not found' })
  findOne(@Param('id') id: string) {
    return this.executionOrdersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an execution order' })
  @ApiResponse({ status: 200, description: 'Execution order updated successfully' })
  @ApiResponse({ status: 404, description: 'Execution order not found' })
  update(
    @Param('id') id: string,
    @Body() updateExecutionOrderDto: UpdateExecutionOrderDto,
  ) {
    return this.executionOrdersService.update(id, updateExecutionOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update execution order status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Execution order not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ExecutionOrderStatus },
  ) {
    return this.executionOrdersService.updateStatus(id, body.status);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign execution order to an employee' })
  @ApiResponse({ status: 200, description: 'Execution order assigned successfully' })
  @ApiResponse({ status: 404, description: 'Execution order or Employee not found' })
  assign(
    @Param('id') id: string,
    @Body() assignDto: AssignExecutionOrderDto,
  ) {
    return this.executionOrdersService.assign(id, assignDto);
  }

  @Post(':id/components')
  @ApiOperation({ summary: 'Add or update components in execution order' })
  @ApiResponse({ status: 200, description: 'Components added successfully' })
  @ApiResponse({ status: 404, description: 'Execution order not found' })
  addComponents(
    @Param('id') id: string,
    @Body() addComponentsDto: AddComponentsDto,
  ) {
    return this.executionOrdersService.addComponents(id, addComponentsDto);
  }

  @Delete(':id/components/:componentId')
  @ApiOperation({ summary: 'Remove a component from execution order' })
  @ApiResponse({ status: 200, description: 'Component removed successfully' })
  @ApiResponse({ status: 404, description: 'Execution order not found' })
  removeComponent(
    @Param('id') id: string,
    @Param('componentId') componentId: string,
  ) {
    return this.executionOrdersService.removeComponent(id, componentId);
  }
}
