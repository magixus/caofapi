import { Module } from '@nestjs/common';
import { FinalizedDevicesService } from './finalized-devices.service';
import { FinalizedDevicesController } from './finalized-devices.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinalizedDevicesController],
  providers: [FinalizedDevicesService],
  exports: [FinalizedDevicesService],
})
export class FinalizedDevicesModule {}
