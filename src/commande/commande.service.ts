import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from './commande.entity';
import { v4 as uuidv4 } from 'uuid';

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
      });
      await this.commandeRepository.save(newCommande);
      return numeroCommande;
    } catch (error) {
      this.logger.error(
        'Erreur lors de la sauvegarde de la commande',
        error.stack,
      );
      throw error;
    }
  }

  async validateCommande(numeroCommande: string): Promise<boolean> {
    try {
      const commande = await this.commandeRepository.findOne({
        where: { numeroCommande },
      });
      if (!commande) return false;
      commande.status = 'payer';
      await this.commandeRepository.save(commande);
      return true;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la validation de la commande ${numeroCommande}`,
        error.stack,
      );
      throw error;
    }
  }

  async getPaidCommandes(): Promise<Commande[]> {
    try {
      return await this.commandeRepository.find({ where: { status: 'payer' } });
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des commandes payées',
        error.stack,
      );
      throw error;
    }
  }

  async cancelCommande(numeroCommande: string): Promise<boolean> {
    try {
      const result = await this.commandeRepository.delete({ numeroCommande });
      return result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'annulation de la commande ${numeroCommande}`,
        error.stack,
      );
      throw error;
    }
  }

  async getCommandeByNumero(numeroCommande: string): Promise<Commande> {
    try {
      const commande = await this.commandeRepository.findOne({
        where: { numeroCommande },
      });
      if (!commande) {
        throw new Error('Commande non trouvée.');
      }
      return commande;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de la commande ${numeroCommande}`,
        error.stack,
      );
      throw error;
    }
  }
}
