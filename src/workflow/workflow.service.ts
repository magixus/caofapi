import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { QuotationStatus } from '@prisma/client';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(private readonly prisma: PrismaService) {}

  async advanceStatus(quotationId: string): Promise<any> {
    this.logger.log(`Advancing status for quotation: ${quotationId}`);
    try {
      const quotation = await this.prisma.quotation.findUnique({
        where: { id: quotationId },
        include: {
          Diagnosis: true,
          FabricationOrder: true,
          ExecutionOrder: true,
          FinalizedDevice: true,
        },
      });

      if (!quotation) {
        throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
      }

      const nextStatus = this.getNextStatus(quotation.status, quotation);

      if (!nextStatus) {
        throw new BadRequestException(`Cannot advance from status: ${quotation.status}`);
      }

      const updatedQuotation = await this.prisma.quotation.update({
        where: { id: quotationId },
        data: { status: nextStatus },
        include: {
          patient: true,
          createdBy: true,
          Diagnosis: true,
          FabricationOrder: true,
          ExecutionOrder: true,
          FinalizedDevice: true,
        },
      });

      this.logger.log(`Quotation status advanced from ${quotation.status} to ${nextStatus}`);
      return updatedQuotation;
    } catch (error) {
      this.logger.error(`Failed to advance quotation status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async requestMedicalInspection(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.medical_inspection_requested);
  }

  async completeDiagnosis(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.medical_diagnosis_completed);
  }

  async requestMeasurements(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.measurements_requested);
  }

  async completeMeasurements(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.measurements_completed);
  }

  async createFabricationOrder(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.order_fabrication_created);
  }

  async prepareMaterials(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.materials_prepared);
  }

  async createExecutionOrder(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.order_execution_created);
  }

  async startExecution(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.execution_started);
  }

  async markExecutionInProgress(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.execution_in_progress);
  }

  async markMachineProduced(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.machine_produced);
  }

  async markReadyToShip(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.ready_to_ship);
  }

  async notifyPatient(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.patient_notified);
  }

  async presentPriseEnCharge(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.prise_en_charge_present);
  }

  async markSubmitted(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.submitted);
  }

  async markPaid(quotationId: string): Promise<any> {
    return this.updateStatus(quotationId, QuotationStatus.paid);
  }

  async getWorkflowHistory(quotationId: string): Promise<any> {
    this.logger.log(`Fetching workflow history for quotation: ${quotationId}`);
    try {
      const quotation = await this.prisma.quotation.findUnique({
        where: { id: quotationId },
        include: {
          patient: true,
          createdBy: true,
          Diagnosis: {
            include: {
              assignedTo: true,
              assignedBy: true,
            },
          },
          FabricationOrder: {
            include: {
              assignedTo: true,
              assignedBy: true,
            },
          },
          ExecutionOrder: {
            include: {
              assignedTo: true,
              assignedBy: true,
              device: true,
              components: {
                include: {
                  component: true,
                },
              },
            },
          },
          FinalizedDevice: true,
        },
      });

      if (!quotation) {
        throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
      }

      const history = {
        currentStatus: quotation.status,
        created: quotation.createdAt,
        updated: quotation.updatedAt,
        patient: quotation.patient,
        createdBy: quotation.createdBy,
        diagnosis: quotation.Diagnosis,
        fabricationOrder: quotation.FabricationOrder,
        executionOrders: quotation.ExecutionOrder,
        finalizedDevice: quotation.FinalizedDevice,
        timeline: this.buildTimeline(quotation),
      };

      this.logger.log(`Workflow history retrieved for quotation: ${quotationId}`);
      return history;
    } catch (error) {
      this.logger.error(`Failed to fetch workflow history: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async updateStatus(quotationId: string, status: QuotationStatus): Promise<any> {
    this.logger.log(`Updating quotation ${quotationId} to status: ${status}`);
    try {
      const quotation = await this.prisma.quotation.findUnique({
        where: { id: quotationId },
      });

      if (!quotation) {
        throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
      }

      const updatedQuotation = await this.prisma.quotation.update({
        where: { id: quotationId },
        data: { status },
        include: {
          patient: true,
          createdBy: true,
          Diagnosis: true,
          FabricationOrder: true,
          ExecutionOrder: true,
          FinalizedDevice: true,
        },
      });

      this.logger.log(`Quotation status updated to: ${status}`);
      return updatedQuotation;
    } catch (error) {
      this.logger.error(`Failed to update quotation status: ${error.message}`, error.stack);
      throw error;
    }
  }

  private getNextStatus(currentStatus: QuotationStatus, quotation: any): QuotationStatus | null {
    const statusFlow: Record<QuotationStatus, QuotationStatus | null> = {
      [QuotationStatus.created]: QuotationStatus.medical_inspection_requested,
      [QuotationStatus.on_hold]: null,
      [QuotationStatus.medical_inspection_requested]: QuotationStatus.medical_diagnosis_completed,
      [QuotationStatus.medical_diagnosis_completed]: QuotationStatus.measurements_requested,
      [QuotationStatus.measurements_requested]: QuotationStatus.measurements_completed,
      [QuotationStatus.measurements_completed]: QuotationStatus.order_fabrication_created,
      [QuotationStatus.order_fabrication_created]: QuotationStatus.materials_prepared,
      [QuotationStatus.materials_prepared]: QuotationStatus.order_execution_created,
      [QuotationStatus.order_execution_created]: QuotationStatus.execution_started,
      [QuotationStatus.execution_started]: QuotationStatus.execution_in_progress,
      [QuotationStatus.execution_in_progress]: QuotationStatus.machine_produced,
      [QuotationStatus.machine_produced]: QuotationStatus.ready_to_ship,
      [QuotationStatus.ready_to_ship]: QuotationStatus.patient_notified,
      [QuotationStatus.patient_notified]: QuotationStatus.prise_en_charge_present,
      [QuotationStatus.prise_en_charge_present]: QuotationStatus.submitted,
      [QuotationStatus.submitted]: QuotationStatus.paid,
      [QuotationStatus.paid]: null,
    };

    return statusFlow[currentStatus] || null;
  }

  private buildTimeline(quotation: any): any[] {
    const timeline: any[] = [
      {
        status: QuotationStatus.created,
        timestamp: quotation.createdAt,
        description: 'Quotation created',
      },
    ];

    if (quotation.Diagnosis) {
      timeline.push({
        status: QuotationStatus.medical_diagnosis_completed as any,
        timestamp: quotation.Diagnosis.createdAt,
        description: 'Medical diagnosis completed',
        assignedTo: quotation.Diagnosis.assignedTo?.firstName + ' ' + quotation.Diagnosis.assignedTo?.lastName,
      });
    }

    if (quotation.FabricationOrder) {
      timeline.push({
        status: QuotationStatus.order_fabrication_created as any,
        timestamp: quotation.FabricationOrder.createdAt,
        description: 'Fabrication order created',
        assignedTo: quotation.FabricationOrder.assignedTo?.firstName + ' ' + quotation.FabricationOrder.assignedTo?.lastName,
      });
    }

    if (quotation.ExecutionOrder && quotation.ExecutionOrder.length > 0) {
      quotation.ExecutionOrder.forEach((order: any) => {
        timeline.push({
          status: QuotationStatus.order_execution_created as any,
          timestamp: order.createdAt,
          description: `Execution order created for ${order.device.name}`,
          assignedTo: order.assignedTo?.firstName + ' ' + order.assignedTo?.lastName,
        });
      });
    }

    if (quotation.FinalizedDevice) {
      timeline.push({
        status: QuotationStatus.machine_produced as any,
        timestamp: quotation.FinalizedDevice.createdAt,
        description: `Device finalized with serial number: ${quotation.FinalizedDevice.serialNumber}`,
      });
    }

    return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}
