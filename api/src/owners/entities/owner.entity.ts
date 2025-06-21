import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { forwardRef } from '@nestjs/common';

@Entity()
export class Owner {
  @PrimaryGeneratedColumn()
  ownerId: number;

  @Column()
  name: string;

  @Column()
  contactPhone: string;

  @Column({ nullable: true, unique: true })
  cpf: string;

  @OneToMany('Property', 'owner')
  properties: any[];
}