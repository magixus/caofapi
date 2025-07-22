/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  Query,
  Req,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
// import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { join } from 'path';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads', 'drivers'),
        filename: (_, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  create(
    @Body() dto: CreateDriverDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    const images = {
      photoUrl: files?.[0]?.filename ?? null,
      licenseFrontUrl: files?.[1]?.filename ?? null,
      licenseBackUrl: files?.[2]?.filename ?? null,
    };
    return this.driversService.create(dto, req.companyId, images);
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('pageSize', ParseIntPipe) pageSize = 10,
    @Req() req,
  ) {
    return this.driversService.findAll(
      { companyId: req.companyId, isSuperAdmin: req.isSuperAdmin },
      page,
      pageSize,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.driversService.findOne(id, req);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto, @Req() req) {
    return this.driversService.update(id, dto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.driversService.remove(id, req);
  }
}
