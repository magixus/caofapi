import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FabricationOrdersService } from './fabrication-orders.service';
import { CreateFabricationOrderDto } from './dto/create-fabrication-order.dto';
import { UpdateFabricationOrderDto } from './dto/update-fabrication-order.dto';
import { AssignFabricationOrderDto } from './dto/assign-fabrication-order.dto';
import { FabricationOrderStatus } from '@prisma/client';

@ApiTags('fabrication-orders')
@ApiBearerAuth()
@Controller('fabrication-orders')
export class FabricationOrdersController {
  constructor(private readonly fabricationOrdersService: FabricationOrdersService) {}

  @Post('quotation/:quotationId')
  @ApiOperation({ summary: 'Create a fabrication order for a quotation' })
  @ApiResponse({ status: 201, description: 'Fabrication order created successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  create(
    @Param('quotationId') quotationId: string,
    @Body() createFabricationOrderDto: CreateFabricationOrderDto,
  ) {
    return this.fabricationOrdersService.create(quotationId, createFabricationOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fabrication orders' })
  @ApiQuery({ name: 'status', required: false, enum: FabricationOrderStatus })
  @ApiResponse({ status: 200, description: 'List of fabrication orders' })
  findAll(@Query('status') status?: FabricationOrderStatus) {
    return this.fabricationOrdersService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a fabrication order by ID' })
  @ApiResponse({ status: 200, description: 'Fabrication order details' })
  @ApiResponse({ status: 404, description: 'Fabrication order not found' })
  findOne(@Param('id') id: string) {
    return this.fabricationOrdersService.findOne(id);
  }

  @Get('quotation/:quotationId')
  @ApiOperation({ summary: 'Get fabrication order by quotation ID' })
  @ApiResponse({ status: 200, description: 'Fabrication order details' })
  @ApiResponse({ status: 404, description: 'Fabrication order not found' })
  findByQuotation(@Param('quotationId') quotationId: string) {
    return this.fabricationOrdersService.findByQuotation(quotationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a fabrication order' })
  @ApiResponse({ status: 200, description: 'Fabrication order updated successfully' })
  @ApiResponse({ status: 404, description: 'Fabrication order not found' })
  update(
    @Param('id') id: string,
    @Body() updateFabricationOrderDto: UpdateFabricationOrderDto,
  ) {
    return this.fabricationOrdersService.update(id, updateFabricationOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update fabrication order status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Fabrication order not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: FabricationOrderStatus },
  ) {
    return this.fabricationOrdersService.updateStatus(id, body.status);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign fabrication order to an employee' })
  @ApiResponse({ status: 200, description: 'Fabrication order assigned successfully' })
  @ApiResponse({ status: 404, description: 'Fabrication order or Employee not found' })
  assign(
    @Param('id') id: string,
    @Body() assignDto: AssignFabricationOrderDto,
  ) {
    return this.fabricationOrdersService.assign(id, assignDto);
  }
}
