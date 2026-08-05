// src/user-enterprise/dto/update-user-enterprise.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateUserEnterpriseDto } from './create-user-enterprise.dto';
import { IsOptional, IsString, IsObject, ValidateNested, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class UpdateAddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  country?: string;
}

class UpdateContactDto {
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  website?: string;
}

export class UpdateUserEnterpriseDto {
  @ApiProperty({ description: 'Nombre de la empresa', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ description: 'Dirección de la empresa', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto;

  @ApiProperty({ description: 'Contacto de la empresa', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateContactDto)
  contact?: UpdateContactDto;

  @ApiProperty({ description: 'Horario de oficina', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  officeHours?: Date;

  @ApiProperty({ description: 'Código de la empresa', required: false })
  @IsOptional()
  @IsNumber()
  code?: number;
}