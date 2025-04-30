import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Commande } from './commande.entity';

@Injectable()
export class CommandeService {
  private readonly logger = new Logger(CommandeService.name);

  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
  ) {}

  async createCommande(data: Partial<Commande>): Promise<string> {
    try {
      const numeroCommande = uuidv4();

      const newCommande = this.commandeRepository.create({
        ...data,
        numeroCommande,
        status: 'annuler',
        cle: Array.isArray(data.cle) ? data.cle : [],
        typeLivraison: Array.isArray(data.typeLivraison) ? data.typeLivraison : [],
        numeroCle: Array.isArray(data.numeroCle) ? data.numeroCle : [],
      });

      await this.commandeRepository.save(newCommande);
      return numeroCommande;
    } catch (error) {
      this.logger.error('Erreur lors de la sauvegarde de la commande', error.stack || error.message);
      throw new InternalServerErrorException('Erreur création commande');
    }
  }

  async validateCommande(numeroCommande: string): Promise<boolean> {
    try {
      const commande = await this.commandeRepository.findOne({ where: { numeroCommande } });
      if (!commande) return false;
      if (commande.status === 'payer') return true;
      commande.status = 'payer';
      await this.commandeRepository.save(commande);
      return true;
    } catch (error) {
      this.logger.error(`Erreur validation commande ${numeroCommande}`, error.stack || error.message);
      throw new InternalServerErrorException('Erreur validation commande');
    }
  }

  async getPaidCommandesPaginated(page: number, limit: number): Promise<[Commande[], number]> {
    try {
      if (!Number.isInteger(page) || !Number.isInteger(limit) || page <= 0 || limit <= 0) {
        this.logger.error(`Paramètres pagination invalides : page=${page}, limit=${limit}`);
        throw new Error('Paramètres de pagination invalides');
      }

      const skip = (page - 1) * limit;
      this.logger.log(`getPaidCommandesPaginated: skip=${skip}, take=${limit}`);

      // Correction en base si certains champs sont NULL (pour éviter erreur 500)
      await this.commandeRepository.query(`
        UPDATE commande SET cle = '' WHERE cle IS NULL;
      `);
      await this.commandeRepository.query(`
        UPDATE commande SET typeLivraison = '' WHERE typeLivraison IS NULL;
      `);
      await this.commandeRepository.query(`
        UPDATE commande SET numeroCle = '' WHERE numeroCle IS NULL;
      `);

      const [result, count] = await this.commandeRepository.findAndCount({
        where: { status: 'payer' },
        skip,
        take: limit,
        order: { id: 'DESC' },
      });

      return [result, count];
    } catch (error) {
      this.logger.error(
        `Erreur récupération commandes payées (page=${page}, limit=${limit})`,
        error.stack || error.message,
      );
      throw new InternalServerErrorException('Erreur récupération commandes payées');
    }
  }

  async cancelCommande(numeroCommande: string): Promise<boolean> {
    try {
      const result = await this.commandeRepository.delete({ numeroCommande });
      return result.affected > 0;
    } catch (error) {
      this.logger.error(`Erreur annulation commande ${numeroCommande}`, error.stack || error.message);
      throw new InternalServerErrorException('Erreur annulation commande');
    }
  }

  async getCommandeByNumero(numeroCommande: string): Promise<Commande> {
    try {
      const commande = await this.commandeRepository.findOne({ where: { numeroCommande } });
      if (!commande) throw new Error('Commande non trouvée.');
      return commande;
    } catch (error) {
      this.logger.error(`Erreur récupération commande ${numeroCommande}`, error.stack || error.message);
      throw new InternalServerErrorException('Erreur récupération commande');
    }
  }

  async updateCommande(id: string, updateData: Partial<Commande>): Promise<Commande> {
    try {
      await this.commandeRepository.update({ id }, updateData);
      const updatedCommande = await this.commandeRepository.findOne({ where: { id } });
      if (!updatedCommande) throw new Error('Commande non trouvée.');
      return updatedCommande;
    } catch (error) {
      this.logger.error(`Erreur mise à jour commande ${id}`, error.stack || error.message);
      throw new InternalServerErrorException('Erreur mise à jour commande');
    }
  }
}

