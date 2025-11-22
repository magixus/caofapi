import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateApplicatorDto } from './dto/create-applicator.dto';
import { UpdateApplicatorDto } from './dto/update-applicator.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApplicatorsService {
  constructor(private prisma: PrismaService) {}

  async create(createApplicatorDto: CreateApplicatorDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createApplicatorDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Check if certification number already exists
    const existingApplicator = await this.prisma.applicator.findUnique({
      where: { certificationNumber: createApplicatorDto.certificationNumber },
    });
    if (existingApplicator) {
      throw new ConflictException('Certification number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createApplicatorDto.password, 10);

    // Get technician role (applicators use technician role)
    const technicianRole = await this.prisma.role.findUnique({
      where: { name: 'technician' },
    });
    if (!technicianRole) {
      throw new NotFoundException('Technician role not found');
    }

    // Create user and applicator in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: createApplicatorDto.email,
          password: hashedPassword,
        },
      });

      // Assign technician role to user
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: technicianRole.id,
        },
      });

      // Create applicator profile
      const applicator = await prisma.applicator.create({
        data: {
          userId: user.id,
          firstName: createApplicatorDto.firstName,
          lastName: createApplicatorDto.lastName,
          email: createApplicatorDto.email,
          phone: createApplicatorDto.phone,
          specialization: createApplicatorDto.specialization,
          certificationNumber: createApplicatorDto.certificationNumber,
          dateOfBirth: new Date(createApplicatorDto.dateOfBirth),
          gender: createApplicatorDto.gender,
          address: createApplicatorDto.address,
          city: createApplicatorDto.city,
          hireDate: new Date(createApplicatorDto.hireDate),
          experienceYears: createApplicatorDto.experienceYears,
          status: createApplicatorDto.status || 'active',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

      return applicator;
    });

    return result;
  }

  async findAll() {
    return this.prisma.applicator.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const applicator = await this.prisma.applicator.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
    if (!applicator) {
      throw new NotFoundException(`Applicator with ID ${id} not found`);
    }
    return applicator;
  }

  async update(id: string, updateApplicatorDto: UpdateApplicatorDto) {
    const applicator = await this.prisma.applicator.findUnique({
      where: { id },
    });
    if (!applicator) {
      throw new NotFoundException(`Applicator with ID ${id} not found`);
    }

    // Check if certification number is being updated and if it already exists
    if (updateApplicatorDto.certificationNumber) {
      const existingApplicator = await this.prisma.applicator.findUnique({
        where: { certificationNumber: updateApplicatorDto.certificationNumber },
      });
      if (existingApplicator && existingApplicator.id !== id) {
        throw new ConflictException('Certification number already exists');
      }
    }

    return this.prisma.applicator.update({
      where: { id },
      data: {
        firstName: updateApplicatorDto.firstName,
        lastName: updateApplicatorDto.lastName,
        phone: updateApplicatorDto.phone,
        specialization: updateApplicatorDto.specialization,
        certificationNumber: updateApplicatorDto.certificationNumber,
        dateOfBirth: updateApplicatorDto.dateOfBirth ? new Date(updateApplicatorDto.dateOfBirth) : undefined,
        gender: updateApplicatorDto.gender,
        address: updateApplicatorDto.address,
        city: updateApplicatorDto.city,
        hireDate: updateApplicatorDto.hireDate ? new Date(updateApplicatorDto.hireDate) : undefined,
        experienceYears: updateApplicatorDto.experienceYears,
        status: updateApplicatorDto.status,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const applicator = await this.prisma.applicator.findUnique({
      where: { id },
    });
    if (!applicator) {
      throw new NotFoundException(`Applicator with ID ${id} not found`);
    }

    await this.prisma.applicator.delete({
      where: { id },
    });

    return { message: 'Applicator deleted successfully' };
  }
}
