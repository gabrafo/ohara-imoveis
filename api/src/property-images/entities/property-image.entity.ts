import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from '../../properties/entities/property.entity';

@Entity()
export class PropertyImage {
  @PrimaryGeneratedColumn()
  imageId: number;

  @Column()
  filename: string;
  
  @Column()
  path: string;

  @Column({ default: false })
  isMain: boolean;
  
  @Column({ nullable: true })
  description: string;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;
  
  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;
}