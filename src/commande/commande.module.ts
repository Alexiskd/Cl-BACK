import { CommandeController } from './commande.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Commande])],
  controllers: [CommandeController],
  providers: [CommandeService, CommandeGateway],
})
export class CommandeModule {}
