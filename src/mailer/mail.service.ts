import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as PDFDocument from 'pdfkit';
import { MailDto } from './mail.dto';
import { CancelMailDto } from './cancel-mail.dto';
import mailConfig from './mail.config';
import { join } from 'path';

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
  }

  /**
   * Génère le PDF de la facture avec un style inspiré de la template Pug donnée,
   * en adaptant dynamiquement les informations du client et du produit.
   * Utilise la couleur #2E7D32 pour les éléments graphiques et intègre le logo.
   * Ici, les positions verticales (Y) ont été décalées pour que le texte soit affiché plus bas.
   */
  private generateInvoicePdf(mailDto: MailDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Création du document PDF (A4, marge 50)
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        doc.rect(50, 50, doc.page.width - 100,80 ).fill('#2E7D32');

        // Insertion du logo
        const logoPath = join(__dirname, '..', 'assets', 'logo.png');
        const logoWidth = 50;
        const logoHeight = 50;
        doc.image(logoPath, 60, 65, { width: logoWidth, height: logoHeight });
        
        // Titre de la facture et sous-titre (déplacés plus bas)
        doc
          .fillColor('white')
          .font('Helvetica-Bold')
          .fontSize(28)
          .text('FACTURE', 0, 75, { align: 'center' });
        doc
          .font('Helvetica')
          .fontSize(16)
          .text(`Cléservice.com`, 0, 105, { align: 'center' });

        // --- Infos de facturation ---
        // Génération d'un numéro de facture (par exemple "INV-<timestamp>")
        const invoiceNumber = `INV-${Date.now()}`;
        const invoiceDate = new Date().toLocaleDateString('fr-FR');
        // Décalage des infos de facturation (commencent à Y=140)
        doc
          .fillColor('black')
          .font('Helvetica')
          .fontSize(12)
          .text(`Facture : ${invoiceNumber}`, 50, 140)
          .text(`Date de facturation: ${invoiceDate}`, 50, 160);

        // --- Deux colonnes : "Facturé à" et "Description de service" ---
        // On décale également ces colonnes pour les placer plus bas
        const startY = 180;
        const colWidth = (doc.page.width - 100) / 2;
        const gap = 20;

        // Colonne gauche : Facturé à (client)
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('Facturé à:', 50, startY, { width: colWidth });
        doc
          .font('Helvetica')
          .fontSize(12)
          .text(mailDto.nom, 50, startY + 18, { width: colWidth })
          .text(mailDto.adresseMail, 50, startY + 34, { width: colWidth })
          .text(mailDto.telephone, 50, startY + 50, { width: colWidth });

        // Colonne droite : Description de service & période
        const rightColX = 50 + colWidth + gap;
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('Description de service:', rightColX, startY, { width: colWidth });
        // Par exemple, on indique "Commande de clé(s)" puis la période (adaptable)
        doc
          .font('Helvetica')
          .fontSize(12)
          .text('Commande de clé(s)', rightColX, startY + 18, { width: colWidth })
          .text('Période: Aujourd\'hui', rightColX, startY + 34, { width: colWidth });

        // --- Tableau récapitulatif ---
        // Colonnes : Période, Description, Heures, Taux, Montant
        const tableTop = startY + 90;
        const tableLeft = 50;
        const tableWidth = doc.page.width - 100;
        const rowHeight = 25;
        // Répartition des colonnes (en pourcentage)
        const colWidths = [
          tableWidth * 0.2,  // Période
          tableWidth * 0.4,  // Description
          tableWidth * 0.15, // Heures
          tableWidth * 0.15, // Taux
          tableWidth * 0.1   // Montant
        ];

        // En-tête du tableau
        doc.rect(tableLeft, tableTop, tableWidth, rowHeight).fill('#2E7D32');
        doc.fillColor('white').font('Helvetica-Bold').fontSize(10);
        const headers = ['Période', 'Description', 'Heures', 'Taux', 'Montant'];
        let x = tableLeft;
        headers.forEach((header, index) => {
          doc.text(header, x + 5, tableTop + 7, {
            width: colWidths[index] - 10,
            align: 'center'
          });
          x += colWidths[index];
        });
        doc.lineWidth(0.5);
        doc.rect(tableLeft, tableTop, tableWidth, rowHeight).stroke();

        // Ligne de données (un seul produit par exemple)
        const rowTop = tableTop + rowHeight;
        doc.font('Helvetica').fontSize(10).fillColor('black');
        x = tableLeft;
        // Valeurs dynamiques : dans cet exemple,
        // Période : "Aujourd'hui"
        // Description : produit(s) commandé(s) (en joignant le tableau mailDto.cle)
        // Heures : "1" (ou une autre valeur si applicable)
        // Taux : "—" (non applicable ici, sinon renseigner le taux horaire)
        // Montant : prix total
        const period = 'Aujourd\'hui';
        const description = Array.isArray(mailDto.cle) ? mailDto.cle.join(', ') : mailDto.cle;
        const heures = '1';
        const taux = '—';
        const montant = mailDto.prix.toFixed(2) + ' €';
        const rowData = [period, description, heures, taux, montant];
        rowData.forEach((data, index) => {
          doc.text(data, x + 5, rowTop + 7, {
            width: colWidths[index] - 10,
            align: 'center'
          });
          x += colWidths[index];
        });
        doc.rect(tableLeft, rowTop, tableWidth, rowHeight).stroke();

        // Ligne de pied de tableau : total
        const footerTop = rowTop + rowHeight;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('Total:', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5, footerTop + 7, {
          width: colWidths[3],
          align: 'center'
        });
        doc.text(montant, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, footerTop + 7, {
          width: colWidths[4] - 10,
          align: 'center'
        });
        doc.rect(tableLeft, footerTop, tableWidth, rowHeight).stroke();

        // On peut également ajouter des conditions générales sous le tableau, si nécessaire
        doc.text('', tableLeft + 5, footerTop + 7, {
          width: colWidths[0] + colWidths[1] + colWidths[2] - 10,
          align: 'center'
        });

        // --- Footer (Informations de contact) ---
        doc.moveDown(3);
        doc.font('Helvetica')
          .fontSize(9)
          .fillColor('gray')
          .text('Maison Bouvet - Clé Service | Tél : 01 42 67 48 61 contact@cleservice.com', { align: 'center' });
        doc.text('Nos coordonnées bancaires: IBAN : FR76 1820 6004 1744 1936 2200 145 - BIC : AGRIFRPP882', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async sendOrderConfirmationMail(mailDto: MailDto) {
    try {
      const { nom, adresseMail, cle, prix, telephone, shippingMethod, typeLivraison } = mailDto;

      let livraisonMessage = '';
      if (shippingMethod === 'magasin') {
        livraisonMessage =
          'Votre commande est prête à être récupérée en magasin à l’adresse suivante : 20 rue de Lévis, 75017 Paris.';
      } else if (shippingMethod === 'expedition') {
        if (typeLivraison.includes('postale')) {
          livraisonMessage =
            'Votre commande sera expédiée à l’adresse suivante : 20 rue de Lévis, 75017 Paris.';
        } else if (typeLivraison.includes('numero')) {
          livraisonMessage = `Votre commande sera préparée selon le numéro fourni. En cas de problème, nous vous contacterons au ${telephone}.`;
        }
      } else {
        livraisonMessage = 'Les détails de livraison vous seront communiqués ultérieurement.';
      }

      let additionalMessage = '';
      if (shippingMethod !== 'magasin') {
        additionalMessage = `Vos clés seront renvoyées une fois copiées à l'adresse renseignée lors de la commande.`;
      }

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
          .content ul { list-style: none; padding: 0; }
          .content li { margin-bottom: 8px; }
          .footer { background-color: #f2f2f2; padding: 10px; text-align: center; font-size: 12px; color: #777; }
          .contact-info { margin-top: 20px; padding: 10px; border-top: 1px solid #ddd; }
          .contact-info a { color: #2E7D32; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Confirmation de commande</h1>
        </div>
        <div class="content">
          <p>Bonjour ${nom},</p>
          <p>Nous vous remercions pour votre commande. Voici les détails :</p>
          <ul>
            <li><strong>Clé(s) commandée(s) :</strong> ${cle.join(', ')}</li>
            <li><strong>Prix total :</strong> ${prix.toFixed(2)} €</li>
            <li><strong>Téléphone :</strong> ${telephone}</li>
          </ul>
          <p>${livraisonMessage}</p>
          ${shippingMethod !== 'magasin' && additionalMessage ? `<p>${additionalMessage}</p>` : ''}
          <div class="contact-info">
            <p><strong>Informations de contact :</strong></p>
            <p>Service CLE - 20 rue de Lévis, 75017 Paris</p>
            <p>Contactez-nous : <a href="mailto:Servicecle@cleservice.com">Servicecle@cleservice.com</a></p>
            <p>Pour connaître nos indications pour vous rendre sur place, veuillez consulter notre site <a href="https://cleservice.com" target="_blank">cleservice.com</a>.</p>
          </div>
          <p>Nous restons à votre disposition pour toute information complémentaire.</p>
          <p>Cordialement,</p>
          <p>L’équipe Service CLE</p>
        </div>
        <div class="footer">
          <p>Service CLE - 20 rue de Lévis, 75017 Paris</p>
          <p>Contactez-nous : Servicecle@cleservice.com</p>
        </div>
      </body>
      </html>
      `;

      // Génération du PDF facture
      const pdfBuffer = await this.generateInvoicePdf(mailDto);

      const mailOptions = {
        from: this.mailFrom,
        to: adresseMail,
        subject: 'Confirmation de votre commande',
        html: htmlContent,
        attachments: [
          {
            filename: 'facture.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new InternalServerErrorException('Erreur lors de l\'envoi de l\'email');
    }
  }

  // Méthode d'envoi de l'email d'annulation (inchangée)
  async sendOrderCancellationMail(cancelDto: CancelMailDto) {
    try {
      const { nom, adresseMail, produitsAnnules, prix, reason } = cancelDto;

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Annulation de commande</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .header { background-color: #B71C1C; padding: 20px; text-align: center; color: #ffffff; }
          .content { padding: 20px; color: #333; }
          .content ul { list-style: none; padding: 0; }
          .content li { margin-bottom: 8px; }
          .footer { background-color: #f2f2f2; padding: 10px; text-align: center; font-size: 12px; color: #777; }
          .contact-info { margin-top: 20px; padding: 10px; border-top: 1px solid #ddd; }
          .contact-info a { color: #B71C1C; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Annulation de commande</h1>
        </div>
        <div class="content">
          <p>Bonjour ${nom},</p>
          <p>Nous vous informons que votre commande a été annulée.</p>
          <p><strong>Détails de la commande annulée :</strong></p>
          <ul>
            <li><strong>Produits annulés :</strong> ${produitsAnnules.join(', ')}</li>
            <li><strong>Prix total :</strong> ${prix.toFixed(2)} €</li>
          </ul>
          <p><strong>Raison de l'annulation :</strong> ${reason}</p>
          <div class="contact-info">
            <p><strong>Informations de contact :</strong></p>
            <p>Service CLE - 20 rue de Lévis, 75017 Paris</p>
            <p>Contactez-nous : <a href="mailto:Servicecle@cleservice.com">Servicecle@cleservice.com</a></p>
            <p>Pour toute question, veuillez consulter notre site <a href="https://cleservice.com" target="_blank">cleservice.com</a>.</p>
          </div>
          <p>Nous restons à votre disposition pour toute information complémentaire.</p>
          <p>Cordialement,</p>
          <p>L’équipe Service CLE</p>
        </div>
        <div class="footer">
          <p>Service CLE - 20 rue de Lévis, 75017 Paris</p>
          <p>Contactez-nous : Servicecle@cleservice.com</p>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: this.mailFrom,
        to: adresseMail,
        subject: 'Annulation de votre commande',
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email d\'annulation:', error);
      throw new InternalServerErrorException('Erreur lors de l\'envoi de l\'email d\'annulation');
    }
  }
}
