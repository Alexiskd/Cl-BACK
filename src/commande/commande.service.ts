// src/commande/commande.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from './commande.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommandeService {
  private logger = new Logger(CommandeService.name);

  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
  ) {}

  async createCommande(data: Partial<Commande>): Promise<string> {
    try {
      const numeroCommande = uuidv4();
      const newCmd = this.commandeRepository.create({
        ...data,
        numeroCommande,
        status: 'annuler',
      });
      await this.commandeRepository.save(newCmd);
      return numeroCommande;
    } catch (error) {
      this.logger.error('Erreur création commande', error.stack);
      throw new InternalServerErrorException('Erreur création commande');
    }
  }

  async validateCommande(numeroCommande: string): Promise<boolean> {
    try {
      const cmd = await this.commandeRepository.findOne({ where: { numeroCommande } });
      if (!cmd) return false;
      cmd.status = 'payer';
      await this.commandeRepository.save(cmd);
      return true;
    } catch (error) {
      this.logger.error(`Erreur validation ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException('Erreur validation commande');
    }
  }

  async getPaidCommandesPaginated(
    page: number,
    limit: number,
  ): Promise<[Commande[], number]> {
    try {
      const qb = this.commandeRepository
        .createQueryBuilder('commande')
        .where('commande.status = :status', { status: 'payer' })
        .orderBy('commande.dateCommande', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);
      return qb.getManyAndCount();
    } catch (error) {
      this.logger.error(
        `Erreur pagination paid (page=${page} limit=${limit})`,
        error.stack,
      );
      throw new InternalServerErrorException('Erreur récupération commandes payées');
    }
  }

  async cancelCommande(numeroCommande: string): Promise<boolean> {
    try {
      const cmd = await this.commandeRepository.findOne({ where: { numeroCommande } });
      if (!cmd) return false;
      cmd.status = 'annuler';
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
      this.logger.error(`Erreur get ${numeroCommande}`, error.stack);
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
      this.logger.error(`Erreur update ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException('Erreur mise à jour commande');
    }
  }
}
