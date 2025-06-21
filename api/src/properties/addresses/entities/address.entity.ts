import { State } from 'src/common/enums/state.enum';
import { Column } from 'typeorm';

export class Address {
  @Column()
  zipCode: string;

  @Column()
  neighborhood: string;

  @Column()
  number: number;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column({
    type: 'enum',
    enum: State
  })
  state: State;

  @Column({ nullable: true })
  complement?: string;
} 