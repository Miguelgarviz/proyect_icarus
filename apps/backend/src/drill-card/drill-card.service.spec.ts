import { Test, TestingModule } from '@nestjs/testing';
import { DrillCardService } from './drill-card.service';

describe('DrillCardService', () => {
  let service: DrillCardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DrillCardService],
    }).compile();

    service = module.get<DrillCardService>(DrillCardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
