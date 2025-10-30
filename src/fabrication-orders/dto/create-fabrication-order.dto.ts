import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateFabricationOrderDto {
  @ApiPropertyOptional({ example: 'employee-uuid', description: 'Employee to assign to' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'employee-uuid', description: 'Employee who is assigning' })
  @IsOptional()
  @IsString()
  assignedById?: string;
}
