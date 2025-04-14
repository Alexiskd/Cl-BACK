import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
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

  async getKeysByMarque(marque: string): Promise<CatalogueCle[]> {
    this.logger.log(`Service: Recherche des clés pour la marque: ${marque}`);
    if (!marque) return this.getAllKeys(10, 0);
    const cacheKey = `keysByMarque_${marque}`;
    const cached = await this.cacheManager.get<CatalogueCle[]>(cacheKey);
    if (cached) {
      this.logger.log(`Service: Clés récupérées du cache pour marque ${marque}`);
      return cached;
    }
    const keys = await this.catalogueCleRepository.find({
      select: [
        'id',
        'nom',
        'marque',
        'prix',
        'prixSansCartePropriete',
        'cleAvecCartePropriete',
        'imageUrl',
        'referenceEbauche',
        'typeReproduction',
        'descriptionNumero',
        'descriptionProduit',
        'estCleAPasse',
        'prixCleAPasse',
        'besoinPhoto',
        'besoinNumeroCle',
        'besoinNumeroCarte'
      ],
      where: { marque },
    });
    await this.cacheManager.set(cacheKey, keys, 10);
    return keys;
  }

  async getKeyByName(nom: string): Promise<CatalogueCle | undefined> {
    this.logger.log(`Service: Recherche de la clé avec le nom: ${nom}`);
    return this.catalogueCleRepository.findOne({ where: { nom } });
  }

  async findClosestKey(nom: string): Promise<CatalogueCle> {
    this.logger.log(`Service: Recherche de la clé la plus proche pour le nom "${nom}"`);
    const candidates = await this.catalogueCleRepository
      .createQueryBuilder('cle')
      .where('cle.nom ILIKE :nom', { nom: `%${nom.trim()}%` })
      .getMany();

    if (candidates.length === 0) {
      throw new NotFoundException(`Aucune clé trouvée pour le nom "${nom}"`);
    }

    // Fonction de calcul de la distance de Levenshtein
    const levenshteinDistance = (a: string, b: string): number => {
      const m = a.length, n = b.length;
      const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + cost
          );
        }
      }
      return dp[m][n];
    };

    candidates.sort((a, b) =>
      levenshteinDistance(nom.trim().toLowerCase(), a.nom.trim().toLowerCase()) -
      levenshteinDistance(nom.trim().toLowerCase(), b.nom.trim().toLowerCase())
    );

    return candidates[0];
  }

  async updateKeyByName(nom: string, updates: Partial<CatalogueCle>): Promise<CatalogueCle> {
    const key = await this.catalogueCleRepository.findOne({ where: { nom } });
    if (!key) throw new NotFoundException(`Clé avec le nom "${nom}" introuvable`);
    Object.assign(key, updates);
    this.logger.log(`Service: Mise à jour de la clé: ${nom}`);
    return this.catalogueCleRepository.save(key);
  }

  async addKey(newKey: CatalogueCle): Promise<CatalogueCle> {
    const existingKey = await this.catalogueCleRepository.findOne({ where: { nom: newKey
