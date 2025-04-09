import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ProduitService {
  // Exemple de données stockées par marque.
  private keysByBrand: { [brand: string]: Array<{ id: number, nom: string }> } = {
    'brandA': [{ id: 1, nom: 'CléA' }, { id: 2, nom: 'CléB' }],
    'brandB': [{ id: 3, nom: 'CléC' }],
  };

  constructor(private readonly logger: LoggerService) {}

  /**
   * Récupère la clé correspondant à la marque et à l’index spécifiés.
   * @param brand La marque de la clé.
   * @param index L’index de la clé dans le tableau associé.
   * @returns La clé trouvée ou un message d’erreur.
   */
  getKeyByBrandAndIndex(brand: string, index: number): any {
    this.logger.log(`Service: Récupération de la clé pour la marque ${brand} à l'index ${index}`);
    const brandKeys = this.keysByBrand[brand];
    if (brandKeys && index >= 0 && index < brandKeys.length) {
      return brandKeys[index];
    }
    return { message: `Aucune clé trouvée pour la marque ${brand} à l'index ${index}` };
  }

  /**
   * Supprime la clé correspondant au nom donné.
   * @param nom Le nom de la clé à supprimer.
   */
  async deleteKeyByName(nom: string): Promise<void> {
    this.logger.log(`Service: Suppression de la clé avec le nom "${nom}"`);
    for (const brand in this.keysByBrand) {
      const originalLength = this.keysByBrand[brand].length;
      this.keysByBrand[brand] = this.keysByBrand[brand].filter(key => key.nom !== nom);
      if (this.keysByBrand[brand].length < originalLength) {
        // Arrête dès qu'une suppression est effectuée.
        break;
      }
    }
  }
}
