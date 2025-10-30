import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('photos')
  @ApiOperation({ summary: 'Upload multiple photos' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Photos uploaded successfully' })
  @UseInterceptors(FilesInterceptor('photos', 10))
  uploadPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadsService.uploadPhotos(files);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File details' })
  getFile(@Param('id') id: string) {
    return this.uploadsService.getFile(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file by ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  deleteFile(@Param('id') id: string) {
    return this.uploadsService.deleteFile(id);
  }
}
