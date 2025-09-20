import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  createRole(name: string) {
    return this.prisma.role.create({ data: { name } });
  }

  assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.userRole.create({ data: { userId, roleId } });
  }

  listRoles() {
    return this.prisma.role.findMany({
      // include: {
      //   permissions: true,
      // },
    });
  }
}
