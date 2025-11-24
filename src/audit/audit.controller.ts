import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Roles } from '@/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { AuditAction } from '@prisma/client';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles('admin')
  @ApiOperation({ summary: 'Get audit logs (admin only)' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('resource') resource?: string,
    @Query('action') action?: AuditAction,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getAuditLogs({
      userId,
      resource,
      action,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('my-activity')
  @ApiOperation({ summary: 'Get current user activity history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyActivity(@Request() req, @Query('limit') limit?: string) {
    return this.auditService.getUserActivity(
      req.user.userId,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('resource-history')
  @Roles('admin', 'receptionist', 'doctor')
  @ApiOperation({ summary: 'Get resource history' })
  @ApiQuery({ name: 'resource', required: true })
  @ApiQuery({ name: 'resourceId', required: true })
  async getResourceHistory(
    @Query('resource') resource: string,
    @Query('resourceId') resourceId: string,
  ) {
    return this.auditService.getResourceHistory(resource, resourceId);
  }

  @Get('security-events')
  @Roles('admin')
  @ApiOperation({ summary: 'Get security events (unauthorized attempts, access denied)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSecurityEvents(@Query('limit') limit?: string) {
    return this.auditService.getSecurityEvents(limit ? parseInt(limit) : 100);
  }
}
