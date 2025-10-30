import { Module } from '@nestjs/common';
import { ExecutionOrdersService } from './execution-orders.service';
import { ExecutionOrdersController } from './execution-orders.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExecutionOrdersController],
  providers: [ExecutionOrdersService],
  exports: [ExecutionOrdersService],
})
export class ExecutionOrdersModule {}
