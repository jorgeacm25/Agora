import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('user_enterprises')
export class UserEnterprise {
  @PrimaryGeneratedColumn('uuid')
  idUserEnterprise: string;

  @Column({ type: 'uuid', nullable: true, name: 'userId' }) 
  userId: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 200 })
  companyName: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  contact: {
    email: string;
    phone: string;
    website?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  officeHours: Date;

  @Column({ type: 'bigint', nullable: true })
  code: number;
}