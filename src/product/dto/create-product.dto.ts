import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUUID, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Café molido' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 15.50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value === '' ? null : Number(value))) // 👈 Convierte string a número
  priceCup?: number | null;

  @ApiProperty({ example: 5.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value === '' ? null : Number(value)))
  priceUsd?: number | null;

  // El campo image NO va aquí

  @ApiProperty({ example: 'Café de origen orgánico' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  stock?: boolean;

  @ApiProperty({ example: 'Alimentos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  userEnterpriseId: string;
}