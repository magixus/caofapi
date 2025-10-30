import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { QuotationStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    this.logger.log('Fetching dashboard overview');
    try {
      const [
        totalQuotations,
        totalPatients,
        totalDevices,
        totalComponents,
        totalEmployees,
        quotationsByStatus,
        recentQuotations,
      ] = await Promise.all([
        this.prisma.quotation.count(),
        this.prisma.patient.count(),
        this.prisma.device.count(),
        this.prisma.component.count(),
        this.prisma.employee.count(),
        this.prisma.quotation.groupBy({
          by: ['status'],
          _count: true,
        }),
        this.prisma.quotation.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            patient: true,
            createdBy: true,
          },
        }),
      ]);

      return {
        totals: {
          quotations: totalQuotations,
          patients: totalPatients,
          devices: totalDevices,
          components: totalComponents,
          employees: totalEmployees,
        },
        quotationsByStatus,
        recentQuotations,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch dashboard overview: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getQuotationsByStatus() {
    this.logger.log('Fetching quotations by status');
    try {
      const quotations = await this.prisma.quotation.groupBy({
        by: ['status'],
        _count: true,
      });

      return quotations.map((q) => ({
        status: q.status,
        count: q._count,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch quotations by status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPendingTasks() {
    this.logger.log('Fetching pending tasks');
    try {
      const [
        unassignedDiagnoses,
        unassignedFabricationOrders,
        unassignedExecutionOrders,
        pendingQuotations,
      ] = await Promise.all([
        this.prisma.diagnosis.count({
          where: { assignedToId: null },
        }),
        this.prisma.fabricationOrder.count({
          where: { assignedToId: null },
        }),
        this.prisma.executionOrder.count({
          where: { assignedToId: null },
        }),
        this.prisma.quotation.count({
          where: {
            status: {
              in: [
                QuotationStatus.created,
                QuotationStatus.medical_inspection_requested,
                QuotationStatus.measurements_requested,
              ],
            },
          },
        }),
      ]);

      return {
        unassignedDiagnoses,
        unassignedFabricationOrders,
        unassignedExecutionOrders,
        pendingQuotations,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch pending tasks: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRecentActivity() {
    this.logger.log('Fetching recent activity');
    try {
      const [recentQuotations, recentDiagnoses, recentFabricationOrders, recentExecutionOrders] =
        await Promise.all([
          this.prisma.quotation.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: {
              patient: true,
              createdBy: true,
            },
          }),
          this.prisma.diagnosis.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: {
              quotation: {
                include: {
                  patient: true,
                },
              },
              assignedTo: true,
            },
          }),
          this.prisma.fabricationOrder.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: {
              quotation: {
                include: {
                  patient: true,
                },
              },
              assignedTo: true,
            },
          }),
          this.prisma.executionOrder.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: {
              quotation: {
                include: {
                  patient: true,
                },
              },
              device: true,
              assignedTo: true,
            },
          }),
        ]);

      return {
        recentQuotations,
        recentDiagnoses,
        recentFabricationOrders,
        recentExecutionOrders,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch recent activity: ${error.message}`, error.stack);
      throw error;
    }
  }
}
