// src/commande/commande.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Commande } from './commande.entity';

@Injectable()
export class CommandeService {
  private readonly logger = new Logger(CommandeService.name);
  constructor(@InjectRepository(Commande) private repo: Repository<Commande>) {}

  async createCommande(data: Partial<Commande>): Promise<string> {
    const num = uuidv4();
    const cmd = this.repo.create({ ...data, numeroCommande: num, status: 'annuler' });
    await this.repo.save(cmd);
    return num;
  }

  async validateCommande(num: string): Promise<boolean> {
    const c = await this.repo.findOne({ where: { numeroCommande: num } });
    if (!c) return false;
    c.status = 'payer';
    await this.repo.save(c);
    return true;
  }

  async getPaidCommandesPaginated(page: number, limit: number): Promise<[Commande[], number]> {
    return this.repo.findAndCount({ where: { status: 'payer' }, skip: (page-1)*limit, take: limit, order: { createdAt: 'DESC' } });
  }

  async cancelCommande(num: string): Promise<boolean> {
    const res = await this.repo.delete({ numeroCommande: num });
    return res.affected > 0;
  }

  async getCommandeByNumero(num: string): Promise<Commande> {
    const c = await this.repo.findOne({ where: { numeroCommande: num } });
    if (!c) throw new Error('Non trouvée');
    return c;
  }

  async updateCommande(id: string, data: Partial<Commande>): Promise<Commande> {
    await this.repo.update({ id }, data);
    return this.repo.findOne({ where: { id } });
  }
}
