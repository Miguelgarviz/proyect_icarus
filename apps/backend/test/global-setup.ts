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
    console.log(`   Game 1 ID: ${testData.game.id}`);
    console.log(`   Game 2 ID: ${testData.game2.id}`);
    console.log(`   User 1 ID: ${testData.user1.id}`);
    console.log(`   User 2 ID: ${testData.user2.id}`);
    console.log(`   User 3 ID: ${testData.user3.id}`);
    console.log(`   Lobby 1 ID: ${testData.lobby1.id}`);
    console.log(`   Lobby 2 ID: ${testData.lobby2.id}`);
    console.log(`   Lobby 3 ID: ${testData.lobby3.id}`);
    console.log(`   Player 1 ID: ${testData.player1.id}`);
    console.log(`   Player 2 ID: ${testData.player2.id}`);
    console.log(`   Player 3 ID: ${testData.player3.id}`);
    console.log(`   Player 4 ID: ${testData.player4.id}`);
    console.log(`   Player 5 ID: ${testData.player5.id}`);
    console.log(`   Ship 1 ID: ${testData.ship1.id}`);
    console.log(`   Ship 2 ID: ${testData.ship2.id}`);
    console.log(`   Ship 3 ID: ${testData.ship3.id}`);
    console.log(`   Storage 1 ID: ${testData.storage1.id}`);
    console.log(`   Storage 2 ID: ${testData.storage2.id}`);
    console.log(`   Storage 3 ID: ${testData.storage3.id}`);
    console.log(`   Store 1 ID: ${testData.store1.id}`);
    console.log(`   Store 2 ID: ${testData.store2.id}`);
    console.log(`   DrillCards creadas: ${testData.drillCards.length}`);
    console.log(`   Tiles creadas: ${testData.tiles.length}`);
  } finally {
    await prisma.$disconnect();
  }
}
