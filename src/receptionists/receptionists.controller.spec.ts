import { Test, TestingModule } from '@nestjs/testing';
import { ReceptionistsController } from './receptionists.controller';

describe('ReceptionistsController', () => {
  let controller: ReceptionistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceptionistsController],
    }).compile();

    controller = module.get<ReceptionistsController>(ReceptionistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
