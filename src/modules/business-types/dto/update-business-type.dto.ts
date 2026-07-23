import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsPositive,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBusinessTypeDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'El monto debe ser un número positivo' })
  @Min(0.01, { message: 'El monto mínimo es 0.01' })
  @Type(() => Number)
  payCant?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres' })
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}