import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ConfigModule } from '@nestjs/config';
import { EmployeesModule } from './employees/employees.module';
import { SeederModule } from './seeder/seeder.module';
import { QuotationsModule } from './quotations/quotations.module';
import { PatientsModule } from './patients/patients.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { FabricationOrdersModule } from './fabrication-orders/fabrication-orders.module';
import { ExecutionOrdersModule } from './execution-orders/execution-orders.module';
import { DevicesModule } from './devices/devices.module';
import { ComponentsModule } from './components/components.module';
import { FinalizedDevicesModule } from './finalized-devices/finalized-devices.module';
import { WorkflowModule } from './workflow/workflow.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuditModule } from './audit/audit.module';
import { AuditLoggingInterceptor } from './common/interceptors/audit-logging.interceptor';
import { CommonModule } from './common/common.module';
import { DoctorsModule } from './doctors/doctors.module';
import { ReceptionistsModule } from './receptionists/receptionists.module';
import { ApplicatorsModule } from './applicators/applicators.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CommonModule,
    AuditModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    EmployeesModule,
    SeederModule,
    QuotationsModule,
    PatientsModule,
    DiagnosisModule,
    FabricationOrdersModule,
    ExecutionOrdersModule,
    DevicesModule,
    ComponentsModule,
    FinalizedDevicesModule,
    WorkflowModule,
    NotificationsModule,
    DashboardModule,
    AnalyticsModule,
    SearchModule,
    UploadsModule,
    DoctorsModule,
    ReceptionistsModule,
    ApplicatorsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLoggingInterceptor,
    },
  ],
})
export class AppModule {}
