import { Test, TestingModule } from '@nestjs/testing';
import { ShipService } from './ship.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Ship } from '../generated/prisma/client';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';

describe('ShipService', () => {
  let service: ShipService;
  let prisma: PrismaService;
  let testData: TestData;

  let createdShip: Ship;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShipService, PrismaService],
    }).compile();

    service = module.get<ShipService>(ShipService);
    prisma = module.get<PrismaService>(PrismaService);

    testData = await seedTestDatabase(prisma);
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('ShipService should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // createShip
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createShip', () => {
    it('should create a new ship with the provided data', async () => {
      const data: Prisma.ShipCreateInput = {
        externalId: 'ship_test_new',
        positionX: 3,
        positionY: 1,
        engine: 4,
        shield: 8,
        drill: 6,
      };

      const result = await service.createShip(data);

      expect(result).toBeDefined();
      expect(result.externalId).toBe('ship_test_new');
      expect(result.positionX).toBe(3);
      expect(result.positionY).toBe(1);
      expect(result.engine).toBe(4);
      expect(result.shield).toBe(8);
      expect(result.drill).toBe(6);
      expect(result.engineUpgraded).toBe(false);

      // Verificamos que existe en la BD
      const shipInDb = await prisma.ship.findUnique({
        where: { id: result.id },
      });
      expect(shipInDb).not.toBeNull();

      createdShip = result;
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getShipById
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getShipById', () => {
    it('should return a ship by its ID', async () => {
      const result = await service.getShipById(testData.ship1.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(testData.ship1.id);
      expect(result.externalId).toBe(testData.ship1.externalId);
      expect(result.positionX).toBe(testData.ship1.positionX);
      expect(result.positionY).toBe(testData.ship1.positionY);
    });

    it('should throw P2025 if the ship does not exist', async () => {
      await expect(service.getShipById(999999)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getShips
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getShips', () => {
    it('should return all ships', async () => {
      const result = await service.getShips();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(2);

      const shipIds = result.map((s) => s.id);
      expect(shipIds).toContain(testData.ship1.id);
      expect(shipIds).toContain(testData.ship2.id);
    });

    it('should include the newly created ship', async () => {
      const result = await service.getShips();

      const shipIds = result.map((s) => s.id);
      expect(shipIds).toContain(createdShip.id);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // moveShip
  // ─────────────────────────────────────────────────────────────────────────────

  describe('moveShip', () => {
    it('should update positionX, positionY and externalId of a ship', async () => {
      const newX = 10;
      const newY = 1;
      const newExternalId = 'red_planet_1';

      const result = await service.moveShip(
        createdShip.id,
        newX,
        newY,
        newExternalId,
      );

      expect(result).toBeDefined();
      expect(result.positionX).toBe(newX);
      expect(result.positionY).toBe(newY);
      expect(result.externalId).toBe(newExternalId);

      // Verificamos en la BD
      const shipInDb = await prisma.ship.findUniqueOrThrow({
        where: { id: createdShip.id },
      });
      expect(shipInDb.positionX).toBe(newX);
      expect(shipInDb.positionY).toBe(newY);
      expect(shipInDb.externalId).toBe(newExternalId);

      createdShip = result;
    });

    it('should throw P2025 if the ship does not exist', async () => {
      await expect(
        service.moveShip(999999, 0, 0, 'void_0'),
      ).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // decreaseDrill
  // ─────────────────────────────────────────────────────────────────────────────

  describe('decreaseDrill', () => {
    it('should decrement the drill of a ship by the given cost', async () => {
      await prisma.ship.update({
        where: { id: createdShip.id },
        data: { drill: 8 },
      });

      const result = await service.decreaseDrill(createdShip.id, 3);

      expect(result).toBeDefined();
      expect(result.drill).toBe(5);

      // Verificamos en la BD
      const shipInDb = await prisma.ship.findUniqueOrThrow({
        where: { id: createdShip.id },
      });
      expect(shipInDb.drill).toBe(5);

      createdShip = result;
    });

    it('should allow drill to go below 0 (el servicio no lo limita)', async () => {
      await prisma.ship.update({
        where: { id: createdShip.id },
        data: { drill: 2 },
      });

      const result = await service.decreaseDrill(createdShip.id, 5);

      expect(result.drill).toBe(-3);

      createdShip = result;
    });

    it('should throw P2025 if the ship does not exist', async () => {
      await expect(service.decreaseDrill(999999, 1)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // decreaseShield
  // ─────────────────────────────────────────────────────────────────────────────

  describe('decreaseShield', () => {
    it('should decrement shield by shieldCost when shield - shieldCost >= 0', async () => {
      await prisma.ship.update({
        where: { id: createdShip.id },
        data: { shield: 8 },
      });

      const result = await service.decreaseShield(createdShip.id, 3, 8);

      expect(result).toBeDefined();
      expect(result.shield).toBe(5);

      // Verificamos en la BD
      const shipInDb = await prisma.ship.findUniqueOrThrow({
        where: { id: createdShip.id },
      });
      expect(shipInDb.shield).toBe(5);

      createdShip = result;
    });

    it('should set shield to 0 when shield - shieldCost < 0', async () => {
      await prisma.ship.update({
        where: { id: createdShip.id },
        data: { shield: 2 },
      });

      const result = await service.decreaseShield(createdShip.id, 5, 2);

      expect(result.shield).toBe(0);

      createdShip = result;
    });

    it('should set shield to 0 when shield and shieldCost are equal', async () => {
      await prisma.ship.update({
        where: { id: createdShip.id },
        data: { shield: 4 },
      });

      const result = await service.decreaseShield(createdShip.id, 4, 4);

      expect(result.shield).toBe(0);

      createdShip = result;
    });

    it('should throw P2025 if the ship does not exist', async () => {
      await expect(service.decreaseShield(999999, 1, 5)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });
});
