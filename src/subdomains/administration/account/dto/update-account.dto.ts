import { IsString, IsOptional, IsNumber, Min, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({ description: 'Nombre de la cuenta', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Descripción de la cuenta', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Tipo de cuenta', required: false })
  @IsString()
  @IsOptional()
  accountType?: string;

  @ApiProperty({ description: 'Saldo de la cuenta', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  balance?: number;

  @ApiProperty({ description: 'Moneda de la cuenta', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Estado de la cuenta (activa/inactiva)', required: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({ description: 'ID del usuario propietario de la cuenta', required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;
}