/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  createPermission(action: string, resource: string, description: string) {
    return this.prisma.permission.create({ data: { action, resource, description } });
  }

  assignPermissionToRole(permissionId: string, roleId: string) {
    return this.prisma.rolePermission.create({
      data: { permissionId, roleId },
    });
  }

  getPermissionsForRole(roleId: string) {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }
}
