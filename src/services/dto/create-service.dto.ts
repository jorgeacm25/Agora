import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Servicio de mensajería' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 15.50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value === '' ? null : Number(value)))
  priceCup?: number | null;

  @ApiProperty({ example: 5.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value === '' ? null : Number(value)))
  priceUsd?: number | null;

  @ApiProperty({ example: 'Servicio de mensajería express 24h' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  userEnterpriseId: string;
}