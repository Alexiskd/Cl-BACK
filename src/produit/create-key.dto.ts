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

  // Nouveau champ : description générale du produit
  @IsString()
  @IsOptional()
  descriptionProduit?: string = '';

  @IsBoolean()
  @IsOptional()
  estCleAPasse?: boolean = false;

  @IsNumber()
  @IsOptional()
  prixCleAPasse?: number = 0;

  // Indique si des photos sont requises
  @IsBoolean()
  @IsOptional()
  besoinPhoto?: boolean = false;

  // Indique si le numéro de clé est requis
  @IsBoolean()
  @IsOptional()
  besoinNumeroCle?: boolean = false;

  // Indique si le numéro de carte est requis
  @IsBoolean()
  @IsOptional()
  besoinNumeroCarte?: boolean = false;
}
