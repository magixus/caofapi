import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('quotations/stats')
  @ApiOperation({ summary: 'Get quotation statistics' })
  @ApiResponse({ status: 200, description: 'Quotation statistics' })
  getQuotationStats() {
    return this.analyticsService.getQuotationStats();
  }

  @Get('quotations/revenue')
  @ApiOperation({ summary: 'Get revenue statistics' })
  @ApiResponse({ status: 200, description: 'Revenue statistics' })
  getRevenueStats() {
    return this.analyticsService.getRevenueStats();
  }

  @Get('employees/performance')
  @ApiOperation({ summary: 'Get employee performance metrics' })
  @ApiResponse({ status: 200, description: 'Employee performance data' })
  getEmployeePerformance() {
    return this.analyticsService.getEmployeePerformance();
  }
}
