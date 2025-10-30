import { IsString, IsNotEmpty, IsArray, IsOptional, IsDateString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ExecutionOrderComponentDto {
  @ApiProperty({ example: 'component-uuid', description: 'Component ID' })
  @IsString()
  @IsNotEmpty()
  componentId: string;

  @ApiProperty({ example: 2, description: 'Quantity of component' })
  @IsNotEmpty()
  quantity: number;
}

export class CreateExecutionOrderDto {
  @ApiProperty({ example: 'device-uuid', description: 'Device ID' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ type: [ExecutionOrderComponentDto], description: 'Components with quantities' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExecutionOrderComponentDto)
  components: ExecutionOrderComponentDto[];

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z', description: 'Estimated time of arrival' })
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional({ example: 'employee-uuid', description: 'Employee to assign to' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'employee-uuid', description: 'Employee who is assigning' })
  @IsOptional()
  @IsString()
  assignedById?: string;
}
