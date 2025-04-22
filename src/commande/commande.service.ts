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
    const numeroCommande = uuidv4();
    const newCommande = this.commandeRepository.create({
      ...data,
      numeroCommande,
      status: 'annuler',
    });
    const saved = await this.commandeRepository.save(newCommande);
    this.logger.log(`Commande créée à ${saved.createdAt}`);
    return numeroCommande;
  }

  async validateCommande(numeroCommande: string): Promise<boolean> {
    const commande = await this.commandeRepository.findOne({
      where: { numeroCommande },
    });
    if (!commande) return false;
    commande.status = 'payer';
    await this.commandeRepository.save(commande);
    return true;
  }

  async getPaidCommandesPaginated(
    page: number,
    limit: number,
  ): Promise<[Commande[], number]> {
    return this.commandeRepository.findAndCount({
      where: { status: 'payer' },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async cancelCommande(numeroCommande: string): Promise<boolean> {
    const result = await this.commandeRepository.delete({
      numeroCommande,
    });
    return result.affected > 0;
  }

  async getCommandeByNumero(
    numeroCommande: string,
  ): Promise<Commande> {
    return await this.commandeRepository.findOneOrFail({
      where: { numeroCommande },
    });
  }

  async updateCommande(
    id: string,
    updateData: Partial<Commande>,
  ): Promise<Commande> {
    await this.commandeRepository.update({ id }, updateData);
    return await this.commandeRepository.findOneOrFail({ where: { id } });
  }
}
