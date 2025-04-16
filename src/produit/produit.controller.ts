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

  @Get('cles')
  async getKeysByMarque(@Query('marque') marque: string): Promise<CatalogueCle[]> {
    this.logger.log(`Requête reçue sur /cles avec marque: ${marque}`);
    return this.produitService.getKeysByMarque(marque);
  }

  @Get('cles/by-name')
  async getKeyByName(@Query('nom') nom: string): Promise<CatalogueCle> {
    this.logger.log(`Requête reçue sur /cles/by-name avec nom: ${nom}`);
    return this.produitService.getKeyByName(nom);
  }

  @Get('cles/closest-match')
  async closestKeyMatch(@Query('nom') nom: string): Promise<CatalogueCle> {
    this.logger.log(`Recherche de la clé la plus similaire à : ${nom}`);
    return this.produitService.findClosestMatch(nom);
  }

  @Put('cles/update')
  async updateKeyByName(
    @Query('nom') nom: string,
    @Body() updates: Partial<CreateKeyDto>,
  ): Promise<CatalogueCle> {
    this.logger.log(`Requête PUT reçue pour nom: ${nom}`);
    return this.produitService.updateKeyByName(nom, updates);
  }

  @Post('cles/add')
  async addKey(@Body() newKey: CreateKeyDto): Promise<CatalogueCle> {
    this.logger.log(`Requête POST reçue pour ajouter la clé: ${JSON.stringify(newKey)}`);
    return this.produitService.addKey(newKey as CatalogueCle);
  }

  @Post('cles/add-many')
  async addManyKeys(@Body() newKeys: CreateKeyDto[]): Promise<CatalogueCle[]> {
    if (!Array.isArray(newKeys)) {
      throw new Error('Le corps de la requête doit être un tableau de clés.');
    }
    return this.produitService.addKeys(newKeys as CatalogueCle[]);
  }

  @Get('cles/all')
  async getAllKeys(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ): Promise<CatalogueCle[]> {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const skipNumber = skip ? parseInt(skip, 10) : 0;
    return this.produitService.getAllKeys(limitNumber, skipNumber);
  }

  @Get('cles/count')
  async countKeys(): Promise<{ count: number }> {
    const count = await this.produitService.countKeys();
    return { count };
  }

  @Get('cles/index/:index')
  async getKeyByIndex(@Param('index') index: string): Promise<CatalogueCle> {
    return this.produitService.getKeyByIndex(parseInt(index, 10));
  }

  @Get('cles/brand/:brand/count')
  async countKeysByBrand(@Param('brand') brand: string): Promise<{ count: number }> {
    const count = await this.produitService.countKeysByBrand(brand);
    return { count };
  }

  @Get('cles/brand/:brand/index/:index')
  async getKeyByBrandAndIndex(
    @Param('brand') brand: string,
    @Param('index') index: string,
  ): Promise<CatalogueCle> {
    return this.produitService.getKeyByBrandAndIndex(brand, parseInt(index, 10));
  }

  @Delete('cles/delete')
  async deleteKeyByName(@Query('nom') nom: string): Promise<{ message: string }> {
    await this.produitService.deleteKeyByName(nom);
    return { message: `Clé "${nom}" supprimée avec succès.` };
  }
}
