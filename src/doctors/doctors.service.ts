import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Generate password if not provided (email prefix + random 4 digits)
    const password = createDoctorDto.password || `${createDoctorDto.email.split('@')[0]}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get doctor role
    const doctorRole = await this.prisma.role.findUnique({
      where: { name: 'doctor' },
    });
    if (!doctorRole) {
      throw new NotFoundException('Doctor role not found');
    }

    // Create user and doctor in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: createDoctorDto.email,
          password: hashedPassword,
        },
      });

      // Assign doctor role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: doctorRole.id,
        },
      });

      // Create employee record
      await tx.employee.create({
        data: {
          userId: user.id,
          type: 'doctor',
        },
      });

      // Create doctor profile
      const doctor = await tx.doctor.create({
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
      });

      return doctor;
    });

    // Remove userId from response
    const { userId, ...doctorData } = result;
    return doctorData;
  }

  async findAll() {
    const doctors = await this.prisma.doctor.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return doctors;
  }

  async findOne(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${userId} not found`);
    }
    return doctor;
  }

  async update(userId: string, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${userId} not found`);
    }

    // Check if email is being changed and already exists
    if (updateDoctorDto.email && updateDoctorDto.email !== doctor.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateDoctorDto.email },
      });
      if (existingUser && existingUser.id !== doctor.userId) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if license number is being changed and already exists
    if (updateDoctorDto.licenseNumber && updateDoctorDto.licenseNumber !== doctor.licenseNumber) {
      const existingDoctor = await this.prisma.doctor.findUnique({
        where: { licenseNumber: updateDoctorDto.licenseNumber },
      });
      if (existingDoctor && existingDoctor.userId !== userId) {
        throw new ConflictException('License number already exists');
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Update user if email or password changed
      if (updateDoctorDto.email || updateDoctorDto.password) {
        const userData: any = {};
        if (updateDoctorDto.email) {
          userData.email = updateDoctorDto.email;
        }
        if (updateDoctorDto.password) {
          userData.password = await bcrypt.hash(updateDoctorDto.password, 10);
        }
        await tx.user.update({
          where: { id: doctor.userId },
          data: userData,
        });
      }

      // Update doctor profile
      const updateData: any = {};
      if (updateDoctorDto.firstName) updateData.firstName = updateDoctorDto.firstName;
      if (updateDoctorDto.lastName) updateData.lastName = updateDoctorDto.lastName;
      if (updateDoctorDto.email) updateData.email = updateDoctorDto.email;
      if (updateDoctorDto.phone) updateData.phone = updateDoctorDto.phone;
      if (updateDoctorDto.specialization) updateData.specialization = updateDoctorDto.specialization;
      if (updateDoctorDto.licenseNumber) updateData.licenseNumber = updateDoctorDto.licenseNumber;
      if (updateDoctorDto.dateOfBirth) updateData.dateOfBirth = new Date(updateDoctorDto.dateOfBirth);
      if (updateDoctorDto.gender) updateData.gender = updateDoctorDto.gender;
      if (updateDoctorDto.address) updateData.address = updateDoctorDto.address;
      if (updateDoctorDto.city) updateData.city = updateDoctorDto.city;
      if (updateDoctorDto.hireDate) updateData.hireDate = new Date(updateDoctorDto.hireDate);
      if (updateDoctorDto.status) updateData.status = updateDoctorDto.status;

      return await tx.doctor.update({
        where: { userId },
        data: updateData,
      });
    });

    return result;
  }

  async remove(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${userId} not found`);
    }

    // Delete user (cascade will delete doctor profile and employee record)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Doctor deleted successfully' };
  }
}
