import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReceptionistsService } from './receptionists.service';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';
import { UpdateReceptionistDto } from './dto/update-receptionist.dto';

@ApiTags('receptionists')
@ApiBearerAuth()
@Controller('receptionists')
export class ReceptionistsController {
  constructor(private readonly receptionistsService: ReceptionistsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new receptionist' })
  create(@Body() createReceptionistDto: CreateReceptionistDto) {
    return this.receptionistsService.create(createReceptionistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all receptionists' })
  findAll() {
    return this.receptionistsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a receptionist by ID' })
  findOne(@Param('id') id: string) {
    return this.receptionistsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a receptionist' })
  update(@Param('id') id: string, @Body() updateReceptionistDto: UpdateReceptionistDto) {
    return this.receptionistsService.update(id, updateReceptionistDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a receptionist' })
  remove(@Param('id') id: string) {
    return this.receptionistsService.remove(id);
  }
}
