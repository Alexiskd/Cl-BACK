import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum TypeReproduction {
  COPIE = 'copie',
  NUMERO = 'numero',
  IA = 'ia',
}

export class CreateKeyDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  marque: string;

  @IsNumber()
  prix: number;

  @IsBoolean()
  cleAvecCartePropriete: boolean;

  @IsNumber()
  @IsOptional()
  prixSansCartePropriete?: number = 0;

  @IsString()
  @IsOptional()
  imageUrl?: string = '';

  @IsString()
  @IsOptional()
  referenceEbauche?: string = '';

  @IsEnum(TypeReproduction)
  @IsNotEmpty()
  typeReproduction: TypeReproduction;

  @IsString()
  @IsOptional()
  descriptionNumero?: string = '';

  @IsString()
  @IsOptional()
  descriptionProduit?: string = '';

  @IsBoolean()
  @IsOptional()
  estCleAPasse?: boolean = false;

  @IsNumber()
  @IsOptional()
  prixCleAPasse?: number = 0;

  @IsBoolean()
  @IsOptional()
  besoinPhoto?: boolean = false;

  @IsBoolean()
  @IsOptional()
  besoinNumeroCle?: boolean = false;

  @IsBoolean()
  @IsOptional()
  besoinNumeroCarte?: boolean = false;

  @IsNumber()
  @IsOptional()
  fraisDeDossier?: number = 0;
}
