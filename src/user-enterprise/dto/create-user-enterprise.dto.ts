import { IsString, IsNotEmpty, IsOptional, IsObject, IsDate, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

class ContactDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  website?: string;
}

export class CreateUserEnterpriseDto {
  @ApiProperty({ description: 'ID del usuario padre' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Nombre de la empresa' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ description: 'Dirección de la empresa' })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ description: 'Contacto de la empresa' })
  @IsObject()
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

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