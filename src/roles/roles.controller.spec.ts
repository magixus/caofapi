import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '@/roles/roles.controller';
import { RolesService } from '@/roles/roles.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [RolesService, PrismaService],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });
});
