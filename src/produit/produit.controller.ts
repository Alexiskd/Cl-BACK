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
      estCleAPasse:

