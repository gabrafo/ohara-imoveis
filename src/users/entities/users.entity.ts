import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  name: string;

  @Column()
  birthDate: Date;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;


  @BeforeInsert()
  async hashPassword() {
    // Gera um "sal" e cria o hash da senha
    this.password = await bcrypt.hash(this.password, 10);
  }
}