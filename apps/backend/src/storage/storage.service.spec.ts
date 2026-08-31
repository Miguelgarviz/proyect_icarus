import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { Storage } from '../generated/prisma/client';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';

describe('StorageService', () => {
  let service: StorageService;
  let prisma: PrismaService;
  let testData: TestData;

  // Helper para obtener el estado actual del storage desde la BD
  const getStorage = (id: number) =>
    prisma.storage.findUniqueOrThrow({ where: { id } });

  // Helper para resetear el storage a unos valores conocidos
  const resetStorage = (
    id: number,
    green: number,
    red: number,
    yellow: number,
  ) => prisma.storage.update({ where: { id }, data: { green, red, yellow } });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService, PrismaService],
    }).compile();

    service = module.get<StorageService>(StorageService);
    prisma = module.get<PrismaService>(PrismaService);

    testData = await seedTestDatabase(prisma);
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('StorageService should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getStorage
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getStorage', () => {
    it('should return a storage by its ID', async () => {
      const result = await service.getStorage(testData.storage1.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(testData.storage1.id);
      expect(result.green).toBe(testData.storage1.green);
      expect(result.red).toBe(testData.storage1.red);
      expect(result.yellow).toBe(testData.storage1.yellow);
    });

    it('should throw P2025 if the storage does not exist', async () => {
      await expect(service.getStorage(999999)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // createStorage
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createStorage', () => {
    it('should create a storage connected to a player', async () => {
      // Necesitamos un player sin storage propio para conectarlo
      const newShip = await prisma.ship.create({
        data: {
          externalId: 'ship_storage_test',
          positionX: 0,
          positionY: 0,
          engine: 5,
          shield: 5,
          drill: 5,
        },
      });
      const newPlayer = await prisma.player.create({
        data: {
          name: 'StorageTestPlayer',
          color: '#aabbcc',
          turnOrder: 99,
          movement: 5,
          lobby: { connect: { id: testData.lobby1.id } },
          ship: { connect: { id: newShip.id } },
        },
      });

      const result = await service.createStorage(newPlayer.id);

      expect(result).toBeDefined();
      expect(result.green).toBe(0);
      expect(result.red).toBe(0);
      expect(result.yellow).toBe(0);

      // Verificamos que existe en la BD
      const storageInDb = await prisma.storage.findUnique({
        where: { id: result.id },
      });
      expect(storageInDb).not.toBeNull();

      // Limpiamos los datos creados
      await prisma.player.delete({ where: { id: newPlayer.id } });
      await prisma.ship.delete({ where: { id: newShip.id } });
      await prisma.storage.delete({ where: { id: result.id } });
    });

    it('should throw P2025 if the player does not exist', async () => {
      await expect(service.createStorage(999999)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // changeMineralsGreenToRed
  // ─────────────────────────────────────────────────────────────────────────────

  describe('changeMineralsGreenToRed', () => {
    it('should decrement green by 7 and increment red by 1', async () => {
      await resetStorage(testData.storage1.id, 14, 2, 0);
      const storage = await getStorage(testData.storage1.id);

      await service.changeMineralsGreenToRed(storage);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.green).toBe(7);
      expect(updated.red).toBe(3);
    });

    it('should allow green to go negative (el servicio no lo limita)', async () => {
      await resetStorage(testData.storage1.id, 3, 0, 0);
      const storage = await getStorage(testData.storage1.id);

      await service.changeMineralsGreenToRed(storage);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.green).toBe(-4);
      expect(updated.red).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // changeMineralsRedToGreen
  // ─────────────────────────────────────────────────────────────────────────────

  describe('changeMineralsRedToGreen', () => {
    it('should increment green by 5 and decrement red by 1 when green + 5 <= 18', async () => {
      await resetStorage(testData.storage1.id, 10, 3, 0);
      const storage = await getStorage(testData.storage1.id);

      await service.changeMineralsRedToGreen(storage);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.green).toBe(15);
      expect(updated.red).toBe(2);
    });

    it('should cap green at 18 when green + 5 > 18', async () => {
      await resetStorage(testData.storage1.id, 16, 3, 0);
      const storage = await getStorage(testData.storage1.id);

      await service.changeMineralsRedToGreen(storage);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.green).toBe(18);
      expect(updated.red).toBe(2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // changeMineralsRedToYellow
  // ─────────────────────────────────────────────────────────────────────────────

  describe('changeMineralsRedToYellow', () => {
    it('should decrement red by 5 and increment yellow by 1', async () => {
      await resetStorage(testData.storage1.id, 0, 8, 1);
      const storage = await getStorage(testData.storage1.id);

      await service.changeMineralsRedToYellow(storage);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.red).toBe(3);
      expect(updated.yellow).toBe(2);
    });

    it('should allow red to go negative (el servicio no lo limita)', async () => {
      await resetStorage(testData.storage1.id, 0, 3, 0);
      const storage = await getStorage(testData.storage1.id);

      await service.changeMineralsRedToYellow(storage);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.red).toBe(-2);
      expect(updated.yellow).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // changeMineralsYellowToRed
  // ─────────────────────────────────────────────────────────────────────────────

  describe('changeMineralsYellowToRed', () => {
    it('should increment red by 3 and decrement yellow by 1 when red + 3 <= 10', async () => {
      await resetStorage(testData.storage1.id, 0, 5, 3);
      const storage = await getStorage(testData.storage1.id);

      await service.changeMineralsYellowToRed(storage);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.red).toBe(8);
      expect(updated.yellow).toBe(2);
    });

    it('should cap red at 10 when red + 3 > 10', async () => {
      await resetStorage(testData.storage1.id, 0, 9, 3);
      const storage = await getStorage(testData.storage1.id);

      await service.changeMineralsYellowToRed(storage);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.red).toBe(10);
      expect(updated.yellow).toBe(2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // addGreenMinerals
  // ─────────────────────────────────────────────────────────────────────────────

  describe('addGreenMinerals', () => {
    it('should increment green by drillCard.greenResources when green + greenResources <= 18', async () => {
      await resetStorage(testData.storage1.id, 5, 0, 0);
      const storage = await getStorage(testData.storage1.id);
      const drillCard = await prisma.drillCard.findFirstOrThrow({
        where: {
          gameId: testData.game.id,
          isSupernovaCard: false,
          greenResources: { gt: 0 },
        },
      });

      await service.addGreenMinerals(storage, drillCard);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.green).toBe(Math.min(5 + drillCard.greenResources, 18));
    });

    it('should cap green at 18 when green + greenResources > 18', async () => {
      await resetStorage(testData.storage1.id, 16, 0, 0);
      const storage = await getStorage(testData.storage1.id);
      const drillCard = await prisma.drillCard.findFirstOrThrow({
        where: {
          gameId: testData.game.id,
          isSupernovaCard: false,
          greenResources: { gte: 4 },
        },
      });

      await service.addGreenMinerals(storage, drillCard);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.green).toBe(18);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // addRedMinerals
  // ─────────────────────────────────────────────────────────────────────────────

  describe('addRedMinerals', () => {
    it('should increment red by drillCard.redResources when red + redResources <= 10', async () => {
      await resetStorage(testData.storage1.id, 0, 2, 0);
      const storage = await getStorage(testData.storage1.id);
      const drillCard = await prisma.drillCard.findFirstOrThrow({
        where: {
          gameId: testData.game.id,
          isSupernovaCard: false,
          redResources: { gt: 0 },
        },
      });

      await service.addRedMinerals(storage, drillCard);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.red).toBe(Math.min(2 + drillCard.redResources, 10));
    });

    it('should cap red at 10 when red + redResources > 10', async () => {
      await resetStorage(testData.storage1.id, 0, 9, 0);
      const storage = await getStorage(testData.storage1.id);
      const drillCard = await prisma.drillCard.findFirstOrThrow({
        where: {
          gameId: testData.game.id,
          isSupernovaCard: false,
          redResources: { gte: 2 },
        },
      });

      await service.addRedMinerals(storage, drillCard);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.red).toBe(10);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // addYellowMinerals
  // ─────────────────────────────────────────────────────────────────────────────

  describe('addYellowMinerals', () => {
    it('should increment yellow by drillCard.yellowResources when yellow + yellowResources <= 10', async () => {
      await resetStorage(testData.storage1.id, 0, 0, 2);
      const storage = await getStorage(testData.storage1.id);
      const drillCard = await prisma.drillCard.findFirstOrThrow({
        where: {
          gameId: testData.game.id,
          isSupernovaCard: false,
          yellowResources: { gt: 0 },
        },
      });

      await service.addYellowMinerals(storage, drillCard);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.yellow).toBe(Math.min(2 + drillCard.yellowResources, 10));
    });

    it('should cap yellow at 10 when yellow + yellowResources > 10', async () => {
      await resetStorage(testData.storage1.id, 0, 0, 9);
      const storage = await getStorage(testData.storage1.id);
      const drillCard = await prisma.drillCard.findFirstOrThrow({
        where: {
          gameId: testData.game.id,
          isSupernovaCard: false,
          yellowResources: { gte: 2 },
        },
      });

      await service.addYellowMinerals(storage, drillCard);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.yellow).toBe(10);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // giveInitialHelp
  // ─────────────────────────────────────────────────────────────────────────────

  describe('giveInitialHelp', () => {
    it('should increment green by 3', async () => {
      await resetStorage(testData.storage1.id, 4, 0, 0);
      const storage = await getStorage(testData.storage1.id);

      await service.giveInitialHelp(storage, testData.player1);

      const updated = await getStorage(testData.storage1.id);
      expect(updated.green).toBe(7);
    });

    it('should set initialHelp to false on the player', async () => {
      await resetStorage(testData.storage1.id, 0, 0, 0);
      // Aseguramos que initialHelp está en true antes de llamar al servicio
      await prisma.player.update({
        where: { id: testData.player1.id },
        data: { initialHelp: true },
      });

      const storage = await getStorage(testData.storage1.id);
      await service.giveInitialHelp(storage, testData.player1);

      const updatedPlayer = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      expect(updatedPlayer.initialHelp).toBe(false);
    });
  });
});
