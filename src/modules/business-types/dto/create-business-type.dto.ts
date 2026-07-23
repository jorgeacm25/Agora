import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsPositive,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusinessTypeDto {
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name: string;

  @IsNumber()
  @IsPositive({ message: 'El monto debe ser un número positivo' })
  @Min(0.01, { message: 'El monto mínimo es 0.01' })
  @Type(() => Number)
  payCant: number;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres' })
  description?: string;
}