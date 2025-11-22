import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';
import { UpdateReceptionistDto } from './dto/update-receptionist.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ReceptionistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReceptionistDto: CreateReceptionistDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createReceptionistDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createReceptionistDto.password, 10);

    // Get receptionist role
    const receptionistRole = await this.prisma.role.findUnique({
      where: { name: 'receptionist' },
    });
    if (!receptionistRole) {
      throw new NotFoundException('Receptionist role not found');
    }

    // Create user and receptionist in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: createReceptionistDto.email,
          password: hashedPassword,
        },
      });

      // Assign receptionist role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: receptionistRole.id,
        },
      });

      // Create receptionist profile
      const receptionist = await tx.receptionist.create({
        data: {
          userId: user.id,
          firstName: createReceptionistDto.firstName,
          lastName: createReceptionistDto.lastName,
          email: createReceptionistDto.email,
          phone: createReceptionistDto.phone,
          dateOfBirth: new Date(createReceptionistDto.dateOfBirth),
          gender: createReceptionistDto.gender,
          address: createReceptionistDto.address,
          city: createReceptionistDto.city,
          hireDate: new Date(createReceptionistDto.hireDate),
          shift: createReceptionistDto.shift,
          status: createReceptionistDto.status || 'active',
        },
      });

      return receptionist;
    });

    // Remove userId from response
    const { userId, ...receptionistData } = result;
    return receptionistData;
  }

  async findAll() {
    const receptionists = await this.prisma.receptionist.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return receptionists.map(({ userId, ...receptionist }) => receptionist);
  }

  async findOne(id: string) {
    const receptionist = await this.prisma.receptionist.findUnique({
      where: { id },
    });
    if (!receptionist) {
      throw new NotFoundException(`Receptionist with ID ${id} not found`);
    }
    const { userId, ...receptionistData } = receptionist;
    return receptionistData;
  }

  async update(id: string, updateReceptionistDto: UpdateReceptionistDto) {
    const receptionist = await this.prisma.receptionist.findUnique({
      where: { id },
    });
    if (!receptionist) {
      throw new NotFoundException(`Receptionist with ID ${id} not found`);
    }

    // Check if email is being changed and already exists
    if (updateReceptionistDto.email && updateReceptionistDto.email !== receptionist.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateReceptionistDto.email },
      });
      if (existingUser && existingUser.id !== receptionist.userId) {
        throw new ConflictException('Email already exists');
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Update user if email or password changed
      if (updateReceptionistDto.email || updateReceptionistDto.password) {
        const userData: any = {};
        if (updateReceptionistDto.email) {
          userData.email = updateReceptionistDto.email;
        }
        if (updateReceptionistDto.password) {
          userData.password = await bcrypt.hash(updateReceptionistDto.password, 10);
        }
        await tx.user.update({
          where: { id: receptionist.userId },
          data: userData,
        });
      }

      // Update receptionist profile
      const updateData: any = {};
      if (updateReceptionistDto.firstName) updateData.firstName = updateReceptionistDto.firstName;
      if (updateReceptionistDto.lastName) updateData.lastName = updateReceptionistDto.lastName;
      if (updateReceptionistDto.email) updateData.email = updateReceptionistDto.email;
      if (updateReceptionistDto.phone) updateData.phone = updateReceptionistDto.phone;
      if (updateReceptionistDto.dateOfBirth) updateData.dateOfBirth = new Date(updateReceptionistDto.dateOfBirth);
      if (updateReceptionistDto.gender) updateData.gender = updateReceptionistDto.gender;
      if (updateReceptionistDto.address) updateData.address = updateReceptionistDto.address;
      if (updateReceptionistDto.city) updateData.city = updateReceptionistDto.city;
      if (updateReceptionistDto.hireDate) updateData.hireDate = new Date(updateReceptionistDto.hireDate);
      if (updateReceptionistDto.shift) updateData.shift = updateReceptionistDto.shift;
      if (updateReceptionistDto.status) updateData.status = updateReceptionistDto.status;

      return await tx.receptionist.update({
        where: { id },
        data: updateData,
      });
    });

    const { userId, ...receptionistData } = result;
    return receptionistData;
  }

  async remove(id: string) {
    const receptionist = await this.prisma.receptionist.findUnique({
      where: { id },
    });
    if (!receptionist) {
      throw new NotFoundException(`Receptionist with ID ${id} not found`);
    }

    // Delete user (cascade will delete receptionist profile)
    await this.prisma.user.delete({
      where: { id: receptionist.userId },
    });

    return { message: 'Receptionist deleted successfully' };
  }
}
