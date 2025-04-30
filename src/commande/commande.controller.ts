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
        .set({ cle: '' })
        .where('cle IS NULL')
        .execute();
      total += res1.affected || 0;

      const res2 = await this.commandeService['commandeRepository']
        .createQueryBuilder()
        .update()
        .set({ typeLivraison: '' })
        .where('typeLivraison IS NULL')
        .execute();
      total += res2.affected || 0;

      const res3 = await this.commandeService['commandeRepository']
        .createQueryBuilder()
        .update()
        .set({ numeroCle: '' })
        .where('numeroCle IS NULL')
        .execute();
      total += res3.affected || 0;

      return { fixed: total };
    } catch (error) {
      this.logger.error('Erreur correction des champs NULL', error.stack);
      throw new InternalServerErrorException('Erreur correction des champs NULL');
    }
  }
}
