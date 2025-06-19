import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { FeatureType } from '../../feature-types/entities/feature-type.entity';

@Entity()
export class PropertyFeature {
  @PrimaryGeneratedColumn()
  propertyFeatureId: number;

  @ManyToOne(() => Property, (property) => property.features)
  property: Property;

  @ManyToOne(() => FeatureType)
  @JoinColumn({ name: 'featureTypeId' })
  featureType: FeatureType;

  @Column({ nullable: true })
  quantity?: number;

  @Column({ nullable: true })
  details?: string;
} 