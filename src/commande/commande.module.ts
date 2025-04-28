// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CommandeModule } from './commande/commande.module';

@Module({
  imports: [
    // Charge vos variables d’environnement
    ConfigModule.forRoot({ isGlobal: true }),

    // Configure la connexion à la BDD
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,      // à désactiver en prod
    }),

    // Votre module Commande
    CommandeModule,
  ],
})
export class AppModule {}
