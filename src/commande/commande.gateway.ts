// src/commande/commande.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger} from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class CommandeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CommandeGateway.name);

  afterInit(): void {
    this.logger.log('WebSocket initialisé');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client déconnecté : ${client.id}`);
  }

  emitCommandeUpdate(payload: any): void {
    this.server.emit('commandeUpdate', payload);
  }
}


