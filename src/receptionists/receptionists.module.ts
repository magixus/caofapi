import { Module } from '@nestjs/common';
import { ReceptionistsService } from './receptionists.service';
import { ReceptionistsController } from './receptionists.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReceptionistsController],
  providers: [ReceptionistsService],
})
export class ReceptionistsModule {}
