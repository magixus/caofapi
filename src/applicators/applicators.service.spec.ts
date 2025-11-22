import { Test, TestingModule } from '@nestjs/testing';
import { ApplicatorsService } from './applicators.service';

describe('ApplicatorsService', () => {
  let service: ApplicatorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicatorsService],
    }).compile();

    service = module.get<ApplicatorsService>(ApplicatorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
