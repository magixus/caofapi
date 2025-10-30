import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string) {
    this.logger.log(`Performing global search for: ${query}`);
    try {
      const [patients, quotations, devices, components, employees] = await Promise.all([
        this.prisma.patient.findMany({
          where: {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { nationalId: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        this.prisma.quotation.findMany({
          where: {
            patient: {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
          include: { patient: true },
          take: 5,
        }),
        this.prisma.device.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { type: { contains: query, mode: 'insensitive' } },
              { reference: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        this.prisma.component.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { type: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        this.prisma.employee.findMany({
          where: {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
      ]);

      return { patients, quotations, devices, components, employees };
    } catch (error) {
      this.logger.error(`Global search failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
