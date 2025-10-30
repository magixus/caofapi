import { PartialType } from '@nestjs/swagger';
import { CreateExecutionOrderDto } from './create-execution-order.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ExecutionOrderStatus } from '@prisma/client';

export class UpdateExecutionOrderDto extends PartialType(CreateExecutionOrderDto) {
  @ApiPropertyOptional({ enum: ExecutionOrderStatus, description: 'Execution order status' })
  @IsOptional()
  @IsEnum(ExecutionOrderStatus)
  status?: ExecutionOrderStatus;
}
