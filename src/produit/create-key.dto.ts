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

  // Description générale du produit
  @IsString()
  @IsOptional()
  descriptionProduit?: string;

  @IsBoolean()
  @IsOptional()
  estCleAPasse?: boolean;

  @IsNumber()
  @IsOptional()
  prixCleAPasse?: number;

  // Indique si des photos sont requises
  @IsBoolean()
  @IsOptional()
  besoinPhoto?: boolean;

  // Indique si le numéro de clé est requis
  @IsBoolean()
  @IsOptional()
  besoinNumeroCle?: boolean;

  // Indique si le numéro de carte est requis
  @IsBoolean()
  @IsOptional()
  besoinNumeroCarte?: boolean;

  // Frais de dossier avec valeur par défaut de 0
  @IsNumber()
  @IsOptional()
  fraisDeDossier?: number;
}
