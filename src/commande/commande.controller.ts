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
  private logger = new Logger( this.constructor.name );

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
      if (
        body.lostCartePropriete === 'true' &&
        (!body.domicileJustificatifPath || !body.domicileJustificatifPath.trim())
      ) {
        throw new InternalServerErrorException('Justificatif de domicile requis');
      }

      const hasCartePropriete = !!body.propertyCardNumber?.trim();
      const data: Partial<any> = {
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

      const numeroCommande = await this.commandeService.createCommande(data);
      return { numeroCommande };
    } catch (err) {
      this.logger.error('Erreur create', err.stack);
      throw new InternalServerErrorException('Erreur création commande');
    }
  }

  @Patch('validate/:numeroCommande')
  async validate(
    @Param('numeroCommande') numeroCommande: string,
  ): Promise<{ success: boolean }> {
    const success = await this.commandeService.validateCommande(numeroCommande);
    if (success) {
      this.commandeGateway.emitCommandeUpdate({ type: 'validate', numeroCommande });
    }
    return { success };
  }

  @Get('paid')
  async getPaid(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<{ data: any[]; count: number }> {
    const [data, count] = await this.commandeService.getPaidCommandesPaginated(
      +page,
      +limit,
    );
    return { data, count };
  }

  @Delete('cancel/:numeroCommande')
  async cancel(
    @Param('numeroCommande') numeroCommande: string,
  ): Promise<{ success: boolean }> {
    const success = await this.commandeService.cancelCommande(numeroCommande);
    if (success) {
      this.commandeGateway.emitCommandeUpdate({ type: 'cancel', numeroCommande });
    }
    return { success };
  }

  @Get(':numeroCommande')
  async getOne(
    @Param('numeroCommande') numeroCommande: string,
  ): Promise<any> {
    return this.commandeService.getCommandeByNumero(numeroCommande);
  }

  @Put('update/:numeroCommande')
  async update(
    @Param('numeroCommande') numeroCommande: string,
    @Body() body: Partial<Commande>,
  ): Promise<any> {
    return this.commandeService.updateCommande(numeroCommande, body);
  }
}



