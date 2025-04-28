
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

  async create(
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
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

      const hasCartePropriete =
        body.propertyCardNumber && body.propertyCardNumber.trim() !== '';

      const commandeData: Partial<Commande> = {
        nom: body.nom,
        adressePostale: `${body.address}, ${body.postalCode}, ${body.ville}, ${body.additionalInfo}`,
        telephone: body.phone,
        adresseMail: body.email,
        cle: body.articleName && body.articleName.trim() !== '' ? [body.articleName] : [],
        numeroCle: body.keyNumber && body.keyNumber.trim() !== '' ? [body.keyNumber] : [],
        propertyCardNumber: body.propertyCardNumber && body.propertyCardNumber.trim() !== ''
          ? body.propertyCardNumber
          : null,
        typeLivraison: body.keyNumber && body.keyNumber.trim() !== ''
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
        hasCartePropriete,
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
          body.attestationPropriete !== undefined ? body.attestationPropriete === 'true' : null,
        ville: body.ville || '',
      };

      // La méthode createCommande renvoie maintenant un objet Commande
      const commande = await this.commandeService.createCommande(commandeData);
      // On retourne explicitement la propriété numeroCommande
      return { numeroCommande: commande.numeroCommande };
    } catch (error) {
      this.logger.error('Erreur lors de la création de la commande', error.stack);
      throw new InternalServerErrorException('Erreur lors de la création de la commande.');
    }
  }
  }

  async validateCommande(numeroCommande: string): Promise<boolean> {
    try {
      const cmd = await this.commandeRepository.findOne({ where: { numeroCommande } });
      if (!cmd) return false;
      cmd.status = 'paid';
      await this.commandeRepository.save(cmd);
      return true;
    } catch (error) {
      this.logger.error(`Erreur validation ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException('Erreur validation commande');
    }
  }

  // DEBUG catch to expose error.message
  async getPaidCommandesPaginated(
    page: number,
    limit: number,
  ): Promise<[Commande[], number]> {
    try {
      return await this.commandeRepository.findAndCount({
        where: { status: 'paid' },
        order: { dateCommande: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
    } catch (error) {
      this.logger.error(
        `getPaidCommandesPaginated failed (page=${page}, limit=${limit})`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async cancelCommande(numeroCommande: string): Promise<boolean> {
    try {
      const cmd = await this.commandeRepository.findOne({ where: { numeroCommande } });
      if (!cmd) return false;
      cmd.status = 'cancelled';
      await this.commandeRepository.save(cmd);
      return true;
    } catch (error) {
      this.logger.error(`Erreur annulation ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException('Erreur annulation commande');
    }
  }

  async getCommandeByNumero(numeroCommande: string): Promise<Commande> {
    try {
      const cmd = await this.commandeRepository.findOne({ where: { numeroCommande } });
      if (!cmd) throw new InternalServerErrorException('Commande non trouvée');
      return cmd;
    } catch (error) {
      this.logger.error(`Erreur récupération ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException('Erreur récupération commande');
    }
  }

  async updateCommande(
    numeroCommande: string,
    updateData: Partial<Commande>,
  ): Promise<Commande> {
    try {
      await this.commandeRepository.update({ numeroCommande }, updateData);
      return this.getCommandeByNumero(numeroCommande);
    } catch (error) {
      this.logger.error(`Erreur mise à jour ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException('Erreur mise à jour commande');
    }
  }
}
