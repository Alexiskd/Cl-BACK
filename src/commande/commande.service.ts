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

  async validateCommande(numeroCommande: string): Promise<boolean> {
    try {
      const cmd = await this.commandeRepository.findOne({ where: { numeroCommande } });
      if (!cmd) return false;
      cmd.status = 'paid';
      await this.commandeRepository.save(cmd);
      return true;
    } catch (error) {
      this.logger.error(`Erreur validation commande ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException('Erreur validation commande');
    }
  }

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
      throw new InternalServerErrorException(
        `Erreur récupération commandes payées : ${error.message}`,
      );
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
      this.logger.error(`Erreur annulation commande ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException('Erreur annulation commande');
    }
  }

  async getCommandeByNumero(numeroCommande: string): Promise<Commande> {
    try {
      const cmd = await this.commandeRepository.findOne({ where: { numeroCommande } });
      if (!cmd) throw new InternalServerErrorException('Commande non trouvée');
      return cmd;
    } catch (error) {
      this.logger.error(`Erreur récupération commande ${numeroCommande}`, error.stack);
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
      this.logger.error(`Erreur mise à jour commande ${numeroCommande}`, error.stack);
      throw new InternalServerErrorException('Erreur mise à jour commande');
    }
  }
}
