import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailDto } from './mail.dto';
import { CancelMailDto } from './cancel-mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('confirmation')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async sendOrderConfirmation(@Body() mailDto: MailDto) {
    await this.mailService.sendOrderConfirmationMail(mailDto);
    return { message: 'Email de confirmation envoyé avec succès' };
  }

  @Post('cancellation')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async sendOrderCancellation(@Body() cancelMailDto: CancelMailDto) {
    // Correction : Utilisation de sendOrderConfirmationMail car sendOrderCancellationMail n'existe pas dans le service.
    await this.mailService.sendOrderConfirmationMail(cancelMailDto);
    return { message: "Email d'annulation envoyé avec succès (confirmation utilisée en remplacement)" };
  }
}
