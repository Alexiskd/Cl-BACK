import { Injectable } from '@angular/core';
// Importez le service de log ou créez-le selon votre implémentation
import { LoggerService } from '../logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  constructor(private logger: LoggerService) { }

  /**
   * Récupère les clés stockées dans le cache pour une marque donnée.
   * @param marque - La marque dont on souhaite récupérer les clés en cache.
   * @returns Les clés récupérées ou null si non trouvées.
   */
  recupererCacheMarque(marque: string): any {
    // Utilisation d'un template literal pour formater correctement la chaîne avec interpolation de variable
    this.logger.log(`Service: Clés récupérées du cache pour marque ${marque}`);
    
    // Exemple de logique pour récupérer un objet en cache
    const cache: { [key: string]: any } = {
      'MarqueA': { id: 1, nom: 'CléA' },
      'MarqueB': { id: 2, nom: 'CléB' }
    };
    
    const result = cache[marque] || null;
    return result;
  }

  /**
   * Recherche une clé par son nom.
   * @param nom - Le nom de la clé à rechercher.
   * @returns La clé correspondante ou la meilleure correspondance si aucune correspondance exacte n'est trouvée.
   */
  rechercherCle(nom: string): any {
    // Journalisation de la recherche avec interpolation de variable
    this.logger.log(`Service: Recherche de la clé avec le nom: ${nom}`);

    // Exemple de logique de recherche dans un tableau d'objets
    const cles = [
      { id: 1, nom: 'CléA' },
      { id: 2, nom: 'CléB' },
      { id: 3, nom: 'CléC' }
    ];

    // Recherche d'une correspondance exacte
    let result = cles.find(cle => cle.nom === nom);
    
    // Si aucune correspondance exacte, journaliser et appliquer une logique de meilleure correspondance
    if (!result) {
      this.logger.log(`Aucune correspondance exacte trouvée pour "${nom}", utilisation de la meilleure correspondance.`);
      // Exemple : on recherche une clé dont le nom contient le critère recherché (en minuscule pour insensibilité à la casse)
      result = cles.find(cle => cle.nom.toLowerCase().includes(nom.toLowerCase())) || null;
    }
    return result;
  }
}
