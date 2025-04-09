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

  // Recherche et retourne la meilleure correspondance selon le nom (distance de Levenshtein)
  @Get('cles/best-by-name')
  async bestKeyByName(@Query('nom') nom: string): Promise<CatalogueCle> {
    this.logger.log(`Requête pour la meilleure correspondance par nom: ${nom}`);
    return this.produitService.findBestKeyByName(nom);
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
      typeReproduction: newKey.typeReproduction,
      descriptionNumero: newKey.descriptionNumero ?? '',
      descriptionProduit: newKey.descriptionProduit ?? '',
      estCleAPasse: newKey.estCleAPasse ?? false,
      prixCleAPasse: newKey.prixCleAPasse ?? null,
      besoinPhoto: newKey.besoinPhoto ?? false,
      besoinNumeroCle: newKey.besoinNumeroCle ?? false,
      besoinNumeroCarte: newKey.besoinNumeroCarte ?? false,
      fraisDeDossier: newKey.fraisDeDossier ?? 0,
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
      typeReproduction: newKey.typeReproduction,
      descriptionNumero: newKey.descriptionNumero ?? '',
      descriptionProduit: newKey.descriptionProduit ?? '',
      estCleAPasse: newKey.estCleAPasse ?? false,
      prixCleAPasse: newKey.prixCleAPasse ?? null,
      besoinPhoto: newKey.besoinPhoto ?? false,
      besoinNumeroCle: newKey.besoinNumeroCle ?? false,
      besoinNumeroCarte: newKey.besoinNumeroCarte ?? false,
      fraisDeDossier: newKey.fraisDeDossier ?? 0,
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
    this.logger.log(`Requête GET reçue sur /cles/all`);
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
  async getKeyByIndex(@Param
