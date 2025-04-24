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
import { Commande } from './commande.entity';
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
      { storage: memoryStorage() },
    ),
  )
  async create(
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Body() body: any,
  ): Promise<{ numeroCommande: string }> {
    try {
      this.logger.log('Body reçu : ' + JSON.stringify(body));
      const data: Partial<Commande> = {
        nom: body.nom,
        adressePostale: `${body.address}, ${body.postalCode}, ${body.ville}, ${body.additionalInfo}`,
        telephone: body.phone,
        adresseMail: body.email,
        cle: body.articleName ? [body.articleName] : [],
        numeroCle: body.keyNumber ? [body.keyNumber] : [],
        propertyCardNumber: body.propertyCardNumber || null,
        typeLivraison: body.keyNumber ? ['par numero'] : ['par envoie postale'],
        shippingMethod: body.shippingMethod || '',
        deliveryType: body.deliveryType || '',
        urlPhotoRecto: files.frontPhoto?.[0]?.buffer.toString('base64') || null,
        urlPhotoVerso: files.backPhoto?.[0]?.buffer.toString('base64') || null,
        prix: parseFloat(body.prix) || 0,
        isCleAPasse: body.isCleAPasse === 'true',
        hasCartePropriete: !!body.propertyCardNumber,
        idCardFront: files.idCardFront?.[0]?.buffer.toString('base64') || null,
        idCardBack: files.idCardBack?.[0]?.buffer.toString('base64') || null,
        domicileJustificatif: body.domicileJustificatifPath || null,
        attestationPropriete: body.attestationPropriete === 'true',
        ville: body.ville || '',
        quantity: body.quantity ? parseInt(body.quantity, 10) : 1,
        date: body,
      };
      const numeroCommande = await this.commandeService.createCommande(data);
      return { numeroCommande };
    } catch (error) {
      this.logger.error('Erreur création', error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la création de la commande.',
      );
    }
  }

  @Patch('validate/:numeroCommande')
  async validate(@Param('numeroCommande') num: string) {
    const success = await this.commandeService.validateCommande(num);
    if (success) this.commandeGateway.emitCommandeUpdate({ type: 'validate', num });
    return { success };
  }

  @Get('paid')
  async getPaid(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<{ data: Commande[]; count: number }> {
    try {
      const [data, count] = await this.commandeService.getPaidCommandesPaginated(
        +page,
        +limit,
      );
      return { data, count };
    } catch (error) {
      this.logger.error('Erreur dans getPaid', error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des commandes payées.',
      );
    }
  }

  @Delete('cancel/:numeroCommande')
  async cancel(@Param('numeroCommande') num: string) {
    const success = await this.commandeService.cancelCommande(num);
    if (success) this.commandeGateway.emitCommandeUpdate({ type: 'cancel', num });
    return { success };
  }

  @Get(':numeroCommande')
  async getOne(@Param('numeroCommande') num: string): Promise<Commande> {
    return this.commandeService.getCommandeByNumero(num);
  }

  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Commande>,
  ): Promise<Commande> {
    return this.commandeService.updateCommande(id, updateData);
  }
}
