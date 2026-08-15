import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  // ❌ Eliminar password

  @Column({ type: 'json', nullable: true, default: [] })
  permissions: string[];
}