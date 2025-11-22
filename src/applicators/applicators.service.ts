import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateApplicatorDto } from './dto/create-applicator.dto';
import { UpdateApplicatorDto } from './dto/update-applicator.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApplicatorsService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Get applicator role
    const applicatorRole = await this.prisma.role.findUnique({
      where: { name: 'applicator' },
    });
    if (!applicatorRole) {
      throw new NotFoundException('Applicator role not found');
    }

    // Create user and applicator in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: createApplicatorDto.email,
          password: hashedPassword,
        },
      });

      // Assign applicator role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: applicatorRole.id,
        },
      });

      // Create applicator profile
      const applicator = await tx.applicator.create({
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
      });

      return applicator;
    });

    // Remove userId from response
    const { userId, ...applicatorData } = result;
    return applicatorData;
  }

  async findAll() {
    const applicators = await this.prisma.applicator.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return applicators.map(({ userId, ...applicator }) => applicator);
  }

  async findOne(id: string) {
    const applicator = await this.prisma.applicator.findUnique({
      where: { id },
    });
    if (!applicator) {
      throw new NotFoundException(`Applicator with ID ${id} not found`);
    }
    const { userId, ...applicatorData } = applicator;
    return applicatorData;
  }

  async update(id: string, updateApplicatorDto: UpdateApplicatorDto) {
    const applicator = await this.prisma.applicator.findUnique({
      where: { id },
    });
    if (!applicator) {
      throw new NotFoundException(`Applicator with ID ${id} not found`);
    }

    // Check if email is being changed and already exists
    if (updateApplicatorDto.email && updateApplicatorDto.email !== applicator.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateApplicatorDto.email },
      });
      if (existingUser && existingUser.id !== applicator.userId) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if certification number is being changed and already exists
    if (updateApplicatorDto.certificationNumber && updateApplicatorDto.certificationNumber !== applicator.certificationNumber) {
      const existingApplicator = await this.prisma.applicator.findUnique({
        where: { certificationNumber: updateApplicatorDto.certificationNumber },
      });
      if (existingApplicator && existingApplicator.id !== id) {
        throw new ConflictException('Certification number already exists');
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Update user if email or password changed
      if (updateApplicatorDto.email || updateApplicatorDto.password) {
        const userData: any = {};
        if (updateApplicatorDto.email) {
          userData.email = updateApplicatorDto.email;
        }
        if (updateApplicatorDto.password) {
          userData.password = await bcrypt.hash(updateApplicatorDto.password, 10);
        }
        await tx.user.update({
          where: { id: applicator.userId },
          data: userData,
        });
      }

      // Update applicator profile
      const updateData: any = {};
      if (updateApplicatorDto.firstName) updateData.firstName = updateApplicatorDto.firstName;
      if (updateApplicatorDto.lastName) updateData.lastName = updateApplicatorDto.lastName;
      if (updateApplicatorDto.email) updateData.email = updateApplicatorDto.email;
      if (updateApplicatorDto.phone) updateData.phone = updateApplicatorDto.phone;
      if (updateApplicatorDto.specialization) updateData.specialization = updateApplicatorDto.specialization;
      if (updateApplicatorDto.certificationNumber) updateData.certificationNumber = updateApplicatorDto.certificationNumber;
      if (updateApplicatorDto.dateOfBirth) updateData.dateOfBirth = new Date(updateApplicatorDto.dateOfBirth);
      if (updateApplicatorDto.gender) updateData.gender = updateApplicatorDto.gender;
      if (updateApplicatorDto.address) updateData.address = updateApplicatorDto.address;
      if (updateApplicatorDto.city) updateData.city = updateApplicatorDto.city;
      if (updateApplicatorDto.hireDate) updateData.hireDate = new Date(updateApplicatorDto.hireDate);
      if (updateApplicatorDto.experienceYears !== undefined) updateData.experienceYears = updateApplicatorDto.experienceYears;
      if (updateApplicatorDto.status) updateData.status = updateApplicatorDto.status;

      return await tx.applicator.update({
        where: { id },
        data: updateData,
      });
    });

    const { userId, ...applicatorData } = result;
    return applicatorData;
  }

  async remove(id: string) {
    const applicator = await this.prisma.applicator.findUnique({
      where: { id },
    });
    if (!applicator) {
      throw new NotFoundException(`Applicator with ID ${id} not found`);
    }

    // Delete user (cascade will delete applicator profile)
    await this.prisma.user.delete({
      where: { id: applicator.userId },
    });

    return { message: 'Applicator deleted successfully' };
  }
}
