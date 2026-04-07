import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Importamos Swagger

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración de CORS
  app.enableCors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Prefijo Global (IMPORTANTE: Esto afecta a todas las rutas)
  // Tus URLs ahora serán: http://localhost:4000/api/v1/...
  app.setGlobalPrefix('api/v1');

  // 3. Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Game Lobby API')
    .setDescription('Documentación de la API para gestión de Lobbies y Jugadores')
    .setVersion('1.0')
    .addTag('players') // Puedes añadir etiquetas para organizar tus rutas
    .addTag('lobbies')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Configuramos la ruta de la documentación. 
  // Podrás verla en: http://localhost:4000/docs
  // (Nota: Swagger suele ignorar el Global Prefix para su propia interfaz por comodidad)
  SwaggerModule.setup('docs', app, document);

  console.log('Servidor corriendo en: http://localhost:4000/api/v1');
  console.log('Documentación disponible en: http://localhost:4000/docs');

  await app.listen(4000);
}
bootstrap();