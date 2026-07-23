import {
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  IsUrl,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder los 200 caracteres' })
  name: string;

  @IsString()
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  @MaxLength(500, { message: 'La dirección no puede exceder los 500 caracteres' })
  address: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'El teléfono solo puede contener números, +, -, espacios y ()',
  })
  @MaxLength(20, { message: 'El teléfono no puede exceder los 20 caracteres' })
  phone?: string;

  @IsEmail({}, { message: 'El email no es válido' })
  @IsOptional()
  @MaxLength(100, { message: 'El email no puede exceder los 100 caracteres' })
  email?: string;

  @IsUrl({}, { message: 'La URL no es válida' })
  @IsOptional()
  @MaxLength(100, { message: 'La URL no puede exceder los 100 caracteres' })
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'La descripción no puede exceder los 1000 caracteres' })
  description?: string;

  @IsUUID('4', { message: 'El ID del tipo de negocio no es válido' })
  businessTypeId: string;
}