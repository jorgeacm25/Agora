import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../../user/entities/user.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  idAccount: string;

  @Column({ type: 'uuid', nullable: true, name: 'userId' })
  userId: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  accountType: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'account_number' })
  accountNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'initial_balance' })
  initialBalance: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date | null; 

  @Column({ type: 'timestamp', nullable: true, name: 'last_activity_at' })
  lastActivityAt: Date | null; 
}