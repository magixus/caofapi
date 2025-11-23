/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        isSuperAdmin: false,
      },
    });

    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  generateTokens(user: any) {
    const roles = user.roles?.map((r: any) => r.role.name) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      roles,
      isSuperAdmin: user.isSuperAdmin,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
    };
  }

  async getAuthenticatedUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        roles: { include: { role: true } },
        employee: true,
        doctor: true,
        receptionist: true,
        applicator: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const roles = user.roles?.map((r: any) => r.role.name) || [];

    // Check if user is an employee and get profile details
    if (user.employee) {
      let employeeProfile: any = null;
      const employeeType = user.employee.type;

      if (employeeType === 'doctor' && user.doctor) {
        const { userId: _, updatedAt, ...doctorData } = user.doctor;
        employeeProfile = {
          type: 'doctor',
          ...doctorData,
        };
      } else if (employeeType === 'receptionist' && user.receptionist) {
        const { userId: _, updatedAt, ...receptionistData } = user.receptionist;
        employeeProfile = {
          type: 'receptionist',
          ...receptionistData,
        };
      } else if (employeeType === 'applicator' && user.applicator) {
        const { userId: _, updatedAt, ...applicatorData } = user.applicator;
        employeeProfile = {
          type: 'applicator',
          ...applicatorData,
        };
      }

      return {
        id: user.id,
        email: user.email,
        roles,
        isSuperAdmin: user.isSuperAdmin,
        createdAt: user.createdAt,
        isEmployee: true,
        employeeType: user.employee.type,
        employee: employeeProfile,
      };
    }

    // Return basic user details if not an employee
    return {
      id: user.id,
      email: user.email,
      roles,
      isSuperAdmin: user.isSuperAdmin,
      createdAt: user.createdAt,
      isEmployee: false,
    };
  }
}
