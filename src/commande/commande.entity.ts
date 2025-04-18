// src/commande/commande.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Commande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  numeroCommande: string;

  @Column()
  nom: string;

  @Column()
  adressePostale: string;

  @Column('simple-array')
  cle: string[];

  @Column('simple-array', { nullable: true })
  numeroCle: string[];

  @Column({ nullable: true })
  propertyCardNumber: string;

  @Column()
  telephone: string;

  @Column()
  adresseMail: string;

  @Column('simple-array')
  typeLivraison: string[];

  @Column({ nullable: true, default: '' })
  shippingMethod: string;

  @Column({ nullable: true, default: '' })
  deliveryType: string;

  @Column({ type: 'text', nullable: true })
  urlPhotoRecto: string;

  @Column({ type: 'text', nullable: true })
  urlPhotoVerso: string;

  @Column({ default: 'annuler' })
  status: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  prix: number;

  @Column({ nullable: true, default: null })
  isCleAPasse: boolean;

  @Column({ nullable: true, default: null })
  hasCartePropriete: boolean;

  @Column({ type: 'text', nullable: true })
  idCardFront: string;

  @Column({ type: 'text', nullable: true })
  idCardBack: string;

  @Column({ type: 'text', nullable: true })
  domicileJustificatif: string;

  @Column({ nullable: true, default: null })
  attestationPropriete: boolean;

  @Column({ nullable: true, default: '' })
  ville: string;

  @Column({ nullable: true, default: 1 })
  quantity: number;

  /**  
   * Date d’enregistrement en base, utilisée comme date de commande.
   */
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
