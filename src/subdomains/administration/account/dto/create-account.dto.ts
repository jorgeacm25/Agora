import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ description: 'ID del usuario propietario de la cuenta' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Nombre de la cuenta' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción de la cuenta', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Tipo de cuenta (ej: "empresa", "personal", "premium")' })
  @IsString()
  @IsNotEmpty()
  accountType: string;

  @ApiProperty({ description: 'Saldo inicial de la cuenta' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  initialBalance: number;

  @ApiProperty({ description: 'Moneda de la cuenta (ej: "USD", "EUR", "MXN")' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ description: 'Número de cuenta (opcional, se genera automáticamente si no se proporciona)' })
  @IsString()
  @IsOptional()
  accountNumber?: string;
}