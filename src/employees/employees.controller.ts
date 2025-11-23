import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';

@ApiTags('employees')
@Controller('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees (doctors, receptionists, applicators)' })
  @ApiQuery({ name: 'type', required: false, enum: ['doctor', 'receptionist', 'applicator'], description: 'Filter by employee type' })
  @ApiResponse({ status: 200, description: 'List of all employees with their profiles' })
  findAll(@Query('type') type?: string) {
    if (type) {
      return this.employeesService.findByType(type);
    }
    return this.employeesService.findAll();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get employee by userId' })
  @ApiResponse({ status: 200, description: 'Employee details with profile' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('userId') userId: string) {
    return this.employeesService.findOne(userId);
  }
}
