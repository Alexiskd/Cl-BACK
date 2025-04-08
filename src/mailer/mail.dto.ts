import { IsString, IsEmail, IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class MailDto {
  @IsString()
  nom: string;

  @IsEmail()
  adresseMail: string;

  @IsArray()
  cle: string[];

  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  prix: number;

  @IsString()
  telephone: string;

  @IsString()
  shippingMethod: string;

  @IsString()
  typeLivraison: string;
}
