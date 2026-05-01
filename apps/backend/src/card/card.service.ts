import { Prisma, Cards, CardType } from '../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CardService {
    constructor(private prisma: PrismaService) {}

    async createCard(data: Prisma.CardsCreateInput) {
        return this.prisma.cards.create({
            data
        });
    }

    async getCard(cardWhereUniqueInput: Prisma.CardsWhereUniqueInput): Promise<Cards | null> {
        return this.prisma.cards.findUnique({
            where: cardWhereUniqueInput
        });
    }

    async createCardsForStore(storeId: number, numCards: number, cardsData: {type: CardType, cost: number}){
        for (let i = 0; i < numCards; i++){
            await this.prisma.cards.create({
                data: {
                    storeId,
                    type: cardsData.type,
                    cost: cardsData.cost
                }
            });
        }
    }

    async getCardsByStore(storeWhereUniqueInput: Prisma.StoreWhereUniqueInput): Promise<Cards[]> {
        const store = await this.prisma.store.findUnique({
            where: storeWhereUniqueInput,
            include: {
                cards: true
            }
        });
        return store?.cards || [];
    }   
}
