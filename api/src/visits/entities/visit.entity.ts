import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { VisitStatus } from 'src/common/enums/visit-status.enum';
import { Property } from 'src/properties/entities/property.entity';

@Entity()
export class Visit {
  @PrimaryGeneratedColumn()
  visitId: number;

  @Column({ type: 'timestamp' })
  visitDateTime: Date;

  @Column({
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.SCHEDULED
  })
  visitStatus: VisitStatus;

  @ManyToOne(() => Property, (property) => property.visits)
  property: Property;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
} 