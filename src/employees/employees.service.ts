import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Get all employees with their type
    const employees = await this.prisma.employee.findMany({
      include: {
        user: {
          select: {
            email: true,
            doctor: true,
            receptionist: true,
            applicator: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to unified employee format
    return employees.map((emp) => {
      const type = emp.type;
      let profile: any = null;

      if (type === 'doctor' && emp.user.doctor) {
        profile = emp.user.doctor;
      } else if (type === 'receptionist' && emp.user.receptionist) {
        profile = emp.user.receptionist;
      } else if (type === 'applicator' && emp.user.applicator) {
        profile = emp.user.applicator;
      }

      return {
        userId: emp.userId,
        type: emp.type,
        email: emp.user.email,
        createdAt: emp.createdAt,
        ...profile,
      };
    });
  }

  async findOne(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            doctor: true,
            receptionist: true,
            applicator: true,
          },
        },
      },
    });
    
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${userId} not found`);
    }

    const type = employee.type;
    let profile: any = null;

    if (type === 'doctor' && employee.user.doctor) {
      profile = employee.user.doctor;
    } else if (type === 'receptionist' && employee.user.receptionist) {
      profile = employee.user.receptionist;
    } else if (type === 'applicator' && employee.user.applicator) {
      profile = employee.user.applicator;
    }

    return {
      userId: employee.userId,
      type: employee.type,
      email: employee.user.email,
      createdAt: employee.createdAt,
      ...profile,
    };
  }

  async findByType(type: string) {
    const employees = await this.prisma.employee.findMany({
      where: { type },
      include: {
        user: {
          select: {
            email: true,
            doctor: true,
            receptionist: true,
            applicator: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return employees.map((emp) => {
      let profile: any = null;

      if (type === 'doctor' && emp.user.doctor) {
        profile = emp.user.doctor;
      } else if (type === 'receptionist' && emp.user.receptionist) {
        profile = emp.user.receptionist;
      } else if (type === 'applicator' && emp.user.applicator) {
        profile = emp.user.applicator;
      }

      return {
        userId: emp.userId,
        type: emp.type,
        email: emp.user.email,
        createdAt: emp.createdAt,
        ...profile,
      };
    });
  }
}
