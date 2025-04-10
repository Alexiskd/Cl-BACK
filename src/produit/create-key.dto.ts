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
  prixSansCartePropriete?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  referenceEbauche?: string;

  @IsEnum(TypeReproduction)
  @IsNotEmpty()
  typeReproduction: TypeReproduction;

  @IsString()
  @IsOptional()
  descriptionNumero?: string;

  @IsString()
  @IsOptional()
  descriptionProduit?: string;

  @IsBoolean()
  @IsOptional()
  estCleAPasse?: boolean;

  @IsNumber()
  @IsOptional()
  prixCleAPasse?: number;

  @IsBoolean()
  @IsOptional()
  besoinPhoto?: boolean;

  @IsBoolean()
  @IsOptional()
  besoinNumeroCle?: boolean;

  @IsBoolean()
  @IsOptional()
  besoinNumeroCarte?: boolean;

  @IsNumber()
  @IsOptional()
  fraisDeDossier?: number;
}
