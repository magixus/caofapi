import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';

@ApiTags('components')
@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new component' })
  @ApiResponse({ status: 201, description: 'Component created successfully' })
  create(@Body() createComponentDto: CreateComponentDto) {
    return this.componentsService.create(createComponentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all components with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of components' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.componentsService.findAll(pageNum, limitNum, type, search);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all unique component types' })
  @ApiResponse({ status: 200, description: 'List of component types' })
  getComponentTypes() {
    return this.componentsService.getComponentTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a component by ID' })
  @ApiResponse({ status: 200, description: 'Component details' })
  @ApiResponse({ status: 404, description: 'Component not found' })
  findOne(@Param('id') id: string) {
    return this.componentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a component' })
  @ApiResponse({ status: 200, description: 'Component updated successfully' })
  @ApiResponse({ status: 404, description: 'Component not found' })
  update(@Param('id') id: string, @Body() updateComponentDto: UpdateComponentDto) {
    return this.componentsService.update(id, updateComponentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a component' })
  @ApiResponse({ status: 200, description: 'Component deleted successfully' })
  @ApiResponse({ status: 404, description: 'Component not found' })
  remove(@Param('id') id: string) {
    return this.componentsService.remove(id);
  }
}
