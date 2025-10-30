import { Controller, Post, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';

@ApiTags('workflow')
@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post('quotations/:id/advance-status')
  @ApiOperation({ summary: 'Move quotation to next workflow stage' })
  @ApiResponse({ status: 200, description: 'Status advanced successfully' })
  advanceStatus(@Param('id') id: string) {
    return this.workflowService.advanceStatus(id);
  }

  @Post('quotations/:id/request-medical-inspection')
  @ApiOperation({ summary: 'Request medical inspection' })
  @ApiResponse({ status: 200, description: 'Medical inspection requested' })
  requestMedicalInspection(@Param('id') id: string) {
    return this.workflowService.requestMedicalInspection(id);
  }

  @Post('quotations/:id/complete-diagnosis')
  @ApiOperation({ summary: 'Mark diagnosis as complete' })
  @ApiResponse({ status: 200, description: 'Diagnosis completed' })
  completeDiagnosis(@Param('id') id: string) {
    return this.workflowService.completeDiagnosis(id);
  }

  @Post('quotations/:id/request-measurements')
  @ApiOperation({ summary: 'Request measurements' })
  @ApiResponse({ status: 200, description: 'Measurements requested' })
  requestMeasurements(@Param('id') id: string) {
    return this.workflowService.requestMeasurements(id);
  }

  @Post('quotations/:id/complete-measurements')
  @ApiOperation({ summary: 'Mark measurements as complete' })
  @ApiResponse({ status: 200, description: 'Measurements completed' })
  completeMeasurements(@Param('id') id: string) {
    return this.workflowService.completeMeasurements(id);
  }

  @Post('quotations/:id/start-fabrication')
  @ApiOperation({ summary: 'Start fabrication' })
  @ApiResponse({ status: 200, description: 'Fabrication started' })
  createFabricationOrder(@Param('id') id: string) {
    return this.workflowService.createFabricationOrder(id);
  }

  @Post('quotations/:id/prepare-materials')
  @ApiOperation({ summary: 'Mark materials as prepared' })
  @ApiResponse({ status: 200, description: 'Materials prepared' })
  prepareMaterials(@Param('id') id: string) {
    return this.workflowService.prepareMaterials(id);
  }

  @Post('quotations/:id/start-execution')
  @ApiOperation({ summary: 'Start execution' })
  @ApiResponse({ status: 200, description: 'Execution started' })
  startExecution(@Param('id') id: string) {
    return this.workflowService.startExecution(id);
  }

  @Post('quotations/:id/mark-in-progress')
  @ApiOperation({ summary: 'Mark execution as in progress' })
  @ApiResponse({ status: 200, description: 'Execution in progress' })
  markInProgress(@Param('id') id: string) {
    return this.workflowService.markExecutionInProgress(id);
  }

  @Post('quotations/:id/mark-produced')
  @ApiOperation({ summary: 'Mark machine as produced' })
  @ApiResponse({ status: 200, description: 'Machine produced' })
  markProduced(@Param('id') id: string) {
    return this.workflowService.markMachineProduced(id);
  }

  @Post('quotations/:id/ready-to-ship')
  @ApiOperation({ summary: 'Mark as ready to ship' })
  @ApiResponse({ status: 200, description: 'Ready to ship' })
  markReadyToShip(@Param('id') id: string) {
    return this.workflowService.markReadyToShip(id);
  }

  @Post('quotations/:id/notify-patient')
  @ApiOperation({ summary: 'Notify patient' })
  @ApiResponse({ status: 200, description: 'Patient notified' })
  notifyPatient(@Param('id') id: string) {
    return this.workflowService.notifyPatient(id);
  }

  @Post('quotations/:id/present-prise-en-charge')
  @ApiOperation({ summary: 'Present prise en charge' })
  @ApiResponse({ status: 200, description: 'Prise en charge presented' })
  presentPriseEnCharge(@Param('id') id: string) {
    return this.workflowService.presentPriseEnCharge(id);
  }

  @Post('quotations/:id/submit')
  @ApiOperation({ summary: 'Submit quotation' })
  @ApiResponse({ status: 200, description: 'Quotation submitted' })
  submit(@Param('id') id: string) {
    return this.workflowService.markSubmitted(id);
  }

  @Post('quotations/:id/mark-paid')
  @ApiOperation({ summary: 'Mark as paid' })
  @ApiResponse({ status: 200, description: 'Marked as paid' })
  markPaid(@Param('id') id: string) {
    return this.workflowService.markPaid(id);
  }

  @Get('quotations/:id/history')
  @ApiOperation({ summary: 'Get workflow history for a quotation' })
  @ApiResponse({ status: 200, description: 'Workflow history' })
  getHistory(@Param('id') id: string) {
    return this.workflowService.getWorkflowHistory(id);
  }
}
