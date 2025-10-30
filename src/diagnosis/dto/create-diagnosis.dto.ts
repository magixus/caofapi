import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiagnosisDto {
  @ApiProperty({ example: 'Detailed medical diagnosis report...', description: 'Diagnosis report' })
  @IsString()
  @IsNotEmpty()
  report: string;

  @ApiProperty({ example: 'Orthopedic Knee Brace', description: 'Recommended medical device' })
  @IsString()
  @IsNotEmpty()
  medicalDevice: string;

  @ApiPropertyOptional({ example: ['photo1.jpg', 'photo2.jpg'], description: 'Array of photo URLs' })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({ example: 'Patient feedback...', description: 'Patient testimonial' })
  @IsString()
  @IsOptional()
  patientTestimonial?: string;
}
