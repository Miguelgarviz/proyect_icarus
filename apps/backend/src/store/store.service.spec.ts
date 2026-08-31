import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  clearTestDatabase,
  seedTestDatabase,
  TestData,
} from '../../test/test-data';

describe('StoreService', () => {
  let service: StoreService;
  let prisma: PrismaService;
  let testData: TestData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreService, PrismaService],
    }).compile();

    service = module.get<StoreService>(StoreService);
    prisma = module.get<PrismaService>(PrismaService);

    testData = await seedTestDatabase(prisma);
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStore', () => {
    it('should create a store correctly', async () => {
      const data = {
        numCards: 18,
      };
      const result = await service.createStore(data);

      expect(result).toBeDefined();
      expect(result.numCards).toBe(18);

      const storeinDb = await prisma.store.findUniqueOrThrow({
        where: { id: result.id },
      });
      expect(storeinDb).not.toBeNull();
    });
  });

  describe('getStore', () => {
    it('should return a store by his id', async () => {
      const store = await service.getStore({ id: testData.store1.id });

      expect(store).toBeDefined();
      expect(store.id).toBe(testData.store1.id);
      expect(store.numCards).toBe(testData.store1.numCards);
    });
    it('should throw an error if the store doesnt exists', async () => {
      await expect(service.getStore({ id: 9999999 })).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });
});
