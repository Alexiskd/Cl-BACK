import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TypeReproduction } from '../produit/create-key.dto';

@Entity()
export class CatalogueCle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  marque: string;

  @Column('decimal')
  prix: number;

  @Column({ default: false })
  cleAvecCartePropriete: boolean;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'decimal', nullable: true })
  prixSansCartePropriete: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  referenceEbauche?: string;

  // Champ existant : type de reproduction possible (copie, numero, ia)
  @Column({
    type: 'enum',
    enum: TypeReproduction,
    default: TypeReproduction.COPIE,
  })
  typeReproduction: TypeReproduction;

  // Champ existant : description associée au mode "numero"
  @Column({ type: 'text', nullable: true, default: '' })
  descriptionNumero: string;

  // Nouveau champ : description générale du produit
  @Column({ type: 'text', nullable: true })
  descriptionProduit: string;

  // Champ existant : booléen indiquant si c'est une clé à passe
  @Column({ default: false })
  estCleAPasse: boolean;

  // Champ existant : prix de la clé en mode passe
  @Column('decimal', { nullable: true })
  prixCleAPasse: number;

  // ===================== Nouveaux champs =====================
  // Indique si des photos sont requises pour le produit
  @Column({ default: false })
  besoinPhoto: boolean;

  // Indique si le numéro de clé est requis
  @Column({ default: false })
  besoinNumeroCle: boolean;

  // Indique si le numéro de carte est requis
  @Column({ default: false })
  besoinNumeroCarte: boolean;
}
