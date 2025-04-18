import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from './commande.entity';
import { CommandeController } from './commande.controller';
import { CommandeService } from './commande.service';
import { CommandeGateway } from './commande.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Commande])],
  controllers: [CommandeController],
  providers: [CommandeService, CommandeGateway],
})
export class CommandeModule {}
