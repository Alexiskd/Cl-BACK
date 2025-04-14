import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './logging.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Limiter la taille des requêtes
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Liste des origines autorisées
  const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'https://frontendcleservice.onrender.com',
    'https://frontend-fkzn.onrender.com',
    'https://cleservice.com',
    'https://www.cleservice.com',
    'https://2f24-90-90-24-19.ngrok-free.app',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:4173',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origine (ex. Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      } else {
        return callback(new Error(`Origin ${origin} non autorisée par CORS`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validation globale et intercepteur de logging
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger (optionnel)
  const config = new DocumentBuilder()
    .setTitle('API Stancer')
    .setDescription('API pour générer des pages de paiement avec Stancer')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application running on port ${port}`);
}
bootstrap();
