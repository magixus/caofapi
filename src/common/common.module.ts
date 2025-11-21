import { Global, Module } from '@nestjs/common';
import { ResourceAccessGuard } from '@/guards/resource-access.guard';
import { AuditModule } from '@/audit/audit.module';

@Global()
@Module({
  imports: [AuditModule],
  providers: [ResourceAccessGuard],
  exports: [ResourceAccessGuard],
})
export class CommonModule {}
