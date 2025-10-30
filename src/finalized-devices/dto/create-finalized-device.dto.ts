import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFinalizedDeviceDto {
  @ApiProperty({ example: 12345, description: 'Device serial number' })
  @IsNumber()
  @IsNotEmpty()
  serialNumber: number;

  @ApiPropertyOptional({ example: ['final_photo1.jpg', 'final_photo2.jpg'], description: 'Array of photo URLs' })
  @IsArray()
  @IsOptional()
  photos?: string[];
}
