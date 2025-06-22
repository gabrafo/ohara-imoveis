import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Owner } from '../../owners/entities/owner.entity';
import { PropertyStatus } from '../../common/enums/property-status.enum';
import { OfferType } from '../../common/enums/offer-type.enum';
import { Address } from '../addresses/entities/address.entity'

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  propertyId: number;

  @Column(() => Address)
  address: Address;

  @ManyToOne(() => Owner, owner => owner.properties)
  @JoinColumn({ name: 'ownerId' })
  owner: Owner;

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

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  registrationDate: Date;

  @OneToMany('PropertyImage', 'property')
  images: any[];

  @OneToMany('Visit', 'property')
  visits: any[];

  @OneToMany('PropertyFeature', 'property')
  features: any[];
} 