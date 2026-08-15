import { Expose, Type } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Service } from 'src/services/entities/service.entity';

export class RatingResponseDto {
  @Expose()
  idRating: string;

  @Expose()
  quantity: number;

  @Expose()
  @Type(() => User)
  user: User;

  @Expose()
  @Type(() => Product)
  product?: Product;

  @Expose()
  @Type(() => Service)
  service?: Service;

  @Expose()
  createdAt: Date;
}