import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview with key statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard overview data' })
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('quotations-by-status')
  @ApiOperation({ summary: 'Get quotations grouped by status' })
  @ApiResponse({ status: 200, description: 'Quotations by status' })
  getQuotationsByStatus() {
    return this.dashboardService.getQuotationsByStatus();
  }

  @Get('pending-tasks')
  @ApiOperation({ summary: 'Get all pending tasks' })
  @ApiResponse({ status: 200, description: 'Pending tasks' })
  getPendingTasks() {
    return this.dashboardService.getPendingTasks();
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity across all entities' })
  @ApiResponse({ status: 200, description: 'Recent activity' })
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }
}
