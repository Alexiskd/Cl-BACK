import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './logging.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Augmenter la limite de taille pour les requêtes JSON et urlencoded
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Activer CORS en autorisant plusieurs origines (par exemple, pour le développement)
  const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'https://frontend-f4rf.onrender.com',
    'https://frontend-f4rf.onrender.com/',
    'https://cleservice.com/',
    'https://cl-front.onrender.com',
    'https://cl-front.onrender.com/',
    'https://cl-front.onrender.com/',
    'https://www.cleservice.com',
    'https://2f24-90-90-24-19.ngrok-free.app',
    'http://localhost:5174',
    'http://localhost:5175',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origine (ex : Postman ou scripts internes)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1) {
        // Retourne l'origine réelle afin que l'en-tête Access-Control-Allow-Origin soit correct
        return callback(null, origin);
      } else {
        return callback(new Error(`Origin ${origin} non autorisée par CORS`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Utilisation d'un ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Ajout de l'intercepteur global pour logger les requêtes
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configuration de Swagger pour la documentation de l'API
  const config = new DocumentBuilder()
    .setTitle('API Stancer')
    .setDescription('API pour générer des pages de paiement avec Stancer')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Utilisation du port 3000
  const port = 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application running on port ${port}`);
}

bootstrap();
