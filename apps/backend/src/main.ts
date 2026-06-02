import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Game Lobby API')
    .setDescription('Documentación de la API para gestión de Lobbies y Jugadores')
    .setVersion('1.0')
    .addTag('players') 
    .addTag('lobbies')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('docs', app, document);

  console.log('Servidor corriendo en: http://localhost:4000/api/v1');
  console.log('Documentación disponible en: http://localhost:4000/docs');

  await app.listen(4000);
}
bootstrap();