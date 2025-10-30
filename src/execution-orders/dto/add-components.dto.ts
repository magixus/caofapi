import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExecutionOrderComponentDto } from './create-execution-order.dto';

export class AddComponentsDto {
  @ApiProperty({ type: [ExecutionOrderComponentDto], description: 'Components with quantities to add' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExecutionOrderComponentDto)
  components: ExecutionOrderComponentDto[];
}
