import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignExecutionOrderDto {
  @ApiProperty({ example: 'employee-uuid', description: 'Employee ID to assign to' })
  @IsString()
  @IsNotEmpty()
  assignedToId: string;

  @ApiProperty({ example: 'employee-uuid', description: 'Employee ID who is assigning' })
  @IsString()
  @IsNotEmpty()
  assignedById: string;
}
