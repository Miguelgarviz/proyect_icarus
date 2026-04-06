// En tu proyecto NestJS: src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- SOLUCIÓN AQUÍ ---
  app.enableCors({
    origin: 'http://localhost:3000', // El puerto donde corre tu Next.js
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // ---------------------

  // Asegúrate de que el prefijo coincida con tu URL: /api/v1
  app.setGlobalPrefix('api/v1');

  await app.listen(4000);
}
bootstrap();