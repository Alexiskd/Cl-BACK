// src/auth/jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('Erreur JWT ou utilisateur non valide :', err || info?.message);
      throw new UnauthorizedException('Vous devez être connecté pour accéder à cette ressource.');
    }
    return user;
  }
}
