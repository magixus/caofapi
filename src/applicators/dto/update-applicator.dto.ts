import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateApplicatorDto } from './create-applicator.dto';

export class UpdateApplicatorDto extends PartialType(
  OmitType(CreateApplicatorDto, ['email', 'password'] as const)
) {}
