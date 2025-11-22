import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QuotationsService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ResourceAccessGuard } from '@/guards/resource-access.guard';
import { RequireResourceRoles } from '@/decorators/resource-roles.decorator';

@ApiTags('quotations')
@ApiBearerAuth()
@Controller('quotation')
export class QuotationController {
  constructor(private readonly quotationService: QuotationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, ResourceAccessGuard)
  @RequireResourceRoles('quotation', 'create', ['admin', 'receptionist'])
  @ApiOperation({ 
    summary: 'Create a new quotation (Admin & Receptionist only)',
    description: 'Creates a quotation with auto-generated sequential code (format: CA-YYYYMM0000000001). The createdById is automatically set from the authenticated user. If createdById is provided in body, it will be used instead.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Quotation created successfully with unique code',
    schema: {
      example: {
        id: 'uuid-here',
        code: 'CA-2025110000000001',
        patientId: 'patient-uuid',
        createdById: 'employee-uuid',
        status: 'created',
        createdAt: '2025-11-21T10:30:00.000Z',
        updatedAt: '2025-11-21T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Access denied - Only admin and receptionist can create quotations' })
  create(@Body() createQuotationDto: CreateQuotationDto, @Request() req) {
    // Use createdById from body if provided, otherwise use authenticated user's ID
    const createdById = createQuotationDto.createdById || req.user.userId;
    return this.quotationService.create(createQuotationDto, createdById);
  }

  @Get('count')
  count() {
    return this.quotationService.count();
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotations' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all quotations with codes',
    schema: {
      example: [{
        id: 'uuid-here',
        code: 'CA-2025110000000001',
        patientId: 'patient-uuid',
        createdById: 'employee-uuid',
        status: 'created',
        createdAt: '2025-11-21T10:30:00.000Z',
        updatedAt: '2025-11-21T10:30:00.000Z'
      }]
    }
  })
  findAll() {
    return this.quotationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quotation by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Quotation details including code',
    schema: {
      example: {
        id: 'uuid-here',
        code: 'CA-2025110000000001',
        patientId: 'patient-uuid',
        createdById: 'employee-uuid',
        status: 'created',
        createdAt: '2025-11-21T10:30:00.000Z',
        updatedAt: '2025-11-21T10:30:00.000Z',
        patient: {},
        createdBy: {}
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  findOne(@Param('id') id: string) {
    return this.quotationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuotationDto: UpdateQuotationDto) {
    return this.quotationService.update(id, updateQuotationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotationService.remove(id);
  }
}
