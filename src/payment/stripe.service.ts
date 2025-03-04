import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CreatePaymentPageDto } from './create-payment-page.dto';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    // Charger la clé secrète depuis le fichier .env
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('La clé secrète Stripe n\'est pas définie dans le .env');
    }
    this.stripe = new Stripe(secretKey, { apiVersion: '2025-01-27.acacia' });
    this.logger.log('Stripe Service initialisé avec la clé provenant de l\'env.');
  }

  async createPaymentPage(paymentData: CreatePaymentPageDto): Promise<{ url: string }> {
    this.logger.debug(`Création d'une session de paiement avec les données: ${JSON.stringify(paymentData)}`);
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: paymentData.currency.toLowerCase(),
              product_data: {
                name: paymentData.description,
              },
              unit_amount: paymentData.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: paymentData.success_url,
        cancel_url: paymentData.cancel_url,
      });

      this.logger.log(`Session de paiement créée avec succès: ${session.id}`);
      return { url: session.url };
    } catch (error: any) {
      const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage = error.message || 'Erreur lors de la création de la session de paiement';
      this.logger.error(`Erreur lors de la création de la session Stripe (status ${statusCode}): ${errorMessage}`, error.stack);
      throw new HttpException(
        `Erreur lors de la création de la session Stripe : ${errorMessage}`,
        statusCode,
      );
    }
  }
}
