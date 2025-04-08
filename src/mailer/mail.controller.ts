import { Injectable } from '@nestjs/common';
import { MailDto } from './mail.dto';
import { CancelMailDto } from './cancel-mail.dto';

@Injectable()
export class MailService {
  async sendOrderConfirmationMail(mailDto: MailDto): Promise<void> {
    // Implémentation de l'envoi de l'email de confirmation
    console.log('Envoi de l\'email de confirmation', mailDto);
    // Exemple : utiliser un module SMTP ou un service tiers pour envoyer l'email.
  }

  async sendOrderCancellationMail(cancelMailDto: CancelMailDto): Promise<void> {
    // Implémentation de l'envoi de l'email d'annulation
    console.log('Envoi de l\'email d\'annulation', cancelMailDto);
    // Exemple : personnaliser le message d'annulation et envoyer l'email via un service SMTP ou une API.
  }
}
