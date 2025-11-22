import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async create(createDoctorDto: CreateDoctorDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createDoctorDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Check if license number already exists
    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { licenseNumber: createDoctorDto.licenseNumber },
    });
    if (existingDoctor) {
      throw new ConflictException('License number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createDoctorDto.password, 10);

    // Get doctor role
    const doctorRole = await this.prisma.role.findUnique({
      where: { name: 'doctor' },
    });
    if (!doctorRole) {
      throw new NotFoundException('Doctor role not found');
    }

    // Create user and doctor in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: createDoctorDto.email,
          password: hashedPassword,
        },
      });

      // Assign doctor role to user
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: doctorRole.id,
        },
      });

      // Create doctor profile
      const doctor = await prisma.doctor.create({
        data: {
          userId: user.id,
          firstName: createDoctorDto.firstName,
          lastName: createDoctorDto.lastName,
          email: createDoctorDto.email,
          phone: createDoctorDto.phone,
          specialization: createDoctorDto.specialization,
          licenseNumber: createDoctorDto.licenseNumber,
          dateOfBirth: new Date(createDoctorDto.dateOfBirth),
          gender: createDoctorDto.gender,
          address: createDoctorDto.address,
          city: createDoctorDto.city,
          hireDate: new Date(createDoctorDto.hireDate),
          status: createDoctorDto.status || 'active',
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

      return doctor;
    });

    return result;
  }

  async findAll() {
    return this.prisma.doctor.findMany({
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
    const doctor = await this.prisma.doctor.findUnique({
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
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    // Check if license number is being updated and if it already exists
    if (updateDoctorDto.licenseNumber) {
      const existingDoctor = await this.prisma.doctor.findUnique({
        where: { licenseNumber: updateDoctorDto.licenseNumber },
      });
      if (existingDoctor && existingDoctor.id !== id) {
        throw new ConflictException('License number already exists');
      }
    }

    return this.prisma.doctor.update({
      where: { id },
      data: {
        firstName: updateDoctorDto.firstName,
        lastName: updateDoctorDto.lastName,
        phone: updateDoctorDto.phone,
        specialization: updateDoctorDto.specialization,
        licenseNumber: updateDoctorDto.licenseNumber,
        dateOfBirth: updateDoctorDto.dateOfBirth ? new Date(updateDoctorDto.dateOfBirth) : undefined,
        gender: updateDoctorDto.gender,
        address: updateDoctorDto.address,
        city: updateDoctorDto.city,
        hireDate: updateDoctorDto.hireDate ? new Date(updateDoctorDto.hireDate) : undefined,
        status: updateDoctorDto.status,
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
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    // Delete doctor (will cascade delete user due to onDelete: Cascade)
    await this.prisma.doctor.delete({
      where: { id },
    });

    return { message: 'Doctor deleted successfully' };
  }
}
