import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
  IsPositive,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'El nombre no puede exceder los 200 caracteres' })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'La descripción no puede exceder los 1000 caracteres' })
  description?: string;

  @IsInt({ message: 'El stock debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Type(() => Number)
  stock?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  @Min(0.01, { message: 'El precio mínimo es 0.01' })
  @Type(() => Number)
  price?: number;

  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @IsUUID('4', { message: 'El ID del negocio no es válido' })
  @IsOptional()
  businessId?: string;
}