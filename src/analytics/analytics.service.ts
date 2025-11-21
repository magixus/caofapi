import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getQuotationStats() {
    this.logger.log('Fetching quotation statistics');
    try {
      const [total, byStatus, byInsuranceType, avgTimeByStatus] = await Promise.all([
        this.prisma.quotation.count(),
        this.prisma.quotation.groupBy({ by: ['status'], _count: true }),
        this.prisma.quotation.findMany({
          include: { patient: true },
        }).then(quotations => {
          const grouped = quotations.reduce((acc, q) => {
            const type = q.patient.insuranceType || 'None';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(grouped).map(([type, count]) => ({ insuranceType: type, count }));
        }),
        this.calculateAvgTimeByStatus(),
      ]);

      return { total, byStatus, byInsuranceType, avgTimeByStatus };
    } catch (error) {
      this.logger.error(`Failed to fetch quotation stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRevenueStats() {
    this.logger.log('Fetching revenue statistics');
    try {
      const devices = await this.prisma.device.findMany();
      const totalRevenue = devices.reduce((sum, d) => sum + d.price, 0);
      const avgPrice = devices.length > 0 ? totalRevenue / devices.length : 0;
      const byType = devices.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + d.price;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalRevenue,
        avgPrice,
        deviceCount: devices.length,
        revenueByType: Object.entries(byType).map(([type, revenue]) => ({ type, revenue })),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch revenue stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getEmployeePerformance() {
    this.logger.log('Fetching employee performance statistics');
    try {
      const employees = await this.prisma.employee.findMany({
        include: {
          diagnosesAssignedTo: true,
          fabricationOrdersAssignedTo: true,
          executionOrdersAssignedTo: true,
          Quotation: true,
        },
      });

      return employees.map(emp => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        diagnosesCount: emp.diagnosesAssignedTo.length,
        fabricationOrdersCount: emp.fabricationOrdersAssignedTo.length,
        executionOrdersCount: emp.executionOrdersAssignedTo.length,
        quotationsCreated: emp.Quotation.length,
        totalTasks: emp.diagnosesAssignedTo.length + emp.fabricationOrdersAssignedTo.length + emp.executionOrdersAssignedTo.length,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch employee performance: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async calculateAvgTimeByStatus() {
    // Simplified calculation - in production, you'd track status change timestamps
    return [];
  }
}
