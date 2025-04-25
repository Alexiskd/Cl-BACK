// src/commande/commande.service.ts

import { Injectable, Logger } from '@nestjs/common';
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

  async getPaidCommandesPaginated(
    page: number,
    limit: number,
  ): Promise<[Commande[], number]> {
    try {
      return await this.commandeRepository.findAndCount({
        where: { status: 'payer' },
        skip: (page - 1) * limit,
        take: limit,
      });
    } catch (error) {
      this.logger.error(
        'Erreur lors de la requête paginée des commandes payées',
        error.stack,
      );
      throw error;
    }
  }

  async cancelCommande(numeroCommande: string): Promise<boolean> {
    try {
      const result = await this.commandeRepository.delete({
        numeroCommande,
      });
      return result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'annulation de la commande ${numeroCommande}`,
        error.stack,
      );
      throw error;
    }
  }

  async getCommandeByNumero(
    numeroCommande: string,
  ): Promise<Commande> {
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

  async updateCommande(
    id: string,
    updateData: Partial<Commande>,
  ): Promise<Commande> {
    try {
      await this.commandeRepository.update({ id }, updateData);
      const updated = await this.commandeRepository.findOne({
        where: { id },
      });
      if (!updated) {
        throw new Error('Commande non trouvée.');
      }
      return updated;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de la commande ${id}`,
        error.stack,
      );
      throw error;
    }
  }
}
