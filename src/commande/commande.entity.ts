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

  @Column({ default: '' })
  shippingMethod: string;

  @Column({ default: '' })
  deliveryType: string;

  @Column('text', { nullable: true })
  urlPhotoRecto: string;

  @Column('text', { nullable: true })
  urlPhotoVerso: string;

  @Column({ default: 'annuler' })
  status: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  prix: number;

  @Column({ nullable: true, default: null })
  isCleAPasse: boolean;

  @Column({ nullable: true, default: null })
  hasCartePropriete: boolean;

  @Column('text', { nullable: true })
  idCardFront: string;

  @Column('text', { nullable: true })
  idCardBack: string;

  @Column('text', { nullable: true })
  domicileJustificatif: string;

  @Column({ nullable: true, default: null })
  attestationPropriete: boolean;

  @Column({ default: '' })
  ville: string;

  @Column({ default: 1 })
  quantity: number;


}
