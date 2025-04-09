// cancel-mail.dto.ts
import { IsString, IsEmail, IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CancelMailDto {
  @IsString()
  nom: string;

  @IsEmail()
  adresseMail: string;

  @IsArray()
  produitsAnnules: string[];

  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  prix: number;

  @IsString()
  reason: string;
}
