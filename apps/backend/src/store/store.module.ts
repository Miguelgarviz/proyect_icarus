import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { PrismaService } from '../prisma/prisma.service';
import { CardService } from '../card/card.service';

@Module({
  imports:[],
  controllers: [StoreController],
  providers: [StoreService, PrismaService, CardService]
}) 
export class StoreModule {}
