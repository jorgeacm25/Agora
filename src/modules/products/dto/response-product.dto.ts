import { Expose, Type, Transform } from 'class-transformer';
import { ResponseBusinessDto } from '../../business/dto/response-business.dto';

export class ResponseProductDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  stock: number;

  @Expose()
  available: boolean;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @Expose()
  photo: string;

  @Expose()
  photoPublicId: string;

  @Expose()
  businessId: string;

  @Expose()
  @Type(() => ResponseBusinessDto)
  business: ResponseBusinessDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}