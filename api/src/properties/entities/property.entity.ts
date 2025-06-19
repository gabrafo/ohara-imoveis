import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Address } from '../../addresses/entities/address.entity';
import { PropertyStatus } from 'src/common/enums/property-status.enum';
import { OfferType } from 'src/common/enums/offer-type.enum';
import { VisitStatus } from 'src/common/enums/visit-status.enum';
import { Visit } from 'src/visits/entities/visit.entity';
import { PropertyFeature } from 'src/property-features/entities/property-feature.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  propertyId: number;

  @Column(() => Address)
  address: Address;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE
  })
  status: PropertyStatus;

  @Column({
    type: 'enum',
    enum: OfferType
  })
  offerType: OfferType;

  @Column('decimal', { precision: 10, scale: 2 })
  area: number;

  @Column({ type: 'timestamp' })
  registrationDate: Date;

  @OneToMany(() => PropertyFeature, (feature) => feature.property, {
    cascade: true
  })
  features: PropertyFeature[];

  @OneToMany(() => Visit, (visit) => visit.property)
  visits: Visit[];
}