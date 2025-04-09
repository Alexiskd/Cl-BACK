import { Injectable, Logger } from '@nestjs/common';
import { CatalogueCle } from '../entities/catalogue-cle.entity';
import { CreateKeyDto } from './create-key.dto';

@Injectable()
export class ProduitService {
  private readonly logger = new Logger(ProduitService.name);

  // Exemple de stockage en mémoire
  private keys: CatalogueCle[] = [];

  async getKeysByMarque(marque: string): Promise<CatalogueCle[]> {
    this.logger.log(`getKeysByMarque: Recherche des clés pour la marque ${marque}`);
    // Implémentez votre logique ici
    return this.keys.filter(key => key.marque === marque);
  }

  async getKeyByName(nom: string): Promise<CatalogueCle | undefined> {
    this.logger.log(`getKeyByName: Recherche de la clé avec le nom ${nom}`);
    return this.keys.find(key => key.nom === nom);
  }

  async findBestKeyByName(nom: string): Promise<CatalogueCle> {
    this.logger.log(`findBestKeyByName: Recherche de la meilleure correspondance pour ${nom}`);
    // Pour cet exemple, on renvoie simplement la première clé dont le nom contient le paramètre
    const key = this.keys.find(key => key.nom.includes(nom));
    if (!key) {
      throw new Error('Aucune clé trouvée');
    }
    return key;
  }

  async updateKeyByName(nom: string, updates: Partial<CreateKeyDto>): Promise<CatalogueCle> {
    this.logger.log(`updateKeyByName: Mise à jour de la clé avec le nom ${nom}`);
    const index = this.keys.findIndex(key => key.nom === nom);
    if (index === -1) {
      throw new Error(`Clé avec le nom ${nom} non trouvée`);
    }
    // Mettre à jour la clé existante (pour simplifier, on écrase les propriétés fournies)
    this.keys[index] = { ...this.keys[index], ...updates };
    return this.keys[index];
  }

  async addKey(key: CatalogueCle): Promise<CatalogueCle> {
    this.logger.log(`addKey: Ajout d'une nouvelle clé ${key.nom}`);
    // On simule l'ajout en générant un ID
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
    this.logger.log(`getAllKeys: Récupération de toutes les clés (limit: ${limit}, skip: ${skip})`);
    // Pour cet exemple, on renvoie simplement une tranche du tableau
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
    this.logger.log(`getKeyByBrandAndIndex: Recherche de la clé pour la marque ${brand} et l'index ${index}`);
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
