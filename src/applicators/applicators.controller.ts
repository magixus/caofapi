import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApplicatorsService } from './applicators.service';
import { CreateApplicatorDto } from './dto/create-applicator.dto';
import { UpdateApplicatorDto } from './dto/update-applicator.dto';

@ApiTags('applicators')
@ApiBearerAuth()
@Controller('applicators')
export class ApplicatorsController {
  constructor(private readonly applicatorsService: ApplicatorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new applicator' })
  create(@Body() createApplicatorDto: CreateApplicatorDto) {
    return this.applicatorsService.create(createApplicatorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applicators' })
  findAll() {
    return this.applicatorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an applicator by ID' })
  findOne(@Param('id') id: string) {
    return this.applicatorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an applicator' })
  update(@Param('id') id: string, @Body() updateApplicatorDto: UpdateApplicatorDto) {
    return this.applicatorsService.update(id, updateApplicatorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an applicator' })
  remove(@Param('id') id: string) {
    return this.applicatorsService.remove(id);
  }
}
