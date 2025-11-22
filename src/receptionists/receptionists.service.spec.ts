import { Test, TestingModule } from '@nestjs/testing';
import { ReceptionistsService } from './receptionists.service';

describe('ReceptionistsService', () => {
  let service: ReceptionistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceptionistsService],
    }).compile();

    service = module.get<ReceptionistsService>(ReceptionistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
