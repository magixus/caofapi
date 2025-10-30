import { Module } from '@nestjs/common';
import { QuotationsService } from './quotation.service';
import { QuotationController } from './quotation.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuotationController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationModule {}
