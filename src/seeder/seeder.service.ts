/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for JSON data
interface SeedPermission {
  id?: string; // Optional since it’s generated in create
  action: string;
  resource: string;
  description: string;
}

interface SeedRole {
  id?: string; // Optional since it’s generated in create
  name: string;
}

interface SeedRolePermission {
  id?: string; // Optional since it’s generated in create
  roleName: string;
  permissionActions: string[];
}

interface SeedUser {
  email: string;
  password: string;
  isSuperAdmin: boolean;
  roleNames: string[];
}

interface SeedData {
  roles: SeedRole[];
  permissions: SeedPermission[];
  rolePermissions: SeedRolePermission[];
  users: SeedUser[];
}

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.seedFromJson();
    }
  }

  async seedFromJson() {
    try {
      // Read JSON file
      const filePath = path.join(__dirname, '..', '..', 'data.json');
      const rawData = await fs.readFile(filePath, 'utf-8');
      const seedData = JSON.parse(rawData) as SeedData;

      // Seed permissions
      const permissionRecords: {
        id: string;
        action: string;
        resource: string;
        description: string;
      }[] = [];
      for (const permission of seedData.permissions) {
        const record = await this.prisma.permission.upsert({
          where: {
            action_resource: {
              action: permission.action,
              resource: permission.resource,
            },
          },
          update: {
            description: permission.description,
          },
          create: {
            id: uuidv4(),
            action: permission.action,
            resource: permission.resource,
            description: permission.description,
          },
        });
        permissionRecords.push(record);
      }

      // Seed roles
      const roleRecords: { id: string; name: string }[] = [];
      for (const role of seedData.roles) {
        const record = await this.prisma.role.upsert({
          where: { name: role.name },
          update: {},
          create: {
            id: uuidv4(),
            name: role.name,
          },
        });
        roleRecords.push(record);
      }

      // Clear existing role-permission mappings
      await this.prisma.rolePermission.deleteMany({
        where: {
          roleId: {
            in: roleRecords.map((r) => r.id),
          },
        },
      });

      // Seed role-permissions
      for (const rolePermission of seedData.rolePermissions) {
        const role = roleRecords.find(
          (r) => r.name === rolePermission.roleName,
        );
        if (role) {
          const permissionsToConnect = rolePermission.permissionActions
            .map((actionResource) => {
              const [action, resource] = actionResource.split(':');
              return permissionRecords.find(
                (p) => p.action === action && p.resource === resource,
              );
            })
            .filter((p) => p); // Filter out undefined permissions

          // Create role-permission associations
          for (const permission of permissionsToConnect) {
            try {
              await this.prisma.rolePermission.create({
                data: {
                  id: uuidv4(),
                  roleId: role.id,
                  permissionId: permission!.id,
                },
              });
            } catch (error) {
              // Ignore duplicate key errors (relationship already exists)
              if (!error.code || error.code !== 'P2002') {
                throw error;
              }
            }
          }
        }
      }

      // Clear existing user-role mappings
      await this.prisma.userRole.deleteMany({
        where: {
          user: {
            email: {
              in: seedData.users.map((u) => u.email),
            },
          },
        },
      });

      // Seed users
      for (const user of seedData.users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const rolesToConnect = user.roleNames
          .map((roleName) => roleRecords.find((r) => r.name === roleName))
          .filter((r): r is { id: string; name: string } => !!r); // Type guard to filter out undefined roles

        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
          where: { email: user.email },
          include: { roles: true },
        });

        if (existingUser) {
          // Delete existing user roles first
          await this.prisma.userRole.deleteMany({
            where: { userId: existingUser.id },
          });

          // Update user and create new role associations
          await this.prisma.user.update({
            where: { email: user.email },
            data: {
              isSuperAdmin: user.isSuperAdmin,
              password: hashedPassword,
              roles: {
                create: rolesToConnect.map((role) => ({
                  id: uuidv4(),
                  roleId: role.id,
                })),
              },
            },
          });
        } else {
          // Create new user with roles
          await this.prisma.user.create({
            data: {
              id: uuidv4(),
              email: user.email,
              password: hashedPassword,
              isSuperAdmin: user.isSuperAdmin,
              roles: {
                create: rolesToConnect.map((role) => ({
                  id: uuidv4(),
                  roleId: role.id,
                })),
              },
            },
          });
        }
      }

      this.logger.log('Seeding completed successfully from JSON file');
    } catch (error) {
      this.logger.error('Seeding failed:', error);
      throw error;
    }
  }
}
