import { IsString, IsEmail, IsArray, IsNumber, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CancelMailDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsEmail()
  adresseMail: string;

  @IsArray()
  @IsString({ each: true })
  produitsAnnules: string[];

  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  prix: number;

  @IsString()
  @IsNotEmpty()
  cancelMessage: string;
}
