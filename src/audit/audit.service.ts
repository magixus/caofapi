import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export interface AuditLogData {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  method?: string;
  endpoint?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'denied' | 'unauthorized' | 'error';
  message: string;
  metadata?: any;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          userEmail: data.userEmail,
          userRole: data.userRole,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          method: data.method,
          endpoint: data.endpoint,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          status: data.status,
          message: data.message,
          metadata: data.metadata || {},
        },
      });
      
      // Also log to console for immediate visibility
      this.logger.log(
        `[${data.status.toUpperCase()}] ${data.action} on ${data.resource} by ${data.userEmail || 'anonymous'}: ${data.message}`
      );
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
    }
  }

  async logUnauthorizedAttempt(
    userId: string,
    userEmail: string,
    userRole: string,
    resource: string,
    action: string,
    endpoint: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId,
      userEmail,
      userRole,
      action: AuditAction.UNAUTHORIZED_ATTEMPT,
      resource,
      endpoint,
      ipAddress,
      status: 'unauthorized',
      message: `User ${userEmail} (${userRole}) attempted to ${action} ${resource} without permission`,
      metadata: { attemptedAction: action },
    });
  }

  async logAccessDenied(
    userId: string,
    userEmail: string,
    userRole: string,
    resource: string,
    requiredRoles: string[],
    endpoint: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId,
      userEmail,
      userRole,
      action: AuditAction.ACCESS_DENIED,
      resource,
      endpoint,
      ipAddress,
      status: 'denied',
      message: `Access denied: User ${userEmail} (${userRole}) attempted to access ${resource}. Required roles: ${requiredRoles.join(', ')}`,
      metadata: { requiredRoles, actualRole: userRole },
    });
  }

  async logSuccess(
    userId: string,
    userEmail: string,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    message?: string,
    metadata?: any,
  ): Promise<void> {
    await this.log({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      status: 'success',
      message: message || `Successfully ${action.toLowerCase()} ${resource}`,
      metadata,
    });
  }

  async getAuditLogs(filters?: {
    userId?: string;
    resource?: string;
    action?: AuditAction;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.action) where.action = filters.action;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserActivity(userId: string, limit = 20) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getResourceHistory(resource: string, resourceId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSecurityEvents(limit = 100) {
    return this.prisma.auditLog.findMany({
      where: {
        OR: [
          { action: AuditAction.UNAUTHORIZED_ATTEMPT },
          { action: AuditAction.ACCESS_DENIED },
          { status: 'denied' },
          { status: 'unauthorized' },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
