import { Test, TestingModule } from '@nestjs/testing';
import { ApplicatorsController } from './applicators.controller';

describe('ApplicatorsController', () => {
  let controller: ApplicatorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicatorsController],
    }).compile();

    controller = module.get<ApplicatorsController>(ApplicatorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
