import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// Liste d’origines autorisées (à ajuster selon vos environnements)
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'https://frontendcleservice.onrender.com',
  'https://frontend-fkzn.onrender.com',
  'https://cleservice.com',
  'https://www.cleservice.com',
  'https://2f24-90-90-24-19.ngrok-free.app',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
];

@WebSocketGateway({
  // CORS spécifique pour Socket.IO
  cors: {
    origin: (origin, callback) => {
      // Autorise les requêtes sans origin (Postman, cURL) et celles venant de la liste
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(`Origin ${origin} non autorisée par CORS`),
        false,
      );
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Forcer l'utilisation du WebSocket natif (évite le polling)
  transports: ['websocket'],
})
export class CommandeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CommandeGateway.name);

  afterInit(server: Server) {
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
