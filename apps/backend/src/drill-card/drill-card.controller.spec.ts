import { Test, TestingModule } from '@nestjs/testing';
import { DrillCardController } from './drill-card.controller';

describe('DrillCardController', () => {
  let controller: DrillCardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrillCardController],
    }).compile();

    controller = module.get<DrillCardController>(DrillCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
