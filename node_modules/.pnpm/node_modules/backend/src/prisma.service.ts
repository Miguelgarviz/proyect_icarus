import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Creamos el pool de conexiones de Postgres (Standard JS)
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 2. Creamos el adaptador
    const adapter = new PrismaPg(pool);

    // 3. Se lo pasamos a Prisma
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
