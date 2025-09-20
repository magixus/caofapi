import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Module({
  imports: [PrismaModule],
  providers: [SeederService],
})
export class SeederModule {}
