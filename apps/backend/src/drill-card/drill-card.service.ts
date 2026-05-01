import { PrismaService } from '../prisma.service';
import { Prisma, DrillCard } from '../generated/prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DrillCardService {
    constructor(
        private prisma: PrismaService
    ) {}

    async getDrillCards() {
        return await this.prisma.drillCard.findMany();
    }

    async getDrillCardById(id: number){
        return await this.prisma.drillCard.findUnique({
            where: { id }
        });
    }

    async createDrillCard(data: Prisma.DrillCardCreateInput) {
        return await this.prisma.drillCard.create({
            data
        });
    }

    async createDrillCardsForGame(gameId: number){
        const drillCardsGreenResources = [4,4,4,5,4,5,3,3,5,4,4,3,6,3,4,3,6,3];
        const drillCardsRedResources = [1,0,1,3,2,1,0,3,0,2,2,0,1,1,1,0,1,0];
        const drillCardsYellowResources = [2,2,0,0,0,1,1,0,1,0,0,1,0,0,2,1,0,1];
        for (let i = 0; i < 24; i++){
            if(i < drillCardsGreenResources.length){
            await this.prisma.drillCard.create({
                data: {
                    greenResources: drillCardsGreenResources[i],
                    redResources: drillCardsRedResources[i],
                    yellowResources: drillCardsYellowResources[i],
                    gameId
                }
            });
            }else{
                await this.prisma.drillCard.create({
                    data: {
                        gameId,
                        isSupernovaCard: true
                    }
                });
            }
        }
    }

    async getDrillCardsByGame(gameId: number): Promise<DrillCard[]> {
        return await this.prisma.drillCard.findMany({
            where: { gameId }
        });
    }
}
