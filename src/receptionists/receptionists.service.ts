import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';
import { UpdateReceptionistDto } from './dto/update-receptionist.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ReceptionistsService {
  constructor(private prisma: PrismaService) {}

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

    // Create user and receptionist in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: createReceptionistDto.email,
          password: hashedPassword,
        },
      });

      // Assign receptionist role to user
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: receptionistRole.id,
        },
      });

      // Create receptionist profile
      const receptionist = await prisma.receptionist.create({
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

      return receptionist;
    });

    return result;
  }

  async findAll() {
    return this.prisma.receptionist.findMany({
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
    const receptionist = await this.prisma.receptionist.findUnique({
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
    if (!receptionist) {
      throw new NotFoundException(`Receptionist with ID ${id} not found`);
    }
    return receptionist;
  }

  async update(id: string, updateReceptionistDto: UpdateReceptionistDto) {
    const receptionist = await this.prisma.receptionist.findUnique({
      where: { id },
    });
    if (!receptionist) {
      throw new NotFoundException(`Receptionist with ID ${id} not found`);
    }

    return this.prisma.receptionist.update({
      where: { id },
      data: {
        firstName: updateReceptionistDto.firstName,
        lastName: updateReceptionistDto.lastName,
        phone: updateReceptionistDto.phone,
        dateOfBirth: updateReceptionistDto.dateOfBirth ? new Date(updateReceptionistDto.dateOfBirth) : undefined,
        gender: updateReceptionistDto.gender,
        address: updateReceptionistDto.address,
        city: updateReceptionistDto.city,
        hireDate: updateReceptionistDto.hireDate ? new Date(updateReceptionistDto.hireDate) : undefined,
        shift: updateReceptionistDto.shift,
        status: updateReceptionistDto.status,
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
    const receptionist = await this.prisma.receptionist.findUnique({
      where: { id },
    });
    if (!receptionist) {
      throw new NotFoundException(`Receptionist with ID ${id} not found`);
    }

    await this.prisma.receptionist.delete({
      where: { id },
    });

    return { message: 'Receptionist deleted successfully' };
  }
}
