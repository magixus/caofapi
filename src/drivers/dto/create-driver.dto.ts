import { IsDateString, IsEnum, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsString() nationalId: string;
  @IsDateString() dateOfBirth: string;
  @IsString() placeOfBirth: string;
  @IsString() licenseNumber: string;
  @IsDateString() licenseIssuedAt: string;
  @IsEnum(['biometric', 'paper'])
  licenseType: string;
  @IsString() licenseIssuedPlace: string;
  // Images will be handled via multipart upload
}
