import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReceptionistsService } from './receptionists.service';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';
import { UpdateReceptionistDto } from './dto/update-receptionist.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('receptionists')
@ApiBearerAuth()
@Controller('receptionists')
@UseGuards(JwtAuthGuard)
export class ReceptionistsController {
  constructor(private readonly receptionistsService: ReceptionistsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new receptionist' })
  @ApiResponse({ status: 201, description: 'Receptionist created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() createReceptionistDto: CreateReceptionistDto) {
    return this.receptionistsService.create(createReceptionistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all receptionists' })
  @ApiResponse({ status: 200, description: 'List of all receptionists' })
  findAll() {
    return this.receptionistsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receptionist by ID' })
  @ApiResponse({ status: 200, description: 'Receptionist details' })
  @ApiResponse({ status: 404, description: 'Receptionist not found' })
  findOne(@Param('id') id: string) {
    return this.receptionistsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update receptionist' })
  @ApiResponse({ status: 200, description: 'Receptionist updated successfully' })
  @ApiResponse({ status: 404, description: 'Receptionist not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  update(@Param('id') id: string, @Body() updateReceptionistDto: UpdateReceptionistDto) {
    return this.receptionistsService.update(id, updateReceptionistDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete receptionist' })
  @ApiResponse({ status: 200, description: 'Receptionist deleted successfully' })
  @ApiResponse({ status: 404, description: 'Receptionist not found' })
  remove(@Param('id') id: string) {
    return this.receptionistsService.remove(id);
  }
}
