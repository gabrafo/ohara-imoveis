import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum'; 

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  name: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ unique: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
  })
  role: Role;

  @Column({ type: 'int', default: 1, select: false })
  tokenVersion: number;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Regex para verificar se a string já é um hash bcrypt válido (começa com $2a$, $2b$ ou $2y$).
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(this.password || '');
    if (this.password && !isBcryptHash) {
      this.password = bcrypt.hashSync(this.password, 10);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  parseBirthDate() {
    if (typeof this.birthDate === 'string') {
      const birthDateStr = this.birthDate as string;
      const [day, month, year] = birthDateStr.split('-');
      this.birthDate = new Date(`${year}-${month}-${day}`);
    }
  }
}