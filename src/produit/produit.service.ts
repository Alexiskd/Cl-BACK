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
        'estCleAPasse',
        'prixCleAPasse',
        'besoinPhoto',
        'besoinNumeroCle',
        'besoinNumeroCarte',
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

  async findBestKeyByName(nom: string): Promise<CatalogueCle> {
    this.logger.log(`Service: Recherche de la meilleure correspondance pour le nom "${nom}"`);
    
    // Recherche initiale avec ILIKE sur le nom (insensible à la casse)
    let candidates = await this.catalogueCleRepository
      .createQueryBuilder('cle')
      .where('cle.nom ILIKE :nom', { nom: `%${nom.trim()}%` })
      .getMany();

    // Si aucun candidat n'est trouvé, fallback sur l'ensemble des clés
    if (candidates.length === 0) {
      this.logger.log(`Service: Aucun candidat trouvé pour "${nom}" avec ILIKE, utilisation du fallback sur toutes les clés.`);
      candidates = await this.catalogueCleRepository.find();
      if (candidates.length === 0) {
        throw new NotFoundException(`Aucune clé disponible dans la base de données.`);
      }
    }

    // Fonction pour calculer la distance de Levenshtein entre deux chaînes
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

    const normalizedNom = nom.trim().toLowerCase();

    // Trie des candidats par distance de Levenshtein
    candidates.sort((a, b) => {
      const distA = levenshteinDistance(normalizedNom, a.nom.trim().toLowerCase());
      const distB = levenshteinDistance(normalizedNom, b.nom.trim().toLowerCase());
      return distA - distB;
    });

    // Retourne la meilleure correspondance
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
    const existingKey = await this.catalogueCleRepository.findOne({ where: { nom: newKey.nom } });
    if (existingKey) throw new BadRequestException(`Une clé avec le nom "${newKey.nom}" existe déjà.`);
    this.logger.log(`Service: Ajout de la clé: ${newKey.nom}`);
    return this.catalogueCleRepository.save(newKey);
  }

  async addKeys(newKeys: CatalogueCle[]): Promise<CatalogueCle[]> {
    for (const key of newKeys) {
      const existingKey = await this.catalogueCleRepository.findOne({ where: { nom: key.nom } });
      if (existingKey) throw new BadRequestException(`Une clé avec le nom "${key.nom}" existe déjà.`);
    }
    this.logger.log(`Service: Ajout de ${newKeys.length} clés en batch.`);
    return this.catalogueCleRepository.save(newKeys);
  }

  async getAllKeys(limit: number, skip: number): Promise<CatalogueCle[]> {
    this.logger.log(`Service: Récupération de toutes les clés (limit: ${limit}, skip: ${skip})`);
    const cacheKey = `allKeys_${limit}_${skip}`;
    const cached = await this.cacheManager.get<CatalogueCle[]>(cacheKey);
    if (cached) {
      this.logger.log('Service: Clés récupérées du cache');
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
        'descriptionNume
