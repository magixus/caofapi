import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComponentDto {
  @ApiProperty({ example: 'Knee Hinge', description: 'Component name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Metal Hinge', description: 'Component type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 45.99, description: 'Component price' })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
