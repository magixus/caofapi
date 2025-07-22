import { Test, TestingModule } from '@nestjs/testing';
import { DriversController } from '@/drivers/drivers.controller';
import { DriversService } from '@/drivers/drivers.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('DriversController', () => {
  let controller: DriversController;

  const mockDriverService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriversController],
      providers: [
        { provide: DriversService, useValue: mockDriverService },
        PrismaService,
      ],
    }).compile();

    controller = module.get<DriversController>(DriversController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('Should return all drivers', async () => {
      const result = [{ id: 1, name: 'John' }];
      mockDriverService.findAll.mockResolvedValue(result);

      const page = '1';
      const limit = '10';
      const req = {
        compnayId: 1,
        isSuperAdmin: true,
      };

      expect(await controller.findAll(page, limit, req)).toEqual(result);
      expect(mockDriverService.findAll).toHaveBeenCalled();
    });
  });
});
