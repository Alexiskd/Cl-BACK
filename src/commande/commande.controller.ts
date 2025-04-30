// src/commande/commande.controller.ts
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFiles,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CommandeService } from './commande.service';
import { CommandeGateway } from './commande.gateway';

@Controller('commande')
export class CommandeController {
  private readonly logger = new Logger(CommandeController.name);

  constructor(
    private readonly commandeService: CommandeService,
    private readonly commandeGateway: CommandeGateway,
  ) {}

  @Get('fix-null-arrays')
  async fixInvalidArrays(): Promise<{ fixed: number }> {
    try {
      let total = 0;

      const res1 = await this.commandeService['commandeRepository']
        .createQueryBuilder()
        .update()
        .set({ cle: [] })
        .where('cle IS NULL')
        .execute();
      total += res1.affected || 0;

      const res2 = await this.commandeService['commandeRepository']
        .createQueryBuilder()
        .update()
        .set({ typeLivraison: [] })
        .where('typeLivraison IS NULL')
        .execute();
      total += res2.affected || 0;

      const res3 = await this.commandeService['commandeRepository']
        .createQueryBuilder()
        .update()
        .set({ numeroCle: [] })
        .where('numeroCle IS NULL')
        .execute();
      total += res3.affected || 0;

      return { fixed: total };
    } catch (error) {
      this.logger.error('Erreur correction des champs NULL', error.stack);
      throw new InternalServerErrorException('Erreur correction des champs NULL');
    }
  }

  @Post('fake')
  async createFakeCommande(): Promise<{ numeroCommande: string; dateCommande: Date }> {
    try {
      const numeroCommande = await this.commandeService.createCommande({
        nom: 'Jean Dupont',
        adressePostale: '10 rue Test, 75001 Paris',
        cle: ['Clé A'],
        numeroCle: ['1234A'],
        telephone: '0600000000',
        adresseMail: 'test@exemple.com',
        typeLivraison: ['par numero'],
        prix: 42.5,
        shippingMethod: 'retrait',
        deliveryType: 'boutique',
        status: 'payer',
        quantity: 1,
        ville: 'Paris',
      });
      const nouvelleCommande = await this.commandeService.getCommandeByNumero(numeroCommande);
      return {
        numeroCommande: nouvelleCommande.numeroCommande,
        dateCommande: nouvelleCommande.dateCommande,
      };
    } catch (error) {
      this.logger.error('Erreur création commande factice', error.stack);
      throw new InternalServerErrorException('Erreur création commande factice');
    }
  }
}
