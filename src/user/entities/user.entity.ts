import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false }) // 👈 Oculta la contraseña
  password: string | null;

  @Column({ type: 'json', nullable: true, default: [] })
  permissions: string[];
}