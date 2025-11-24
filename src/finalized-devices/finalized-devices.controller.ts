import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FinalizedDevicesService } from './finalized-devices.service';
import { CreateFinalizedDeviceDto } from './dto/create-finalized-device.dto';
import { UpdateFinalizedDeviceDto } from './dto/update-finalized-device.dto';

@ApiTags('finalized-devices')
@ApiBearerAuth()
@Controller('finalized-devices')
export class FinalizedDevicesController {
  constructor(private readonly finalizedDevicesService: FinalizedDevicesService) {}

  @Post('quotation/:quotationId')
  @ApiOperation({ summary: 'Create a finalized device for a quotation' })
  @ApiResponse({ status: 201, description: 'Finalized device created successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  create(
    @Param('quotationId') quotationId: string,
    @Body() createDto: CreateFinalizedDeviceDto,
  ) {
    return this.finalizedDevicesService.create(quotationId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all finalized devices' })
  @ApiResponse({ status: 200, description: 'List of finalized devices' })
  findAll() {
    return this.finalizedDevicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a finalized device by ID' })
  @ApiResponse({ status: 200, description: 'Finalized device details' })
  @ApiResponse({ status: 404, description: 'Finalized device not found' })
  findOne(@Param('id') id: string) {
    return this.finalizedDevicesService.findOne(id);
  }

  @Get('serial/:serialNumber')
  @ApiOperation({ summary: 'Get a finalized device by serial number' })
  @ApiResponse({ status: 200, description: 'Finalized device details' })
  @ApiResponse({ status: 404, description: 'Finalized device not found' })
  findBySerial(@Param('serialNumber') serialNumber: string) {
    return this.finalizedDevicesService.findBySerialNumber(parseInt(serialNumber, 10));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a finalized device' })
  @ApiResponse({ status: 200, description: 'Finalized device updated successfully' })
  @ApiResponse({ status: 404, description: 'Finalized device not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFinalizedDeviceDto,
  ) {
    return this.finalizedDevicesService.update(id, updateDto);
  }

  @Post(':id/upload-photos')
  @ApiOperation({ summary: 'Upload photos to a finalized device' })
  @ApiResponse({ status: 200, description: 'Photos uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Finalized device not found' })
  uploadPhotos(
    @Param('id') id: string,
    @Body() body: { photos: string[] },
  ) {
    return this.finalizedDevicesService.uploadPhotos(id, body.photos);
  }
}
