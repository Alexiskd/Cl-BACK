// src/commande/commande.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class CommandeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('CommandeGateway');

  afterInit() { this.logger.log('WS init'); }
  handleConnection(client: Socket) { this.logger.log(`Conn: ${client.id}`); }
  handleDisconnect(client: Socket) { this.logger.log(`Disc: ${client.id}`); }
  emitCommandeUpdate(payload: any) { this.server.emit('commandeUpdate', payload); }
}


// src/commande/commande.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from './commande.entity';
import { CommandeController } from './commande.controller';
import { CommandeService } from './commande.service';
import { CommandeGateway } from './commande.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Commande])],
  controllers: [CommandeController],
  providers: [CommandeService, CommandeGateway],
  exports: [CommandeService],
})
export class CommandeModule {}
