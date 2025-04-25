

// src/commande/commande.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'https://frontendcleservice.onrender.com',
  'https://www.cleservice.com',
];

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} non autorisée`), false);
    },
    credentials: true,
  },
  transports: ['websocket'],
})
export class CommandeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CommandeGateway.name);

  afterInit() {
    this.logger.log('WebSocket initialisé');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`);
  }

  emitCommandeUpdate(payload: any) {
    this.server.emit('commandeUpdate', payload);
  }
}
