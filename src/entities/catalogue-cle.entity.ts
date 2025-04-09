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

  @Column({
    type: 'enum',
    enum: TypeReproduction,
    default: TypeReproduction.COPIE,
  })
  typeReproduction: TypeReproduction;

  @Column({ type: 'text', nullable: true, default: '' })
  descriptionNumero: string;

  @Column({ type: 'text', nullable: true })
  descriptionProduit: string;

  @Column({ default: false })
  estCleAPasse: boolean;

  @Column('decimal', { nullable: true })
  prixCleAPasse: number;

  @Column({ default: false })
  besoinPhoto: boolean;

  @Column({ default: false })
  besoinNumeroCle: boolean;

  @Column({ default: false })
  besoinNumeroCarte: boolean;

  @Column('decimal', { default: 0 })
  fraisDeDossier: number;
}
