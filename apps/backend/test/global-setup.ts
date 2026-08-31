import 'dotenv/config';
import { PrismaService } from '../src/prisma/prisma.service';
import { seedTestDatabase } from './test-data';

export default async function globalSetup() {
  console.log('\n🌱 Preparando base de datos de test...\n');

  const prisma = new PrismaService();

  try {
    await prisma.$connect();

    const testData = await seedTestDatabase(prisma);

    console.log('✅ Base de datos de test poblada.');
    console.log(`   Game ID: ${testData.game.id}`);
    console.log(`   Lobby ID: ${testData.lobby1.id}`);
    console.log(`   Lobby ID: ${testData.lobby2.id}`);
    console.log(`   Player 1 ID: ${testData.player1.id}`);
    console.log(`   Player 2 ID: ${testData.player2.id}`);
    console.log(`   Player 3 ID: ${testData.player3.id}`);
    console.log(`   Tiles creadas: ${testData.tiles.length}`);
  } finally {
    await prisma.$disconnect();
  }
}
