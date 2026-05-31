import { Test, TestingModule } from '@nestjs/testing';
import { DrillCardController } from './drill-card.controller';
import { DrillCardService } from './drill-card.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DrillCardController', () => {
  let controller: DrillCardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrillCardController],
      providers: [DrillCardService, PrismaService]
    }).compile();

    controller = module.get<DrillCardController>(DrillCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
