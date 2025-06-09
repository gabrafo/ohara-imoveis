import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';

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

  // Este método será chamado automaticamente pelo TypeORM ANTES de um novo
  // usuário ser inserido no banco de dados.
  /* @BeforeInsert()
  async hashPassword() {
    // Gera um "sal" e cria o hash da senha
    this.password = await bcrypt.hash(this.password, 10);
  } */
}