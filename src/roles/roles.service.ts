/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  createRole(name: string, companyId: string) {
    return this.prisma.role.create({ data: { name, companyId } });
  }

  assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.userRole.create({ data: { userId, roleId } });
  }

  listRoles(companyId: string) {
    return this.prisma.role.findMany({ where: { companyId } });
  }
}
