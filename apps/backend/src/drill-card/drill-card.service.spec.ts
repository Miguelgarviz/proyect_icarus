import { Test, TestingModule } from '@nestjs/testing';
import { DrillCardService } from './drill-card.service';
import { PrismaService } from '../prisma/prisma.service';
import { DrillCard, Prisma } from '../generated/prisma/client';
import { seedTestDatabase, TestData, clearTestDatabase } from '../../test/test-data';

describe('DrillCardService', () => {
  let service: DrillCardService;
  let prisma: PrismaService;
  let testData: TestData;

  let createdDrillCard: DrillCard;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrillCardService,
        PrismaService,
      ],
    }).compile();

    service = module.get<DrillCardService>(DrillCardService);
    prisma = module.get<PrismaService>(PrismaService);

    testData = await seedTestDatabase(prisma);
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('DrillCardService should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // createDrillCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createDrillCard', () => {
    it('should create a drill card associated to a game', async () => {
      const data: Prisma.DrillCardCreateInput = {
        greenResources: 3,
        redResources: 1,
        yellowResources: 2,
        game: { connect: { id: testData.game.id } },
      };

      const result = await service.createDrillCard(data);

      expect(result).toBeDefined();
      expect(result.greenResources).toBe(3);
      expect(result.redResources).toBe(1);
      expect(result.yellowResources).toBe(2);
      expect(result.gameId).toBe(testData.game.id);
      expect(result.isSupernovaCard).toBe(false);

      // Verificamos que existe en la BD
      const cardInDb = await prisma.drillCard.findUnique({ where: { id: result.id } });
      expect(cardInDb).not.toBeNull();

      createdDrillCard = result;
    });

    it('should create a supernova drill card', async () => {
      const data: Prisma.DrillCardCreateInput = {
        isSupernovaCard: true,
        game: { connect: { id: testData.game.id } },
      };

      const result = await service.createDrillCard(data);

      expect(result).toBeDefined();
      expect(result.isSupernovaCard).toBe(true);
      expect(result.greenResources).toBe(0);
      expect(result.redResources).toBe(0);
      expect(result.yellowResources).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getDrillCardById
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getDrillCardById', () => {
    it('should return a drill card by its ID', async () => {
      const result = await service.getDrillCardById(createdDrillCard.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdDrillCard.id);
      expect(result.greenResources).toBe(createdDrillCard.greenResources);
      expect(result.redResources).toBe(createdDrillCard.redResources);
      expect(result.yellowResources).toBe(createdDrillCard.yellowResources);
    });

    it('should throw P2025 if the drill card does not exist', async () => {
      await expect(service.getDrillCardById(999999)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getDrillCards
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getDrillCards', () => {
    it('should return all drill cards', async () => {
      const result = await service.getDrillCards();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      // La carta que creamos debe estar
      const cardIds = result.map(c => c.id);
      expect(cardIds).toContain(createdDrillCard.id);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // createDrillCardsForGame
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createDrillCardsForGame', () => {
    it('should create 24 drill cards for the given game', async () => {
      const countBefore = await prisma.drillCard.count({ where: { gameId: testData.game.id } });

      await service.createDrillCardsForGame(testData.game.id);

      const countAfter = await prisma.drillCard.count({ where: { gameId: testData.game.id } });
      expect(countAfter).toBe(countBefore + 24);
    });

    it('should create 18 resource cards and 6 supernova cards', async () => {
      const allCards = await prisma.drillCard.findMany({ where: { gameId: testData.game.id } });

      const supernovaCards = allCards.filter(c => c.isSupernovaCard);
      const resourceCards = allCards.filter(c => !c.isSupernovaCard);

      // El seed ya crea algunas, así que verificamos que haya al menos 6 supernova y 18 recurso
      expect(supernovaCards.length).toBeGreaterThanOrEqual(6);
      expect(resourceCards.length).toBeGreaterThanOrEqual(18);
    });

    it('resource cards should have the expected resource values', async () => {
      const resourceCards = await service.getResourceDrillCardsByGame(testData.game.id);

      // Todas las cartas de recurso deben tener al menos un recurso > 0
      resourceCards.forEach(card => {
        const totalResources = card.greenResources + card.redResources + card.yellowResources;
        expect(totalResources).toBeGreaterThan(0);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getDrillCardsByGame
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getDrillCardsByGame', () => {
    it('should return all drill cards for a game', async () => {
      const result = await service.getDrillCardsByGame(testData.game.id);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach(card => expect(card.gameId).toBe(testData.game.id));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getResourceDrillCardsByGame
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getResourceDrillCardsByGame', () => {
    it('should return only non-supernova cards for a game', async () => {
      const result = await service.getResourceDrillCardsByGame(testData.game.id);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach(card => {
        expect(card.isSupernovaCard).toBe(false);
        expect(card.gameId).toBe(testData.game.id);
      });
    });

    it('should not include supernova cards', async () => {
      const supernovaCard = await prisma.drillCard.create({
        data: { gameId: testData.game.id, isSupernovaCard: true },
      });

      const result = await service.getResourceDrillCardsByGame(testData.game.id);
      const cardIds = result.map(c => c.id);

      expect(cardIds).not.toContain(supernovaCard.id);

      // Limpiamos
      await prisma.drillCard.delete({ where: { id: supernovaCard.id } });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getShuffledDrillCard (lógica pura con seed)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getShuffledDrillCard', () => {
    it('should return one drill card from the array', async () => {
      const cards = await service.getDrillCardsByGame(testData.game.id);
      const result = await service.getShuffledDrillCard(cards, 42);

      expect(result).toBeDefined();
      const cardIds = cards.map(c => c.id);
      expect(cardIds).toContain(result.id);
    });

    it('should return the same card with the same seed (determinista)', async () => {
      const cards = await service.getDrillCardsByGame(testData.game.id);

      const result1 = await service.getShuffledDrillCard(cards, 99999);
      const result2 = await service.getShuffledDrillCard(cards, 99999);

      expect(result1.id).toBe(result2.id);
    });

    it('should return different cards with different seeds', async () => {
      const cards = await service.getDrillCardsByGame(testData.game.id);

      if (cards.length < 2) return;

      // Con suficientes intentos, seeds distintas deben dar cartas distintas
      const results = new Set<number>();
      for (let seed = 0; seed < 20; seed++) {
        const card = await service.getShuffledDrillCard(cards, seed);
        results.add(card.id);
      }

      expect(results.size).toBeGreaterThan(1);
    });

    it('should not mutate the original array', async () => {
      const cards = await service.getDrillCardsByGame(testData.game.id);
      const originalIds = cards.map(c => c.id);

      await service.getShuffledDrillCard(cards, 42);

      expect(cards.map(c => c.id)).toEqual(originalIds);
    });
  });
});