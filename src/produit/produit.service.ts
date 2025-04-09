import { Injectable, Logger } from '@nestjs/common';
import { CatalogueCle } from '../entities/catalogue-cle.entity';
import { CreateKeyDto } from './create-key.dto';

@Injectable()
export class ProduitService {
  private readonly logger = new Logger(ProduitService.name);
  private keys: CatalogueCle[] = [];

  async getKeysByMarque(marque: string): Promise<CatalogueCle[]> {
    this.logger.log(`getKeysByMarque: Recherche pour la marque ${marque}`);
    return this.keys.filter(key => key.marque === marque);
  }

  async getKeyByName(nom: string): Promise<CatalogueCle | undefined> {
    this.logger.log(`getKeyByName: Recherche de la clé avec le nom ${nom}`);
    return this.keys.find(key => key.nom === nom);
  }

  async findBestKeyByName(nom: string): Promise<CatalogueCle> {
    this.logger.log(`findBestKeyByName: Recherche de la meilleure clé pour ${nom}`);
    const key = this.keys.find(key => key.nom.includes(nom));
    if (!key) {
      throw new Error('Aucune clé trouvée');
    }
    return key;
  }

  async updateKeyByName(nom: string, updates: Partial<CreateKeyDto>): Promise<CatalogueCle> {
    this.logger.log(`updateKeyByName: Mise à jour de la clé ${nom}`);
    const index = this.keys.findIndex(key => key.nom === nom);
    if (index === -1) {
      throw new Error(`Clé avec le nom ${nom} non trouvée`);
    }
    this.keys[index] = { ...this.keys[index], ...updates };
    return this.keys[index];
  }

  async addKey(key: CatalogueCle): Promise<CatalogueCle> {
    this.logger.log(`addKey: Ajout de la clé ${key.nom}`);
    key.id = Date.now();
    this.keys.push(key);
    return key;
  }

  async addKeys(keys: CatalogueCle[]): Promise<CatalogueCle[]> {
    this.logger.log(`addKeys: Ajout de ${keys.length} clés`);
    const keysAdded: CatalogueCle[] = [];
    for (const key of keys) {
      key.id = Date.now() + Math.floor(Math.random() * 1000);
      this.keys.push(key);
      keysAdded.push(key);
    }
    return keysAdded;
  }

  async getAllKeys(limit: number, skip: number): Promise<CatalogueCle[]> {
    this.logger.log(`getAllKeys: Récupération des clés (limit: ${limit}, skip: ${skip})`);
    return this.keys.slice(skip, skip + limit);
  }

  async countKeys(): Promise<number> {
    this.logger.log(`countKeys: Nombre total de clés`);
    return this.keys.length;
  }

  async getKeyByIndex(index: number): Promise<CatalogueCle> {
    this.logger.log(`getKeyByIndex: Récupération de la clé à l'index ${index}`);
    if (index < 0 || index >= this.keys.length) {
      throw new Error('Index invalide');
    }
    return this.keys[index];
  }

  async countKeysByBrand(brand: string): Promise<number> {
    this.logger.log(`countKeysByBrand: Nombre de clés pour la marque ${brand}`);
    return this.keys.filter(key => key.marque === brand).length;
  }

  async getKeyByBrandAndIndex(brand: string, index: number): Promise<CatalogueCle> {
    this.logger.log(`getKeyByBrandAndIndex: Récupération de la clé pour la marque ${brand} et l'index ${index}`);
    const keysByBrand = this.keys.filter(key => key.marque === brand);
    if (index < 0 || index >= keysByBrand.length) {
      throw new Error('Index invalide pour la marque donnée');
    }
    return keysByBrand[index];
  }

  async deleteKeyByName(nom: string): Promise<void> {
    this.logger.log(`deleteKeyByName: Suppression de la clé avec le nom ${nom}`);
    this.keys = this.keys.filter(key => key.nom !== nom);
  }
}
