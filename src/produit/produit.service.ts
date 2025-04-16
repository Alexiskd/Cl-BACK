import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogueCle } from '../entities/catalogue-cle.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProduitService {
  private readonly logger = new Logger(ProduitService.name);

  constructor(
    @InjectRepository(CatalogueCle)
    private readonly catalogueCleRepository: Repository<CatalogueCle>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getKeyByName(nom: string): Promise<CatalogueCle> {
    const key = await this.catalogueCleRepository
      .createQueryBuilder('cle')
      .where('unaccent(lower(cle.nom)) = unaccent(lower(:nom))', { nom: nom.trim() })
      .getOne();

    if (!key) {
      throw new NotFoundException('Produit introuvable.');
    }
    return key;
  }

  async findClosestMatch(nom: string): Promise<CatalogueCle> {
    const keys = await this.catalogueCleRepository.find();

    if (!keys.length) throw new NotFoundException('Aucune clé disponible.');

    const levenshteinDistance = (a: string, b: string): number => {
      const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
      for (let i = 0; i <= a.length; i++) dp[i][0] = i;
      for (let j = 0; j <= b.length; j++) dp[0][j] = j;

      for (let i = 1; i <= a.length; i++)
        for (let j = 1; j <= b.length; j++)
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
          );

      return dp[a.length][b.length];
    };

    keys.sort(
      (a, b) =>
        levenshteinDistance(nom.toLowerCase(), a.nom.toLowerCase()) -
        levenshteinDistance(nom.toLowerCase(), b.nom.toLowerCase()),
    );

    return keys[0];
  }

  async updateKeyByName(nom: string, updates: Partial<CatalogueCle>): Promise<CatalogueCle> {
    const key = await this.catalogueCleRepository.findOne({ where: { nom } });
    if (!key) throw new NotFoundException(`Clé "${nom}" introuvable`);
    Object.assign(key, updates);
    return this.catalogueCleRepository.save(key);
  }

  async addKey(newKey: CatalogueCle): Promise<CatalogueCle> {
    const existingKey = await this.catalogueCleRepository.findOne({ where: { nom: newKey.nom } });
    if (existingKey) throw new BadRequestException(`Clé "${newKey.nom}" existe déjà.`);
    return this.catalogueCleRepository.save(newKey);
  }

  async addKeys(newKeys: CatalogueCle[]): Promise<CatalogueCle[]> {
    return this.catalogueCleRepository.save(newKeys);
  }

  async getKeysByMarque(marque: string): Promise<CatalogueCle[]> {
    return this.catalogueCleRepository.find({ where: { marque } });
  }

  async getAllKeys(limit: number, skip: number): Promise<CatalogueCle[]> {
    return this.catalogueCleRepository.find({ take: limit, skip, order: { id: 'DESC' } });
  }

  async countKeys(): Promise<number> {
    return this.catalogueCleRepository.count();
  }

  async getKeyByIndex(index: number): Promise<CatalogueCle> {
    const keys = await this.catalogueCleRepository.find({ skip: index, take: 1, order: { id: 'DESC' } });
    if (!keys[0]) throw new NotFoundException('Clé non trouvée.');
    return keys[0];
  }

  async countKeysByBrand(brand: string): Promise<number> {
    return this.catalogueCleRepository.count({ where: { marque: brand } });
  }

  async getKeyByBrandAndIndex(brand: string, index: number): Promise<CatalogueCle> {
    const keys = await this.catalogueCleRepository.find({ where: { marque: brand }, skip: index, take: 1 });
    if (!keys[0]) throw new NotFoundException('Clé non trouvée.');
    return keys[0];
  }

  async deleteKeyByName(nom: string): Promise<void> {
    await this.catalogueCleRepository.delete({ nom });
  }
}

