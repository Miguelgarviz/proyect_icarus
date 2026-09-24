import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth/auth.guard';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CorsIoAdapter } from './socket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const FRONTEND_URL = process.env.FRONTEND_URL

  app.enableCors({
    origin: FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useWebSocketAdapter(new CorsIoAdapter(app));

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Game Lobby API')
    .setDescription(
      'Documentación de la API para gestión de Lobbies y Jugadores',
    )
    .setVersion('1.0')
    .addTag('players')
    .addTag('lobbies')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  console.log('Servidor corriendo en: http://localhost:4000/api/v1');
  console.log('Documentación disponible en: http://localhost:4000/docs');

  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthGuard(jwtService, reflector));

  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.listen(4000);
}
bootstrap();
