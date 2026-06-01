import { connect } from 'http2';
import { Prisma, Card, CardType, Store, Player, Storage } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CardService {
    constructor(private prisma: PrismaService) {}

    async createCard(data: Prisma.CardCreateInput) {
        return this.prisma.card.create({
            data
        });
    }

    async getCard(cardWhereUniqueInput: Prisma.CardWhereUniqueInput) {
        return this.prisma.card.findUniqueOrThrow({
            where: cardWhereUniqueInput
        });
    }

    async createCardsForStore(storeId: number, numCards: number, cardsData: {type: CardType, cost: number}){
        for (let i = 0; i < numCards; i++){
            await this.prisma.card.create({
                data: {
                    storeId,
                    type: cardsData.type,
                    cost: cardsData.cost
                }
            });
        }
    }

    async getCardsByStore(storeId: number): Promise<Card[]> {
        const cards = await this.prisma.card.findMany({
            where:{
                storeId:storeId,
                inFrontStore: false
            },
            orderBy:{id:'asc'}
        })
        return cards
    } 
    
    async getPlayerCards(playerId: number): Promise<Card[]>{
        const cards = await this.prisma.card.findMany({
            where:{
                playerId: playerId
            }
        })
        return cards
    }

    private seededRandom(seed: number) {
        return function () {
            let t = (seed += 0x6d2b79f5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    async shuffleCardsWithSeed(cards: Card[], seed: number): Promise<Card[]> {
        const shuffled = [...cards];
        const random = this.seededRandom(seed);
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            // Intercambio de posiciones (Fisher-Yates Shuffle)
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    }

    async setCardToStorefront(card: Card){
        await this.prisma.card.update({
            where:{id: card.id},
            data: {
                inFrontStore:true
            }
        })
    }

    async getStorefrontCards(store: Store){
        return await this.prisma.card.findMany({
            where:{
                storeId: store.id,
                inFrontStore: true
            }
        })
    }

    async buyCard(card: Card, player: Player, storage: Storage, store: Store){
        await this.prisma.card.update({
            where:{
                id: card.id
            },
            data:{
                storeId:null,
                playerId: player.id,
                inFrontStore: false
            }
        })
        await this.prisma.storage.update({
            where:{id: storage.id},
            data:{
                red: {decrement: card.cost}
            }
        })
        await this.prisma.store.update({
            where: {id: store.id},
            data:{
                numCards: {decrement: 1}
            }
        })
    }

}
