import { Module } from '@nestjs/common';
import { FabricationOrdersService } from './fabrication-orders.service';
import { FabricationOrdersController } from './fabrication-orders.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FabricationOrdersController],
  providers: [FabricationOrdersService],
  exports: [FabricationOrdersService],
})
export class FabricationOrdersModule {}
