import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FeatureType {
  @PrimaryGeneratedColumn()
  featureId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  unit?: string;

  @Column({ default: false })
  allowsQuantity: boolean;
} 