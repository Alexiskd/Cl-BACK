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

  // Définition des origines autorisées pour CORS
  // Vous pouvez définir plusieurs origines dans une variable d’environnement (séparées par une virgule)
  const envOrigins = process.env.CORS_ORIGIN;
  const defaultOrigins = [
    'http://localhost:5173',
    'https://frontendcleservice.onrender.com',
    'https://frontend-fkzn.onrender.com',
    'https://cleservice.com',
    'https://www.cleservice.com',
    'https://2f24-90-90-24-19.ngrok-free.app',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:4173',
  ];
  const allowedOrigins = envOrigins 
    ? envOrigins.split(',').map(origin => origin.trim().replace(/\/$/, ''))
    : defaultOrigins;

  // Activer CORS en vérifiant l'origine de la requête
  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origine (ex : Postman ou scripts internes)
      if (!origin) {
        return callback(null, true);
      }
      // Vérifier si l'origine figure dans la liste autorisée
      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      } else {
        callback(new Error(`Origin ${origin} non autorisée par CORS`));
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

  // Définir le port d'écoute de l'application
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application running on port ${port}`);
}

bootstrap();

