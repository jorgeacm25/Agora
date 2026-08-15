import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEnterprise } from '../../user-enterprise/entities/user-enterprise.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  idService: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceCup: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceUsd: number | null;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => UserEnterprise, (userEnterprise) => userEnterprise.idUserEnterprise, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'userEnterpriseId' })
  userEnterprise: UserEnterprise;

  @Column({ type: 'uuid', nullable: false })
  userEnterpriseId: string;
}