import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VisitStatus } from '../../common/enums/visit-status.enum';
import { User } from '../../users/entities/users.entity';
import { Property } from '../../properties/entities/property.entity';

@Entity()
@Index(['property', 'visitDateTime'], { unique: true })
export class Visit {  
  @PrimaryGeneratedColumn()
  visitId: number;

  @Column({ type: 'timestamp', nullable: false })
  visitDateTime: Date;

  @Column({
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.WAITING_CONFIRMATION
  })
  visitStatus: VisitStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customerId' })
  customer: User; 

  @ManyToOne(() => User)
  @JoinColumn({ name: 'brokerId' })
  broker: User;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;
} 