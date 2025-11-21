import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DiagnosisService } from './diagnosis.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { AssignDiagnosisDto } from './dto/assign-diagnosis.dto';

@ApiTags('diagnosis')
@ApiBearerAuth()
@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Get()
  @ApiOperation({ summary: 'Get all diagnoses' })
  @ApiResponse({ status: 200, description: 'List of diagnoses' })
  findAll() {
    return this.diagnosisService.findAll();
  }

  @Post('quotation/:quotationId')
  @ApiOperation({ summary: 'Create a diagnosis for a quotation' })
  @ApiResponse({ status: 201, description: 'Diagnosis created successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  create(
    @Param('quotationId') quotationId: string,
    @Body() createDiagnosisDto: CreateDiagnosisDto,
  ) {
    return this.diagnosisService.create(quotationId, createDiagnosisDto);
  }

  @Get('quotation/:quotationId')
  @ApiOperation({ summary: 'Get diagnosis by quotation ID' })
  @ApiResponse({ status: 200, description: 'Diagnosis details' })
  @ApiResponse({ status: 404, description: 'Diagnosis not found' })
  findByQuotation(@Param('quotationId') quotationId: string) {
    return this.diagnosisService.findByQuotation(quotationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a diagnosis' })
  @ApiResponse({ status: 200, description: 'Diagnosis updated successfully' })
  @ApiResponse({ status: 404, description: 'Diagnosis not found' })
  update(
    @Param('id') id: string,
    @Body() updateDiagnosisDto: UpdateDiagnosisDto,
  ) {
    return this.diagnosisService.update(id, updateDiagnosisDto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign diagnosis to an employee' })
  @ApiResponse({ status: 200, description: 'Diagnosis assigned successfully' })
  @ApiResponse({ status: 404, description: 'Diagnosis or Employee not found' })
  assign(
    @Param('id') id: string,
    @Body() assignDiagnosisDto: AssignDiagnosisDto,
  ) {
    return this.diagnosisService.assign(id, assignDiagnosisDto);
  }

  @Post(':id/upload-photos')
  @ApiOperation({ summary: 'Upload photos to a diagnosis' })
  @ApiResponse({ status: 200, description: 'Photos uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Diagnosis not found' })
  uploadPhotos(
    @Param('id') id: string,
    @Body() body: { photos: string[] },
  ) {
    return this.diagnosisService.uploadPhotos(id, body.photos);
  }
}
