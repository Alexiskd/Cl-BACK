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
import { Commande } from './commande.entity';

@Controller('commande')
export class CommandeController {
  private readonly logger = new Logger(CommandeController.name);

  constructor(
    private readonly commandeService: CommandeService,
    private readonly commandeGateway: CommandeGateway,
  ) {}

  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontPhoto', maxCount: 1 },
        { name: 'backPhoto', maxCount: 1 },
        { name: 'idCardFront', maxCount: 1 },
        { name: 'idCardBack', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @UploadedFiles()
    files: {
      frontPhoto?: Express.Multer.File[];
      backPhoto?: Express.Multer.File[];
      idCardFront?: Express.Multer.File[];
      idCardBack?: Express.Multer.File[];
    },
    @Body() body: any,
  ): Promise<{ numeroCommande: string }> {
    try {
      this.logger.log('Body reçu : ' + JSON.stringify(body));
      // build your Commande partial here...
      const commande = await this.commandeService.createCommande({} as any);
      return { numeroCommande: commande.numeroCommande };
    } catch (error) {
      this.logger.error('Erreur création', error.stack);
      throw new InternalServerErrorException('Erreur création commande');
    }
  }

  @Patch('validate/:numeroCommande')
  async validate(@Param('numeroCommande') num: string) {
    try {
      const success = await this.commandeService.validateCommande(num);
      if (success) this.commandeGateway.emitCommandeUpdate({ type: 'validate', numeroCommande: num });
      return { success };
    } catch (error) {
      this.logger.error(`Erreur validation ${num}`, error.stack);
      throw new InternalServerErrorException('Erreur validation commande');
    }
  }

  @Get('paid')
  async getPaidCommandes(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    try {
      const [data, count] = await this.commandeService.getPaidCommandesPaginated(+page, +limit);
      return { data, count };
    } catch (error) {
      this.logger.error('Erreur récup commandes payées', error.stack);
      throw new InternalServerErrorException('Erreur récup commandes payées');
    }
  }

  @Delete('cancel/:numeroCommande')
  async cancel(@Param('numeroCommande') num: string) {
    try {
      const success = await this.commandeService.cancelCommande(num);
      if (success) this.commandeGateway.emitCommandeUpdate({ type: 'cancel', numeroCommande: num });
      return { success };
    } catch (error) {
      this.logger.error(`Erreur annulation ${num}`, error.stack);
      throw new InternalServerErrorException('Erreur annulation commande');
    }
  }

  @Get(':numeroCommande')
  async getCommande(@Param('numeroCommande') num: string) {
    try {
      return await this.commandeService.getCommandeByNumero(num);
    } catch (error) {
      this.logger.error(`Erreur récupération ${num}`, error.stack);
      throw new InternalServerErrorException('Erreur récupération commande');
    }
  }

  @Put('update/:id')
  async updateCommande(@Param('id') id: string, @Body() data: Partial<Commande>) {
    try {
      await this.commandeService.updateCommande(id, data);
      return this.commandeService.getCommandeByNumero(id);
    } catch (error) {
      this.logger.error(`Erreur mise à jour ${id}`, error.stack);
      throw new InternalServerErrorException('Erreur mise à jour commande');
    }
  }
}
