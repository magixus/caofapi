import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApplicatorsService } from './applicators.service';
import { CreateApplicatorDto } from './dto/create-applicator.dto';
import { UpdateApplicatorDto } from './dto/update-applicator.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ResourceAccessGuard } from '@/guards/resource-access.guard';
import { RequireResourceRoles } from '@/decorators/resource-roles.decorator';

@ApiTags('applicators')
@ApiBearerAuth()
@Controller('applicators')
@UseGuards(JwtAuthGuard)
export class ApplicatorsController {
  constructor(private readonly applicatorsService: ApplicatorsService) {}

  @Post()
  @UseGuards(ResourceAccessGuard)
  @RequireResourceRoles('employee', 'create', ['admin'])
  @ApiOperation({ summary: 'Create a new applicator (Admin only)' })
  @ApiResponse({ status: 201, description: 'Applicator created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - Only admin can create applicators' })
  @ApiResponse({ status: 409, description: 'Email or certification number already exists' })
  create(@Body() createApplicatorDto: CreateApplicatorDto) {
    return this.applicatorsService.create(createApplicatorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applicators' })
  @ApiResponse({ status: 200, description: 'List of all applicators' })
  findAll() {
    return this.applicatorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get applicator by ID' })
  @ApiResponse({ status: 200, description: 'Applicator details' })
  @ApiResponse({ status: 404, description: 'Applicator not found' })
  findOne(@Param('id') id: string) {
    return this.applicatorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update applicator' })
  @ApiResponse({ status: 200, description: 'Applicator updated successfully' })
  @ApiResponse({ status: 404, description: 'Applicator not found' })
  @ApiResponse({ status: 409, description: 'Email or certification number already exists' })
  update(@Param('id') id: string, @Body() updateApplicatorDto: UpdateApplicatorDto) {
    return this.applicatorsService.update(id, updateApplicatorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete applicator' })
  @ApiResponse({ status: 200, description: 'Applicator deleted successfully' })
  @ApiResponse({ status: 404, description: 'Applicator not found' })
  remove(@Param('id') id: string) {
    return this.applicatorsService.remove(id);
  }
}
