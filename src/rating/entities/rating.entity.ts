import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Check,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('ratings')
@Check(`"quantity" >= 1 AND "quantity" <= 5`) 
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  idRating: string;

  @Column({ type: 'int' })
  quantity: number; // Puntuación de 1 a 5

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product | null;

  @Column({ type: 'uuid', nullable: true })
  productId: string | null;

  @ManyToOne(() => Service, { eager: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'serviceId' })
  service: Service | null;

  @Column({ type: 'uuid', nullable: true })
  serviceId: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}