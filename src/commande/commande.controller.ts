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

      // Validation du justificatif de domicile
      if (
        body.lostCartePropriete === 'true' &&
        !body.domicileJustificatifPath?.trim()
      ) {
        throw new HttpException(
          'Le chemin du justificatif de domicile est requis.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hasCartePropriete = !!body.propertyCardNumber?.trim();

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

      const nouvelleCommande = await this.commandeService.createCommande(
        commandeData,
      );

      this.commandeGateway.emitCommandeUpdate({
        type: 'create',
        numeroCommande: nouvelleCommande.numeroCommande,
      });

      return {
        numeroCommande: nouvelleCommande.numeroCommande,
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

  @Get('paid')
  async getPaidCommandes(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    try {
      // Utilisation de QueryBuilder pour ordonner sur dateCommande sans erreur TS
      const [data, count] = await this.commandeService.getPaidCommandesPaginated(
        +page,
        +limit,
      );
      return { data, count };
    } catch (error) {
      this.logger.error(
        `Erreur récupération commandes payées (page=${page}, limit=${limit})`,
        error.stack,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'GetPaidCommandesError',
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ... autres routes inchangées (validate, cancel, get, update)
}


// src/commande/commande.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from './commande.entity';

@Injectable()
export class CommandeService {
  private readonly logger = new Logger(CommandeService.name);

  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
  ) {}

  async createCommande(data: Partial<Commande>): Promise<Commande> {
    try {
      const cmd = this.commandeRepository.create(data);
      return await this.commandeRepository.save(cmd);
    } catch (error) {
      this.logger.error('Erreur création commande', error.stack);
      throw new InternalServerErrorException('Erreur création commande');
    }
  }

  async getPaidCommandesPaginated(
    page: number,
    limit: number,
  ): Promise<[Commande[], number]> {
    try {
      // QueryBuilder pour éviter l'erreur de type sur order
      return await this.commandeRepository
        .createQueryBuilder('commande')
        .where('commande.status = :status', { status: 'paid' })
        .orderBy('commande.dateCommande', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
    } catch (error) {
      this.logger.error(
        `getPaidCommandesPaginated failed (page=${page}, limit=${limit})`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Erreur récupération commandes payées : ${error.message}`,
      );
    }
  }

  // ... autres méthodes inchangées (validate, cancel, getByNumero, update)
}
