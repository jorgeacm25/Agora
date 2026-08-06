import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'ID del usuario' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Nombre de la suscripción' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Costo de la suscripción' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  cost: number;

  @ApiProperty({ description: 'Descripción de la suscripción', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Cantidad de cuentas' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantityAccounts: number;

  @ApiProperty({ description: 'Duración en días' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(365)
  durationDays: number;
}