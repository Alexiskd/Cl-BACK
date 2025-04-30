import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  Delete,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CommandeService } from './commande.service';
import { Commande } from './commande.entity';

@Controller('commande')
export class CommandeController {
  constructor(private readonly commandeService: CommandeService) {}

  @Get('paid')
  async getPaidCommandes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const [data, count] = await this.commandeService.getPaidCommandesPaginated(
      Number(page),
      Number(limit),
    );
    return { data, count };
  }

  @Post()
  async createCommande(@Body() body: Partial<Commande>) {
    return await this.commandeService.createCommande(body);
  }

  @Put('validate/:numeroCommande')
  async validateCommande(@Param('numeroCommande') numeroCommande: string) {
    const success = await this.commandeService.validateCommande(numeroCommande);
    if (!success) {
      throw new HttpException('Commande non trouvée', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }

  @Delete('cancel/:numeroCommande')
  async cancelCommande(@Param('numeroCommande') numeroCommande: string) {
    const success = await this.commandeService.cancelCommande(numeroCommande);
    if (!success) {
      throw new HttpException('Commande non trouvée', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }

  @Get(':numeroCommande')
  async getCommande(@Param('numeroCommande') numeroCommande: string) {
    return await this.commandeService.getCommandeByNumero(numeroCommande);
  }

  @Put(':numeroCommande')
  async updateCommande(
    @Param('numeroCommande') numeroCommande: string,
    @Body() update: Partial<Commande>,
  ) {
    return await this.commandeService.updateCommande(numeroCommande, update);
  }
}
