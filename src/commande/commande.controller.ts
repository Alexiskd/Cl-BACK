import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
  Query,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { CommandeService } from './commande.service';
import { CommandeGateway } from './commande.gateway';
import { Commande } from './commande.entity';

@Controller('commande')
export class CommandeController {
  private readonly logger = new Logger(CommandeController.name);

  constructor(
    private readonly commandeService: CommandeService,
    private readonly commandeGateway: CommandeGateway,
  ) {}

  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontPhoto', maxCount: 1 },
        { name: 'backPhoto', maxCount: 1 },
        { name: 'idCardFront', maxCount: 1 },
        { name: 'idCardBack', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Body() body: any,
  ): Promise<{ numeroCommande: string }> {
    try {
      this.logger.log('Body reçu : ' + JSON.stringify(body));
      
      // ... validation logic ...
      const cmdData: Partial<Commande> = { /* ... */ };
      const cmd = await this.commandeService.createCommande(cmdData);
      return { numeroCommande: cmd.numeroCommande };
    } catch (error) {
      this.logger.error('Erreur création', error.stack);
      throw new InternalServerErrorException('Erreur création commande');
    }
  }

  @Patch('validate/:numeroCommande')
  async validate(@Param('numeroCommande') numeroCommande: string) {
    // ...
  }

  @Get('paid')
  async getPaidCommandes(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    try {
      const [data, count] = await this.commandeService.getPaidCommandesPaginated(
        +page,
        +limit,
      );
      return { data, count };
    } catch (error) {
      this.logger.error('Erreur récup commandes payées', error.stack);
      throw new InternalServerErrorException('Erreur récup commandes payées');
    }
  }

  @Delete('cancel/:numeroCommande') async cancel(@Param('numeroCommande') numero) { /*...*/ }
  @Get(':numeroCommande') async getCommande(@Param('numeroCommande') numero) { /*...*/ }
  @Put('update/:id') async updateCommande(@Param('id') id: string, @Body() data: Partial<Commande>) { /*...*/ }
}

