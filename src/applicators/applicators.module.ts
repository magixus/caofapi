import { Module } from '@nestjs/common';
import { ApplicatorsService } from './applicators.service';
import { ApplicatorsController } from './applicators.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApplicatorsController],
  providers: [ApplicatorsService],
})
export class ApplicatorsModule {}
