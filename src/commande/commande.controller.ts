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

  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontPhoto', maxCount: 1 },
        { name: 'backPhoto', maxCount: 1 },
        { name: 'idCardFront', maxCount: 1 },
        { name: 'idCardBack', maxCount: 1 },
      ],
      { storage: memoryStorage() }
    ),
  )
  async create(
    @UploadedFiles() files: {
      frontPhoto?: Express.Multer.File[];
      backPhoto?: Express.Multer.File[];
      idCardFront?: Express.Multer.File[];
      idCardBack?: Express.Multer.File[];
    },
    @Body() body: any,
  ): Promise<{ numeroCommande: string }> {
    try {
      this.logger.log('Body reçu : ' + JSON.stringify(body));

      if (
        body.lostCartePropriete === 'true' &&
        (!body.domicileJustificatifPath || body.domicileJustificatifPath.trim() === '')
      ) {
        throw new InternalServerErrorException("Le chemin du justificatif de domicile est requis.");
      }

      const hasCartePropriete = !!(body.propertyCardNumber && body.propertyCardNumber.trim());

      const commandeData: Partial<any> = {
        nom: body.nom,
        adressePostale: `${body.address}, ${body.postalCode}, ${body.ville}, ${body.additionalInfo}`,
        telephone: body.phone,
        adresseMail: body.email,
        cle: body.articleName?.trim() ? [body.articleName] : [],
        numeroCle: body.keyNumber?.trim() ? [body.keyNumber] : [],
        propertyCardNumber: body.propertyCardNumber?.trim() || null,
        typeLivraison: body.keyNumber?.trim() ? ['par numero'] : ['par envoi postal'],
        shippingMethod: body.shippingMethod || '',
        deliveryType: body.deliveryType || '',
        urlPhotoRecto: files.frontPhoto?.[0]?.buffer.toString('base64') || null,
        urlPhotoVerso: files.backPhoto?.[0]?.buffer.toString('base64') || null,
        prix: parseFloat(body.prix) || 0,
        isCleAPasse: body.isCleAPasse === 'true',
        hasCartePropriete,
        idCardFront: files.idCardFront?.[0]?.buffer.toString('base64') || null,
        idCardBack: files.idCardBack?.[0]?.buffer.toString('base64') || null,
        domicileJustificatif: body.domicileJustificatifPath || null,
        attestationPropriete: body.attestationPropriete === 'true',
        ville: body.ville || '',
      };

      const commande = await this.commandeService.createCommande(commandeData);
      return { numeroCommande: commande.numeroCommande };
    } catch (error) {
      this.logger.error('Erreur lors de la création de la commande', error.stack);
      throw new InternalServerErrorException('Erreur lors de la création de la commande.');
    }
  }

  @Patch('validate/:numeroCommande')
  async validate(
    @Param('numeroCommande') numeroCommande: string,
  ): Promise<{ success: boolean }> {
    try {
      const success = await this.commandeService.validateCommande(numeroCommande);
      if (success) {
        this.commandeGateway.emitCommandeUpdate({ type: 'validate', numeroCommande });
      }
      return { success };
    } catch (error) {
      this.logger.error(`Erreur validation commande ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la validation de la commande.');
    }
  }

  @Get('paid')
  async getPaidCommandes(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<{ data: any[]; count: number }> {
    try {
      const [data, count] = await this.commandeService.getPaidCommandesPaginated(
        +page,
        +limit,
      );
      return { data, count };
    } catch (error) {
      this.logger.error('Erreur récupération commandes payées', error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération.');
    }
  }

  @Delete('cancel/:numeroCommande')
  async cancel(
    @Param('numeroCommande') numeroCommande: string,
  ): Promise<{ success: boolean }> {
    try {
      const success = await this.commandeService.cancelCommande(numeroCommande);
      if (success) {
        this.commandeGateway.emitCommandeUpdate({ type: 'cancel', numeroCommande });
      }
      return { success };
    } catch (error) {
      this.logger.error(`Erreur annulation commande ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de l'annulation de la commande.");
    }
  }

  @Get(':numeroCommande')
  async getCommande(
    @Param('numeroCommande') numeroCommande: string,
  ): Promise<any> {
    try {
      return await this.commandeService.getCommandeByNumero(numeroCommande);
    } catch (error) {
      this.logger.error(`Erreur récupération commande ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de la récupération de la commande.");
    }
  }

  @Put('update/:id')
  async updateCommande(
    @Param('id') id: string,
    @Body() updateData: Partial<any>,
  ): Promise<any> {
    try {
      await this.commandeService.updateCommande(id, updateData);
      return await this.commandeService.getCommandeByNumero(id);
    } catch (error) {
      this.logger.error(`Erreur mise à jour commande ${id}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de la mise à jour de la commande.");
    }
  }
}



















