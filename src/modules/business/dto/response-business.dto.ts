import { Expose, Type } from 'class-transformer';
import { ResponseBusinessTypeDto } from '../../business-types/dto/response-business-type.dto';

export class ResponseBusinessDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  phone: string;

  @Expose()
  email: string;

  @Expose()
  website: string;

  @Expose()
  description: string;

  @Expose()
  isActive: boolean;

  @Expose()
  businessTypeId: string;

  @Expose()
  @Type(() => ResponseBusinessTypeDto)
  businessType: ResponseBusinessTypeDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}