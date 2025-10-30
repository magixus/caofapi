import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({ example: 'Orthopedic Knee Brace Pro', description: 'Device name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Knee Brace', description: 'Device type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'KBP-2024', description: 'Device reference code' })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({ example: ['Hinge', 'Strap', 'Padding'], description: 'Array of component names' })
  @IsArray()
  @IsNotEmpty()
  components: string[];

  @ApiProperty({ example: 299.99, description: 'Device price' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({ example: ['photo1.jpg', 'photo2.jpg'], description: 'Array of photo URLs' })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiProperty({ 
    example: { length: 30, width: 15, height: 5 }, 
    description: 'Device measurements as JSON object' 
  })
  @IsObject()
  @IsNotEmpty()
  measurements: any;
}
