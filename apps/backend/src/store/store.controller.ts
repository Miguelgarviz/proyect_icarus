import { Controller, Get, Param } from '@nestjs/common';
import { StoreService } from './store.service';
import { Store, Card } from '../generated/prisma/browser';
import { CardService } from '../card/card.service';

@Controller('store')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly cardService: CardService,
  ) {}

  @Get('/:id')
  async getStore(@Param('id') storeId: string): Promise<Store | null> {
    return await this.storeService.getStore({ id: Number(storeId) });
  }

  @Get('/:id/cards')
  async getCardsByStore(@Param('id') storeId: string): Promise<Card[]> {
    await this.storeService.getStore({ id: Number(storeId) });

    return await this.cardService.getCardsByStore(Number(storeId));
  }
}
