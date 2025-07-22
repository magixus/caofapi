/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { BaseService } from '@/common/base.service';

@Injectable()
export class DriversService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(dto, companyId: string, images: Record<string, string>) {
    return this.prisma.driver.create({
      data: {
        ...dto,
        ...images,
        companyId,
        licenseIssuedAt: new Date(dto.licenseIssuedAt),
        dateOfBirth: new Date(dto.dateOfBirth),
      },
    });
  }

  async findAll(
    context: { companyId: string; isSuperAdmin: boolean },
    page = 1,
    pageSize = 10,
  ) {
    const where = this.withCompanyFilter(
      {},
      context.companyId,
      context.isSuperAdmin,
    );
    const [items, total] = await this.prisma.$transaction([
      this.prisma.driver.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: string, context) {
    const where = this.withCompanyFilter(
      { id },
      context.companyId,
      context.isSuperAdmin,
    );
    return this.prisma.driver.findFirst({ where });
  }

  async update(id: string, dto, context) {
    const where = this.withCompanyFilter(
      { id },
      context.companyId,
      context.isSuperAdmin,
    );
    return this.prisma.driver.update({
      where: { id: where.id },
      data: dto,
    });
  }

  async remove(id: string, context) {
    const where = this.withCompanyFilter(
      { id },
      context.companyId,
      context.isSuperAdmin,
    );
    return this.prisma.driver.delete({ where: { id: where.id } });
  }
}
