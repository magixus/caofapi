import { PartialType } from '@nestjs/swagger';
import { CreateFinalizedDeviceDto } from './create-finalized-device.dto';

export class UpdateFinalizedDeviceDto extends PartialType(CreateFinalizedDeviceDto) {}
