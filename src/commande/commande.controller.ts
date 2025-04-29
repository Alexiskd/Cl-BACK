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
    files: Record<string, Express.Multer.File[]>,
    @Body() body: any,
  ): Promise<{ numeroCommande: string }> {
    try {
      this.logger.log('Body reçu : ' + JSON.stringify(body));
      // À vous de remplir data depuis body+files
      const data: Partial<Commande> = {
        nom: body.nom,
        adressePostale: body.adressePostale,
        cle: body.cle || [],
        numeroCle: body.numeroCle || [],
        telephone: body.telephone,
        adresseMail: body.adresseMail,
        typeLivraison: body.typeLivraison || [],
        shippingMethod: body.shippingMethod,
        deliveryType: body.deliveryType,
        prix: parseFloat(body.prix) || 0,
        quantity: parseInt(body.quantity, 10) || 1,
        urlPhotoRecto: files.frontPhoto?.[0]?.buffer.toString('base64'),
        urlPhotoVerso: files.backPhoto?.[0]?.buffer.toString('base64'),
        idCardFront: files.idCardFront?.[0]?.buffer.toString('base64'),
        idCardBack: files.idCardBack?.[0]?.buffer.toString('base64'),
        propertyCardNumber: body.propertyCardNumber,
        hasCartePropriete: body.hasCartePropriete === 'true',
        domicileJustificatif: body.domicileJustificatif,
        attestationPropriete: body.attestationPropriete === 'true',
        ville: body.ville,
      };
      const cmd = await this.commandeService.createCommande(data);
      return { numeroCommande: cmd.numeroCommande };
    } catch (error) {
      this.logger.error('Erreur création commande', error.stack);
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
      this.logger.error(`Erreur validation commande ${num}`, error.stack);
      throw new InternalServerErrorException('Erreur validation commande');
    }
  }

  @Get('paid')
  async getPaidCommandes(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<{ data: any[]; count: number }> {
    try {
      const [rawData, count] = await this.commandeService.getPaidCommandesPaginated(+page, +limit);
      const data = rawData.map((cmd: Commande) => ({
        id: cmd.id,
        numeroCommande: cmd.numeroCommande,
        nom: cmd.nom,
        adressePostale: cmd.adressePostale,
        telephone: cmd.telephone,
        adresseMail: cmd.adresseMail,
        shippingMethod: cmd.shippingMethod,
        deliveryType: cmd.deliveryType,
        prix: parseFloat(cmd.prix as any),
        quantity: cmd.quantity,
        cle: cmd.cle,
        numeroCle: cmd.numeroCle,
        produitCommande: Array.isArray(cmd.cle) ? cmd.cle.join(', ') : cmd.cle || '',
        urlPhotoRecto: cmd.urlPhotoRecto,
        urlPhotoVerso: cmd.urlPhotoVerso,
        // pas de dateCommande → pas de createdAt
      }));
      return { data, count };
    } catch (error) {
      this.logger.error('Erreur récupération commandes payées', error.stack);
      throw new InternalServerErrorException('Erreur récupération commandes payées');
    }
  }

  @Delete('cancel/:numeroCommande')
  async cancel(@Param('numeroCommande') num: string) {
    try {
      const success = await this.commandeService.cancelCommande(num);
      if (success) this.commandeGateway.emitCommandeUpdate({ type: 'cancel', numeroCommande: num });
      return { success };
    } catch (error) {
      this.logger.error(`Erreur annulation commande ${num}`, error.stack);
      throw new InternalServerErrorException('Erreur annulation commande');
    }
  }

  @Get(':numeroCommande')
  async getCommande(@Param('numeroCommande') num: string) {
    try {
      return await this.commandeService.getCommandeByNumero(num);
    } catch (error) {
      this.logger.error(`Erreur récupération commande ${num}`, error.stack);
      throw new InternalServerErrorException('Erreur récupération commande');
    }
  }

  @Put('update/:id')
  async updateCommande(@Param('id') id: string, @Body() data: Partial<Commande>) {
    try {
      await this.commandeService.updateCommande(id, data);
      return this.commandeService.getCommandeByNumero(id);
    } catch (error) {
      this.logger.error(`Erreur mise à jour commande ${id}`, error.stack);
      throw new InternalServerErrorException('Erreur mise à jour commande');
    }
  }
}

