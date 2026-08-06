import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubscriptionDto {
  @ApiProperty({ description: 'Nombre de la suscripción', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Costo de la suscripción', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  cost?: number;

  @ApiProperty({ description: 'Descripción de la suscripción', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Cantidad de cuentas', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  quantityAccounts?: number;

  @ApiProperty({ description: 'Duración en días', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  durationDays?: number;
}