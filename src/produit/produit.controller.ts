import { 
  Controller,
  Get,
  Query,
  Param,
  Put,
  Body,
  Post,
  Delete,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import { ProduitService } from './produit.service';
import { CatalogueCle } from '../entities/catalogue-cle.entity';
import { CreateKeyDto } from './create-key.dto';
import { LoggingInterceptor } from '../logging.interceptor';

@UseInterceptors(LoggingInterceptor)
@Controller('produit')
export class ProduitController {
  private readonly logger = new Logger(ProduitController.name);

  constructor(private readonly produitService: ProduitService) {}

  // Récupère les clés pour une marque donnée
  @Get('cles')
  async getKeysByMarque(@Query('marque') marque: string): Promise<CatalogueCle[]> {
    this.logger.log(`Requête reçue sur /cles avec marque: ${marque}`);
    return this.produitService.getKeysByMarque(marque);
  }

  // Recherche une clé par son nom exact
  @Get('cles/by-name')
  async getKeyByName(@Query('nom') nom: string): Promise<CatalogueCle | undefined> {
    this.logger.log(`Requête reçue sur /cles/by-name avec nom: ${nom}`);
    return this.produitService.getKeyByName(nom);
  }

  // Recherche et retourne les 2 meilleures correspondances selon le nom (distance de Levenshtein)
  @Get('cles/best-by-name')
  async bestKeyByName(@Query('nom') nom: string): Promise<CatalogueCle[]> {
    this.logger.log(`Requête pour les meilleures correspondances par nom: ${nom}`);
    return this.produitService.findTop2KeysByName(nom);
  }

  // Mise à jour d'une clé identifiée par son nom
  @Put('cles/update')
  async updateKeyByName(
    @Query('nom') nom: string,
    @Body() updates: Partial<CreateKeyDto>,
  ): Promise<CatalogueCle> {
    this.logger.log(`Requête PUT reçue pour nom: ${nom}`);
    return this.produitService.updateKeyByName(nom, updates);
  }

  // Ajout d'une nouvelle clé
  @Post('cles/add')
  async addKey(@Body() newKey: CreateKeyDto): Promise<CatalogueCle> {
    const keyToAdd: CatalogueCle = {
      ...newKey,
      id: undefined,
      imageUrl: newKey.imageUrl ?? '',
      prixSansCartePropriete: newKey.prixSansCartePropriete ?? 0,
      referenceEbauche: newKey.referenceEbauche?.trim() || null,
      // Nouveaux champs existants
      typeReproduction: newKey.typeReproduction,
      descriptionNumero: newKey.descriptionNumero ?? '',
      descriptionProduit: newKey.descriptionProduit ?? '',
      estCleAPasse: newKey.estCleAPasse ?? false,
      prixCleAPasse: newKey.prixCleAPasse ?? null,
      // ===================== Nouveaux champs =====================
      besoinPhoto: newKey.besoinPhoto ?? false,
      besoinNumeroCle: newKey.besoinNumeroCle ?? false,
      besoinNumeroCarte: newKey.besoinNumeroCarte ?? false,
    };
    this.logger.log(`Requête POST reçue pour ajouter la clé: ${JSON.stringify(keyToAdd)}`);
    return this.produitService.addKey(keyToAdd);
  }

  // Ajout en lot de plusieurs clés
  @Post('cles/add-many')
  async addManyKeys(@Body() newKeys: CreateKeyDto[]): Promise<CatalogueCle[]> {
    if (!Array.isArray(newKeys)) {
      throw new Error('Le corps de la requête doit être un tableau de clés.');
    }
    const keysToAdd: CatalogueCle[] = newKeys.map((newKey) => ({
      ...newKey,
      id: undefined,
      imageUrl: newKey.imageUrl ?? '',
      prixSansCartePropriete: newKey.prixSansCartePropriete ?? 0,
      referenceEbauche: newKey.referenceEbauche?.trim() || null,
      // Nouveaux champs existants
      typeReproduction: newKey.typeReproduction,
      descriptionNumero: newKey.descriptionNumero ?? '',
      descriptionProduit: newKey.descriptionProduit ?? '',
      estCleAPasse: newKey.estCleAPasse ?? false,
      prixCleAPasse: newKey.prixCleAPasse ?? null,
      // ===================== Nouveaux champs =====================
      besoinPhoto: newKey.besoinPhoto ?? false,
      besoinNumeroCle: newKey.besoinNumeroCle ?? false,
      besoinNumeroCarte: newKey.besoinNumeroCarte ?? false,
    }));
    this.logger.log(`Requête POST reçue pour ajouter ${keysToAdd.length} clés.`);
    return this.produitService.addKeys(keysToAdd);
  }

  // Récupération paginée de toutes les clés
  @Get('cles/all')
  async getAllKeys(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ): Promise<CatalogueCle[]> {
    this.logger.log('Requête GET reçue sur /cles/all');
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const skipNumber = skip ? parseInt(skip, 10) : 0;
    return this.produitService.getAllKeys(limitNumber, skipNumber);
  }

  // Retourne le nombre total de clés dans la base
  @Get('cles/count')
  async countKeys(): Promise<{ count: number }> {
    const count = await this.produitService.countKeys();
    return { count };
  }

  // Récupère une clé par son index (ordre décroissant par id)
  @Get('cles/index/:index')
  async getKeyByIndex(@Param('index') index: string): Promise<CatalogueCle> {
    return this.produitService.getKeyByIndex(parseInt(index, 10));
  }

  // ------------------ Nouvelles routes pour la gestion par marque ------------------

  // Retourne le nombre de clés pour une marque donnée
  @Get('cles/brand/:brand/count')
  async countKeysByBrand(@Param('brand') brand: string): Promise<{ count: number }> {
    this.logger.log(`Requête GET sur /cles/brand/${brand}/count`);
    const count = await this.produitService.countKeysByBrand(brand);
    return { count };
  }

  // Récupère une clé par son index pour une marque donnée (ordre décroissant par id)
  @Get('cles/brand/:brand/index/:index')
  async getKeyByBrandAndIndex(
    @Param('brand') brand: string,
    @Param('index') index: string,
  ): Promise<CatalogueCle> {
    this.logger.log(`Requête GET sur /cles/brand/${brand}/index/${index}`);
    return this.produitService.getKeyByBrandAndIndex(brand, parseInt(index, 10));
  }

  // Suppression d'une clé par son nom
  @Delete('cles/delete')
  async deleteKeyByName(@Query('nom') nom: string): Promise<{ message: string }> {
    this.logger.log(`Requête DELETE reçue pour nom: ${nom}`);
    await this.produitService.deleteKeyByName(nom);
    return { message: `Clé avec le nom "${nom}" a été supprimée avec succès.` };
  }
}
