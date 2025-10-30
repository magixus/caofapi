import { PartialType } from '@nestjs/swagger';
import { CreateFabricationOrderDto } from './create-fabrication-order.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FabricationOrderStatus } from '@prisma/client';

export class UpdateFabricationOrderDto extends PartialType(CreateFabricationOrderDto) {
  @ApiPropertyOptional({ enum: FabricationOrderStatus, description: 'Fabrication order status' })
  @IsOptional()
  @IsEnum(FabricationOrderStatus)
  status?: FabricationOrderStatus;
}
