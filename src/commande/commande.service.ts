// src/commande/commande.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Commande } from './commande.entity';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
  ) {}

  /**
   * Crée une nouvelle commande et renvoie l'entité complète (dont dateCommande).
   */
  async createCommande(data: Partial<Commande>): Promise<Commande> {
    try {
      const cmd = this.commandeRepository.create(data);
      return await this.commandeRepository.save(cmd);
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la création de la commande');
    }
  }

  /**
   * Passe le statut de la commande à "validé".
   */
  async validateCommande(numeroCommande: string): Promise<boolean> {
    const result: UpdateResult = await this.commandeRepository.update(
      { numeroCommande },
      { status: 'validé' },
    );
    return result.affected > 0;
  }

  /**
   * Récupère les commandes payées paginées.
   */
  async getPaidCommandesPaginated(
    page: number,
    limit: number,
  ): Promise<[Commande[], number]> {
    return this.commandeRepository.findAndCount({
      where: { status: 'payé' },
      skip: (page - 1) * limit,
      take: limit,
      order: { dateCommande: 'DESC' },  // optionnel : trier par date de commande
    });
  }

  /**
   * Passe le statut de la commande à "annulé".
   */
  async cancelCommande(numeroCommande: string): Promise<boolean> {
    const result: UpdateResult = await this.commandeRepository.update(
      { numeroCommande },
      { status: 'annulé' },
    );
    return result.affected > 0;
  }

  /**
   * Récupère une commande par son numéro (renvoie l'entité complète).
   */
  async getCommandeByNumero(numeroCommande: string): Promise<Commande> {
    return this.commandeRepository.findOneOrFail({
      where: { numeroCommande },
    });
  }

  /**
   * Met à jour une commande par son id interne.
   */
  async updateCommande(
    id: string,
    updateData: Partial<Commande>,
  ): Promise<UpdateResult> {
    return this.commandeRepository.update({ id }, updateData);
  }
}

