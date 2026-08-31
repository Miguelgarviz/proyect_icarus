import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { PrismaService } from '../prisma/prisma.service';
import { Card, CardType, Prisma } from '../generated/prisma/client';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';
import { DrillCardService } from '../drill-card/drill-card.service';

describe('CardService', () => {
  let service: CardService;
  let prisma: PrismaService;
  let testData: TestData;

  let createdCard: Card;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardService, PrismaService, DrillCardService],
    }).compile();

    service = module.get<CardService>(CardService);
    prisma = module.get<PrismaService>(PrismaService);

    testData = await seedTestDatabase(prisma);
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('CardService should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // createCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createCard', () => {
    it('should create a new card associated to a store', async () => {
      const data: Prisma.CardCreateInput = {
        type: CardType.BACKUP_POWER,
        cost: 1,
        store: { connect: { id: testData.store1.id } },
      };

      const result = await service.createCard(data);

      expect(result).toBeDefined();
      expect(result.type).toBe(CardType.BACKUP_POWER);
      expect(result.cost).toBe(1);
      expect(result.storeId).toBe(testData.store1.id);

      // Verificamos que existe en la BD
      const cardInDb = await prisma.card.findUnique({
        where: { id: result.id },
      });
      expect(cardInDb).not.toBeNull();

      createdCard = result;
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getCard', () => {
    it('should get a card by its ID', async () => {
      const result = await service.getCard(createdCard.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdCard.id);
      expect(result.type).toBe(createdCard.type);
      expect(result.cost).toBe(createdCard.cost);
    });

    it('should throw P2025 if the card does not exist', async () => {
      await expect(service.getCard(999999)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // createCardsForStore
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createCardsForStore', () => {
    it('should create the specified number of cards for a store', async () => {
      const numCards = 3;
      const cardData = { type: CardType.NEW_DRILL, cost: 2 };

      const cardsBefore = await prisma.card.count({
        where: { storeId: testData.store1.id },
      });

      await service.createCardsForStore(testData.store1.id, numCards, cardData);

      const cardsAfter = await prisma.card.count({
        where: { storeId: testData.store1.id },
      });

      expect(cardsAfter).toBe(cardsBefore + numCards);

      // Verificamos que las cartas creadas tienen el tipo y coste correctos
      const newCards = await prisma.card.findMany({
        where: {
          storeId: testData.store1.id,
          type: CardType.NEW_DRILL,
          cost: 2,
        },
      });
      expect(newCards.length).toBeGreaterThanOrEqual(numCards);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getCardsByStore
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getCardsByStore', () => {
    it('should return cards from the store that are not in the storefront and not discarded', async () => {
      const result = await service.getCardsByStore(testData.store1.id);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((card) => {
        expect(card.inFrontStore).toBe(false);
        expect(card.isDiscarded).toBe(false);
        expect(card.storeId).toBe(testData.store1.id);
      });
    });

    it('should not return cards that are in the storefront', async () => {
      // Ponemos una carta en el storefront
      await prisma.card.update({
        where: { id: createdCard.id },
        data: { inFrontStore: true },
      });

      const result = await service.getCardsByStore(testData.store1.id);
      const cardIds = result.map((c) => c.id);

      expect(cardIds).not.toContain(createdCard.id);

      // Restauramos
      await prisma.card.update({
        where: { id: createdCard.id },
        data: { inFrontStore: false },
      });
    });

    it('should not return discarded cards', async () => {
      // Descartamos la carta
      await prisma.card.update({
        where: { id: createdCard.id },
        data: { isDiscarded: true },
      });

      const result = await service.getCardsByStore(testData.store1.id);
      const cardIds = result.map((c) => c.id);

      expect(cardIds).not.toContain(createdCard.id);

      // Restauramos
      await prisma.card.update({
        where: { id: createdCard.id },
        data: { isDiscarded: false },
      });
    });

    it('should return cards ordered by id ascending', async () => {
      const result = await service.getCardsByStore(testData.store1.id);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].id).toBeGreaterThan(result[i - 1].id);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // shuffleCardsWithSeed (lógica pura, sin BD)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('shuffleCardsWithSeed', () => {
    it('should return the same number of cards after shuffling', async () => {
      const cards = await service.getCardsByStore(testData.store1.id);
      const shuffled = service.shuffleCardsWithSeed(cards, 42);

      expect(shuffled.length).toBe(cards.length);
    });

    it('should return the same cards in a different order with the same seed', async () => {
      const cards = await service.getCardsByStore(testData.store1.id);
      const shuffled1 = service.shuffleCardsWithSeed(cards, 12345);
      const shuffled2 = service.shuffleCardsWithSeed(cards, 12345);

      // Con la misma seed el resultado es determinista
      expect(shuffled1.map((c) => c.id)).toEqual(shuffled2.map((c) => c.id));
    });

    it('should produce a different order with a different seed', async () => {
      const cards = await service.getCardsByStore(testData.store1.id);

      if (cards.length < 2) return; // No tiene sentido con menos de 2 cartas

      const shuffled1 = service.shuffleCardsWithSeed(cards, 1);
      const shuffled2 = service.shuffleCardsWithSeed(cards, 9999);

      // Es estadísticamente imposible que dos seeds distintas produzcan el mismo orden
      expect(shuffled1.map((c) => c.id)).not.toEqual(
        shuffled2.map((c) => c.id),
      );
    });

    it('should not mutate the original array', async () => {
      const cards = await service.getCardsByStore(testData.store1.id);
      const originalIds = cards.map((c) => c.id);

      service.shuffleCardsWithSeed(cards, 42);

      expect(cards.map((c) => c.id)).toEqual(originalIds);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // setCardToStorefront
  // ─────────────────────────────────────────────────────────────────────────────

  describe('setCardToStorefront', () => {
    it('should set inFrontStore to true for the given card', async () => {
      await service.setCardToStorefront(createdCard);

      const updatedCard = await prisma.card.findUniqueOrThrow({
        where: { id: createdCard.id },
      });
      expect(updatedCard.inFrontStore).toBe(true);

      createdCard = updatedCard;
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getStorefrontCards
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getStorefrontCards', () => {
    it('should return only cards that are in the storefront', async () => {
      const result = await service.getStorefrontCards(testData.store1);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((card) => {
        expect(card.inFrontStore).toBe(true);
        expect(card.storeId).toBe(testData.store1.id);
      });

      // La carta que pusimos en el storefront debe estar
      const cardIds = result.map((c) => c.id);
      expect(cardIds).toContain(createdCard.id);
    });

    it('should return an empty array if no cards are in the storefront', async () => {
      // Sacamos todas las cartas del storefront
      await prisma.card.updateMany({
        where: { storeId: testData.store1.id, inFrontStore: true },
        data: { inFrontStore: false },
      });

      const result = await service.getStorefrontCards(testData.store1);
      expect(result).toEqual([]);

      // Restauramos la carta
      await prisma.card.update({
        where: { id: createdCard.id },
        data: { inFrontStore: true },
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // buyCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('buyCard', () => {
    it('should assign the card to the player, remove from store and decrement storage red and store numCards', async () => {
      const storageBefore = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.storage1.id },
      });
      const storeBefore = await prisma.store.findUniqueOrThrow({
        where: { id: testData.store1.id },
      });

      await service.buyCard(
        createdCard,
        testData.player1,
        storageBefore,
        storeBefore,
      );

      const updatedCard = await prisma.card.findUniqueOrThrow({
        where: { id: createdCard.id },
      });
      const updatedStorage = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.storage1.id },
      });
      const updatedStore = await prisma.store.findUniqueOrThrow({
        where: { id: testData.store1.id },
      });

      expect(updatedCard.playerId).toBe(testData.player1.id);
      expect(updatedCard.storeId).toBeNull();
      expect(updatedCard.inFrontStore).toBe(false);
      expect(updatedStorage.red).toBe(storageBefore.red - createdCard.cost);
      expect(updatedStore.numCards).toBe(storeBefore.numCards - 1);

      createdCard = updatedCard;
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getPlayerCards
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getPlayerCards', () => {
    it('should return all cards owned by a player', async () => {
      const result = await service.getPlayerCards(testData.player1.id);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((card) => expect(card.playerId).toBe(testData.player1.id));

      // La carta que compramos debe estar aquí
      const cardIds = result.map((c) => c.id);
      expect(cardIds).toContain(createdCard.id);
    });

    it('should return an empty array if the player has no cards', async () => {
      const result = await service.getPlayerCards(testData.player2.id);
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // discardCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('discardCard', () => {
    it('should mark a card as discarded and clear player and store associations', async () => {
      await service.discardCard(createdCard);

      const updatedCard = await prisma.card.findUniqueOrThrow({
        where: { id: createdCard.id },
      });

      expect(updatedCard.isDiscarded).toBe(true);
      expect(updatedCard.playerId).toBeNull();
      expect(updatedCard.storeId).toBeNull();
      expect(updatedCard.inFrontStore).toBe(false);

      createdCard = updatedCard;
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // applyBackupPowerCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('applyBackupPowerCard', () => {
    it('should set ship shield to 10', async () => {
      // Bajamos el escudo primero para que el test tenga sentido
      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { shield: 3 },
      });

      await service.applyBackupPowerCard(testData.ship1);

      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });
      expect(updatedShip.shield).toBe(10);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // applyNewDrillCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('applyNewDrillCard', () => {
    it('should set ship drill to 10', async () => {
      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { drill: 2 },
      });

      await service.applyNewDrillCard(testData.ship1);

      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });
      expect(updatedShip.drill).toBe(10);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // applyRocketThrustersCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('applyRocketThrustersCard', () => {
    it('should increment player movement by 1', async () => {
      const playerBefore = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });

      await service.applyRocketThrustersCard(testData.player1);

      const updatedPlayer = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      expect(updatedPlayer.movement).toBe(playerBefore.movement + 1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // applyTemporaryPatchCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('applyTemporaryPatchCard', () => {
    it('should increment drill by 5 when effect is repair_drill and drill + 5 <= 10', async () => {
      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { drill: 3 },
      });
      const shipBefore = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });

      await service.applyTemporaryPatchCard(shipBefore, 'repair_drill');

      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });
      expect(updatedShip.drill).toBe(8);
    });

    it('should cap drill at 10 when drill + 5 > 10', async () => {
      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { drill: 8 },
      });
      const shipBefore = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });

      await service.applyTemporaryPatchCard(shipBefore, 'repair_drill');

      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });
      expect(updatedShip.drill).toBe(10);
    });

    it('should increment shield by 5 when effect is repair_shield and shield + 5 <= 10', async () => {
      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { shield: 2 },
      });
      const shipBefore = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });

      await service.applyTemporaryPatchCard(shipBefore, 'repair_shield');

      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });
      expect(updatedShip.shield).toBe(7);
    });

    it('should cap shield at 10 when shield + 5 > 10', async () => {
      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { shield: 8 },
      });
      const shipBefore = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });

      await service.applyTemporaryPatchCard(shipBefore, 'repair_shield');

      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });
      expect(updatedShip.shield).toBe(10);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // applyEnhancedScannerCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('applyEnhancedScannerCard', () => {
    it('should add drill card resources to storage', async () => {
      await prisma.storage.update({
        where: { id: testData.storage1.id },
        data: { green: 2, red: 2, yellow: 2 },
      });

      const storageBefore = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.storage1.id },
      });
      const drillCard = await prisma.drillCard.findFirst({
        where: { gameId: testData.game.id },
      });

      await service.applyEnhancedScannerCard(drillCard!, storageBefore);

      const updatedStorage = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.storage1.id },
      });

      expect(updatedStorage.green).toBe(
        Math.min(storageBefore.green + drillCard!.greenResources, 18),
      );
      expect(updatedStorage.red).toBe(
        Math.min(storageBefore.red + drillCard!.redResources, 10),
      );
      expect(updatedStorage.yellow).toBe(
        Math.min(storageBefore.yellow + drillCard!.yellowResources, 10),
      );
    });

    it('should cap green at 18', async () => {
      await prisma.storage.update({
        where: { id: testData.storage1.id },
        data: { green: 16, red: 0, yellow: 0 },
      });

      const storageBefore = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.storage1.id },
      });
      const drillCard = await prisma.drillCard.findFirst({
        where: { gameId: testData.game.id, greenResources: { gt: 0 } },
      });

      if (!drillCard) return;

      await service.applyEnhancedScannerCard(drillCard, storageBefore);

      const updatedStorage = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.storage1.id },
      });
      expect(updatedStorage.green).toBeLessThanOrEqual(18);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // applySlingShotCard
  // ─────────────────────────────────────────────────────────────────────────────

  describe('applySlingShotCard', () => {
    it('should swap positions of two ships, decrement movement and update tiles', async () => {
      const ship1Before = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });
      const ship2Before = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship2.id },
      });
      const player1Before = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });

      // Tiles donde están las naves actualmente
      const tile1 = testData.tiles.find(
        (t) =>
          t.positionX === ship1Before.positionX &&
          t.positionY === ship1Before.positionY,
      )!;
      const tile2 = testData.tiles.find(
        (t) =>
          t.positionX === ship2Before.positionX &&
          t.positionY === ship2Before.positionY,
      )!;

      await service.applySlingShotCard(
        ship1Before,
        ship2Before,
        testData.player1,
        testData.player2,
        tile1,
        tile2,
      );

      const updatedShip1 = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });
      const updatedShip2 = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship2.id },
      });
      const updatedPlayer1 = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const updatedTile1 = await prisma.tile.findUniqueOrThrow({
        where: { id: tile1.id },
      });
      const updatedTile2 = await prisma.tile.findUniqueOrThrow({
        where: { id: tile2.id },
      });

      // Las naves intercambian posición
      expect(updatedShip1.positionX).toBe(ship2Before.positionX);
      expect(updatedShip1.positionY).toBe(ship2Before.positionY);
      expect(updatedShip2.positionX).toBe(ship1Before.positionX);
      expect(updatedShip2.positionY).toBe(ship1Before.positionY);

      // El movimiento del player que usa la carta se reduce en 2
      expect(updatedPlayer1.movement).toBe(player1Before.movement - 2);

      // Las tiles se actualizan con el nuevo ocupante
      expect(updatedTile1.ocupiedByPlayerId).toBe(testData.player2.id);
      expect(updatedTile2.ocupiedByPlayerId).toBe(testData.player1.id);
    });
  });
});
