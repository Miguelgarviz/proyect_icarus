import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CardService } from './card.service';
import { Prisma, Cards } from '../generated/prisma/client';

@Controller('card')
export class CardController {
    constructor(
        private readonly cardService: CardService
    ){}

    @Post()
    async createCard(@Body() cardData: Prisma.CardsCreateInput):Promise<Cards> {
        return await this.cardService.createCard(cardData);
    }

    @Get('/:id')
    async getCard(@Body() cardWhereUniqueInput: Prisma.CardsWhereUniqueInput):Promise<Cards | null> {
        return await this.cardService.getCard(cardWhereUniqueInput);
    }

    @Get('/player-cards/:playerId')
    async getPlayerCards(@Param('playerId') playerId: string) {
        if(!(Number(playerId))){
            return [];
        }
        return await this.cardService.getPlayerCards( Number(playerId) );
    }
}
