import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
  UseInterceptors,
  UploadedFiles,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CommandeService } from './commande.service';
import { Commande } from './commande.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
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

      // Si la carte est perdue, le chemin du justificatif est requis
      if (
        body.lostCartePropriete === 'true' &&
        (!body.domicileJustificatifPath ||
          body.domicileJustificatifPath.trim() === '')
      ) {
        throw new InternalServerErrorException(
          "Le chemin du justificatif de domicile est requis.",
        );
      }

      const hasCartePropriete =
        body.propertyCardNumber && body.propertyCardNumber.trim() !== ''
          ? true
          : false;

      const commandeData: Partial<Commande> = {
        nom: body.nom,
        adressePostale: `${body.address}, ${body.postalCode}, ${body.additionalInfo}`,
        telephone: body.phone,
        adresseMail: body.email,
        cle:
          body.articleName && body.articleName.trim() !== ''
            ? [body.articleName]
            : [],
        numeroCle:
          body.keyNumber && body.keyNumber.trim() !== ''
            ? [body.keyNumber]
            : [],
        propertyCardNumber:
          body.propertyCardNumber && body.propertyCardNumber.trim() !== ''
            ? body.propertyCardNumber
            : null,
        typeLivraison:
          body.keyNumber && body.keyNumber.trim() !== ''
            ? ['par numero']
            : ['par envoie postale'],
        shippingMethod: body.shippingMethod || '',
        deliveryType: body.deliveryType || '',
        urlPhotoRecto:
          files.frontPhoto && files.frontPhoto.length > 0
            ? files.frontPhoto[0].buffer.toString('base64')
            : null,
        urlPhotoVerso:
          files.backPhoto && files.backPhoto.length > 0
            ? files.backPhoto[0].buffer.toString('base64')
            : null,
        prix: body.prix ? parseFloat(body.prix) : 0,
        isCleAPasse:
          body.isCleAPasse !== undefined ? body.isCleAPasse === 'true' : null,
        hasCartePropriete: hasCartePropriete,
        idCardFront:
          files.idCardFront && files.idCardFront.length > 0
            ? files.idCardFront[0].buffer.toString('base64')
            : null,
        idCardBack:
          files.idCardBack && files.idCardBack.length > 0
            ? files.idCardBack[0].buffer.toString('base64')
            : null,
        domicileJustificatif: body.domicileJustificatifPath || null,
        attestationPropriete:
          body.attestationPropriete !== undefined
            ? body.attestationPropriete === 'true'
            : null,
      };

      const numeroCommande = await this.commandeService.createCommande(
        commandeData,
      );
      return { numeroCommande };
    } catch (error) {
      this.logger.error(
        'Erreur lors de la création de la commande',
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la création de la commande.",
      );
    }
  }

  @Patch('validate/:numeroCommande')
  async validate(
    @Param('numeroCommande') numeroCommande: string,
  ): Promise<{ success: boolean }> {
    try {
      const success = await this.commandeService.validateCommande(numeroCommande);
      if (success) {
        // Émission de l’événement via Socket.IO
        this.commandeGateway.emitCommandeUpdate({
          type: 'validate',
          numeroCommande,
        });
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Erreur lors de la validation de la commande ${numeroCommande}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la validation de la commande.',
      );
    }
  }

  @Get('paid')
  async getPaidCommandes(): Promise<Commande[]> {
    try {
      return await this.commandeService.getPaidCommandes();
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des commandes payées',
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des commandes payées.",
      );
    }
  }

  @Delete('cancel/:numeroCommande')
  async cancel(
    @Param('numeroCommande') numeroCommande: string,
  ): Promise<{ success: boolean }> {
    try {
      const success = await this.commandeService.cancelCommande(numeroCommande);
      if (success) {
        // Émission de l’événement via Socket.IO
        this.commandeGateway.emitCommandeUpdate({
          type: 'cancel',
          numeroCommande,
        });
      }
      return { success };
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'annulation de la commande ${numeroCommande}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de l'annulation de la commande.",
      );
    }
  }

  @Get(':numeroCommande')
  async getCommande(
    @Param('numeroCommande') numeroCommande: string,
  ): Promise<Commande> {
    try {
      return await this.commandeService.getCommandeByNumero(numeroCommande);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de la commande ${numeroCommande}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération de la commande.",
      );
    }
  }
}
