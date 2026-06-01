import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { StoreService } from './store.service';
import { Prisma, Store, CardType, Card } from '../generated/prisma/browser';
import { CardService } from '../card/card.service';
import { GameService } from '../game/game.service';

@Controller('store')
export class StoreController {
    constructor(
        private readonly storeService: StoreService,
        private readonly cardService: CardService
    ){}
    

    @Get('/:id')
    async getStore(@Param('id') storeId: string):Promise<Store | null> {
        return await this.storeService.getStore({ id: Number(storeId) });
    }

    @Get('/:id/cards')
    async getCardsByStore(@Param('id') storeId: string):Promise<Card[]> {
        return await this.cardService.getCardsByStore(Number(storeId));
    }
}
