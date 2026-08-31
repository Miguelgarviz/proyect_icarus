import { PrismaService } from '../src/prisma/prisma.service';
import { clearTestDatabase } from './test-data';

/**
 * Jest llama a este archivo UNA SOLA VEZ después de que todos
 * los tests hayan terminado (sea cual sea su resultado).
 *
 * Se registra en jest.config.ts con la clave `globalTeardown`.
 */
export default async function globalTeardown(): Promise<void> {
  const prisma = new PrismaService();
  await prisma.$connect();

  try {
    await clearTestDatabase(prisma);
    console.log('\n✔ Base de datos de test limpiada correctamente.\n');
  } finally {
    await prisma.$disconnect();
  }
}