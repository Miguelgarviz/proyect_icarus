import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { StoreService } from './store.service';
import { Prisma, Store, CardType, Cards } from '../generated/prisma/browser';
import { CardService } from '../card/card.service';
import { GameService } from '../game/game.service';

@Controller('store')
export class StoreController {
    constructor(
        private readonly storeService: StoreService,
        private readonly cardService: CardService,
        private readonly gameService: GameService
    ){}

    @Post()
    async createStore(@Body('gameId') gameId: string): Promise<Store> {
        const store= await this.storeService.createStore({numCards: 18});
        await this.cardService.createCardsForStore(store.id, 6, { type: CardType.TEMPORARY_PATCH, cost: 1 });
        await this.cardService.createCardsForStore(store.id, 3, { type: CardType.NEW_DRILL, cost: 2});
        await this.cardService.createCardsForStore(store.id, 3, { type: CardType.BACKUP_POWER, cost: 2});
        await this.cardService.createCardsForStore(store.id, 2, {type: CardType.SLINGSHOT, cost: 2});
        await this.cardService.createCardsForStore(store.id, 2, {type: CardType.ENHANCED_SCANNER, cost: 2});
        await this.cardService.createCardsForStore(store.id, 2, {type: CardType.ROCKET_THRUSTERS, cost: 2});
        await this.gameService.setGameStore({ id: Number(gameId) }, store.id);
        return store;
    }

    @Get('/:id')
    async getStore(@Param('id') storeId: string):Promise<Store | null> {
        return await this.storeService.getStore({ id: Number(storeId) });
    }

    @Get('/:id/cards')
    async getCardsByStore(@Param('id') storeId: string):Promise<Cards[]> {
        return await this.cardService.getCardsByStore({ id: Number(storeId) });
    }
}
