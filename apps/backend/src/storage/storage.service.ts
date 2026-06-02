import { PrismaService } from '../prisma/prisma.service';
import { DrillCard, Player, Prisma, Storage } from '../generated/prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
    constructor(private prisma: PrismaService) {}

    async getStorage(storageId: number){
        return this.prisma.storage.findUniqueOrThrow({
            where:{
                id: storageId
            }
        })
    }
    async createStorage(playerId: number): Promise<Storage> {
        return await this.prisma.storage.create({
            data: {
                player: { connect: { id: playerId } }
            }
        });
    }
    async changeMineralsGreenToRed(storage: Storage){
        await this.prisma.storage.update({
            where:{id:storage.id},
            data:{
                green: {decrement:7},
                red: {increment: 1}
            }
        })
    }
    async changeMineralsRedToGreen(storage: Storage){
        await this.prisma.storage.update({
            where:{id:storage.id},
            data:{
                green: (storage.green + 5 <= 18)?{increment:5}:18,
                red: {decrement: 1}
            }
        })
    }
    async changeMineralsRedToYellow(storage: Storage){
        await this.prisma.storage.update({
            where:{id:storage.id},
            data:{
                red: {decrement: 5},
                yellow: {increment: 1}
            }
        })
    }
    async changeMineralsYellowToRed(storage: Storage){
        await this.prisma.storage.update({
            where:{id:storage.id},
            data:{
                red: (storage.red + 3 > 10)?{increment: 3}:10,
                yellow: {decrement: 1}
            }
        })
    }

    async addGreenMinerals(storage: Storage, drillCard: DrillCard){
        await this.prisma.storage.update({
            where:{id: storage.id},
            data:{
                green: (storage.green + drillCard.greenResources <= 18)?{increment:drillCard.greenResources}:18
            }
        })
    }

    async addRedMinerals(storage: Storage, drillCard: DrillCard){
        await this.prisma.storage.update({
            where:{id: storage.id},
            data:{
                red: (storage.red + drillCard.redResources <= 10)?{increment:drillCard.redResources}:10
            }
        })
    }
    
    async addYellowMinerals(storage: Storage, drillCard: DrillCard){
        await this.prisma.storage.update({
            where:{id: storage.id},
            data:{
                yellow: (storage.yellow + drillCard.yellowResources <= 10)?{increment:drillCard.yellowResources}:1
            }
        })
    }

    async giveInitialHelp(storage: Storage, player: Player){
        await this.prisma.storage.update({
            where:{id: storage.id},
            data:{
                green: {increment:3}
            }
        })
        await this.prisma.player.update({
            where: {id: player.id},
            data: {
                initialHelp: false
            }
        })
    }
}
