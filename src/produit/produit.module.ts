import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduitService } from './produit.service';
import { ProduitController } from './produit.controller';
import { CatalogueCle } from '../entities/catalogue-cle.entity';

@Module({
  imports: [
    CacheModule.register({
      ttl: 5,
      max: 100,
    }),
    TypeOrmModule.forFeature([CatalogueCle]),
  ],
  controllers: [ProduitController],
  providers: [ProduitService],
})
export class ProduitModule {}
