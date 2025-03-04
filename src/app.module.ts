import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule, ServeStaticModuleOptions } from '@nestjs/serve-static';
import { join } from 'path';

import appConfig from './app.config';
import mailConfig from './mailer/mail.config';

import { MailModule } from './mailer/mail.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProduitModule } from './produit/produit.module';
import { StripeModule } from './payment/stripe.module';
import { CommandeModule } from './commande/commande.module';
import { ShippingDocketModule } from './collisimo/shipping-docket.module';
import { ContactMessagesModule } from './contact/contact-messages.module';
import { BrandModule } from './marque/brand.module';
import { UploadModule } from './upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Chargement global des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mailConfig],
      envFilePath: ['.env'],
    }),

    // ServeStaticModule : configuration pour servir les fichiers statiques
    ServeStaticModule.forRootAsync({
      useFactory: (): ServeStaticModuleOptions[] => [
        {
          rootPath: join(__dirname, '..', 'public'),
          serveRoot: '/public',
        },
        {
          rootPath: join(__dirname, 'uploads'),
          serveRoot: '/uploads',
          serveStaticOptions: { index: false },
        },
      ],
    }),

    // Configuration de la connexion à la base de données
    // (Les informations de connexion restent inchangées)
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://cleservice_user:LUWibq2Mqj4yqZnuQgZhBGk8exqGSIvS@dpg-cuec3352ng1s7387587g-a.oregon-postgres.render.com/cleservice',
      autoLoadEntities: true,
      synchronize: false,
      ssl: { rejectUnauthorized: false },
    }),

    // Importation des modules applicatifs
    MailModule,
    UserModule,
    AuthModule,
    ProduitModule,
    StripeModule,
    CommandeModule,
    ShippingDocketModule,
    ContactMessagesModule,
    BrandModule,
    UploadModule,
  ],
})
export class AppModule {}
