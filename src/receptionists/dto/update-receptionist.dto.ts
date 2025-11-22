import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateReceptionistDto } from './create-receptionist.dto';

export class UpdateReceptionistDto extends PartialType(
  OmitType(CreateReceptionistDto, ['email', 'password'] as const)
) {}
