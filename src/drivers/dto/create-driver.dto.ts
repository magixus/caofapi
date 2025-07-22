import {
  IsDateString,
  IsEnum,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateDriverDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsString()
  @Length(18, 18, { message: 'National ID must be exactly 18 digits' })
  @Matches(/^\d+$/, { message: 'National ID must contain only digits' })
  nationalId: string;
  @IsDateString() dateOfBirth: Date;
  @IsString() placeOfBirth: string;
  @IsString() licenseNumber: string;
  @IsDateString() licenseIssuedAt: Date;
  @IsEnum(['biometric', 'paper'])
  licenseType: string;
  @IsString() licenseIssuedPlace: string;
  // Images will be handled via multipart upload
}
