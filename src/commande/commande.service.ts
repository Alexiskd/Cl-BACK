import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from './commande.entity';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
  ) {}

  async createCommande(data: Partial<Commande>): Promise<Commande> {
    try {
      const cmd = this.commandeRepository.create(data);
      return await this.commandeRepository.save(cmd);
    } catch (error) {
      throw new InternalServerErrorException('Erreur création commande');
    }
  }

  async validateCommande(numeroCommande: string): Promise<boolean> {
    const cmd = await this.commandeRepository.findOne({ where: { numeroCommande } });
    if (!cmd) return false;
    cmd.status = 'paid';
    await this.commandeRepository.save(cmd);
    return true;
  }

  async getPaidCommandesPaginated(
    page: number,
    limit: number,
  ): Promise<[Commande[], number]> {
    return this.commandeRepository.findAndCount({
      where: { status: 'paid' },
      order: { dateCommande: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async cancelCommande(numeroCommande: string): Promise<boolean> {
    const cmd = await this.commandeRepository.findOne({ where: { numeroCommande } });
    if (!cmd) return false;
    cmd.status = 'cancelled';
    await this.commandeRepository.save(cmd);
    return true;
  }

  async getCommandeByNumero(numeroCommande: string): Promise<Commande> {
    return await this.commandeRepository.findOne({ where: { numeroCommande } });
  }

  async updateCommande(numeroCommande: string, updateData: Partial<Commande>): Promise<Commande> {
    await this.commandeRepository.update({ numeroCommande }, updateData);
    return this.getCommandeByNumero(numeroCommande);
  }
}
