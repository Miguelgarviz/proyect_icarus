import { Test, TestingModule } from '@nestjs/testing';
import { TileController } from './tile.controller';
import { TileService } from './tile.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TileController', () => {
  let controller: TileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TileController],
      providers: [TileService, PrismaService]
    }).compile();

    controller = module.get<TileController>(TileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
function expect(controller: TileController) {
  throw new Error('Function not implemented.');
}

