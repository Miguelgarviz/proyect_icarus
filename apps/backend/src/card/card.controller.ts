import { Controller, Post, Get, Body, Param, HttpCode } from '@nestjs/common';
import { CardService } from './card.service';
import { Prisma, Card } from '../generated/prisma/client';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  @HttpCode(201)
  async createCard(@Body() cardData: Prisma.CardCreateInput): Promise<Card> {
    return await this.cardService.createCard(cardData);
  }

  @Get('/:id')
  async getCard(@Param('id') cardId: string): Promise<Card> {
    return await this.cardService.getCard(Number(cardId));
  }

  @Get('/player-cards/:playerId')
  async getPlayerCards(@Param('playerId') playerId: string) {
    return await this.cardService.getPlayerCards(Number(playerId));
  }
}
