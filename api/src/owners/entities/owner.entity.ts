import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Owner {
  @PrimaryGeneratedColumn()
  ownerId: number;

  @Column()
  name: string;

  @Column()
  contactPhone: string;

  @Column({ nullable: true })
  cpf?: string;
} 