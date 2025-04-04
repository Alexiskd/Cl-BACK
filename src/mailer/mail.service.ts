import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as PDFDocument from 'pdfkit';
import { MailDto } from './mail.dto';
import mailConfig from './mail.config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private mailFrom: string;

  constructor() {
    const config = mailConfig();
    const mailCfg = config.mail;
    this.mailFrom = mailCfg.from;
    this.transporter = nodemailer.createTransport({
      host: mailCfg.host,
      port: mailCfg.port,
      secure: mailCfg.secure,
      auth: {
        user: mailCfg.user,
        pass: mailCfg.pass,
      },
    });

    // Vérification de la configuration SMTP
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Erreur de configuration SMTP:', error);
      } else {
        console.log('Configuration SMTP OK');
      }
    });
  }

  async sendOrderConfirmationMail(mailDto: MailDto) {
    try {
      const { nom, adresseMail, cle, prix, telephone, shippingMethod, typeLivraison } = mailDto;
      
      // Création du contenu HTML de l'email
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Confirmation de commande</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .header { background-color: #2E7D32; padding: 20px; text-align: center; color: #ffffff; }
          .content { padding: 20px; color: #333; }
          .footer { background-color: #f2f2f2; padding: 10px; text-align: center; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Confirmation de commande</h1>
        </div>
        <div class="content">
          <p>Bonjour ${nom},</p>
          <p>Merci pour votre commande. Voici les détails :</p>
          <ul>
            <li><strong>Clé(s) commandée(s) :</strong> ${cle.join(', ')}</li>
            <li><strong>Prix total :</strong> ${prix.toFixed(2)} €</li>
            <li><strong>Téléphone :</strong> ${telephone}</li>
          </ul>
          <p><strong>Mode de livraison :</strong> ${shippingMethod}</p>
        </div>
        <div class="footer">
          <p>Service CLE - 20 rue de Lévis, 75017 Paris</p>
          <p>Contactez-nous : Servicecle@cleservice.com</p>
        </div>
      </body>
      </html>
      `;

      // Options de l'email
      const mailOptions = {
        from: this.mailFrom,
        to: adresseMail,
        subject: 'Confirmation de votre commande',
        html: htmlContent,
      };

      // Envoi de l'email
      await this.transporter.sendMail(mailOptions);

      console.log("Email envoyé avec succès à :", adresseMail);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw new InternalServerErrorException("Erreur lors de l'envoi de l'email");
    }
  }
}
