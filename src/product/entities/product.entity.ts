import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEnterprise } from '../../user-enterprise/entities/user-enterprise.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  idProduct: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceCup: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceUsd: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column({ type: 'boolean', default: true })
  stock: boolean;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @ManyToOne(() => UserEnterprise, (userEnterprise) => userEnterprise.products, {
    nullable: false,
    eager: true, 
  })
  @JoinColumn({ name: 'userEnterpriseId' })
  userEnterprise: UserEnterprise;

  @Column({ type: 'uuid', nullable: false })
  userEnterpriseId: string;
}