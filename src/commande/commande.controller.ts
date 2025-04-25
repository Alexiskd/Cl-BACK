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
  HttpException,
  HttpStatus,
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
      { storage: memoryStorage() },
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
  ): Promise<{ numeroCommande: string; dateCommande: Date }> {
    try {
      this.logger.log(`Body reçu : ${JSON.stringify(body)}`);

      // Validation du justificatif de domicile si carte de propriété manquante
      if (
        body.lostCartePropriete === 'true' &&
        (!body.domicileJustificatifPath || !body.domicileJustificatifPath.trim())
      ) {
        throw new HttpException(
          'Le chemin du justificatif de domicile est requis.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hasCartePropriete = !!(
        body.propertyCardNumber && body.propertyCardNumber.trim()
      );

      const commandeData: Partial<any> = {
        nom: body.nom,
        adressePostale: `${body.address}, ${body.postalCode}, ${body.ville}, ${body.additionalInfo}`,
        telephone: body.phone,
        adresseMail: body.email,
        cle: body.articleName?.trim() ? [body.articleName] : [],
        numeroCle: body.keyNumber?.trim() ? [body.keyNumber] : [],
        propertyCardNumber: body.propertyCardNumber?.trim() || null,
        typeLivraison: body.keyNumber?.trim()
          ? ['par numero']
          : ['par envoi postal'],
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

      const nouvelleCommande = await this.commandeService.createCommande(
        commandeData,
      );

      // On émet l’événement websocket
      this.commandeGateway.emitCommandeUpdate({ type: 'create', numeroCommande: nouvelleCommande.numeroCommande });

      return {
        numeroCommande: nouvelleCommande.
        numeroCommande,
        dateCommande: nouvelleCommande.dateCommande,
      };
    } catch (error) {
      this.logger.error('Erreur création commande', error.stack);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Erreur création commande : ${error.message}`,
      );
    }
  }
