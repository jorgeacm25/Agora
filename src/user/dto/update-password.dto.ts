import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ required: false, example: 'nuevaContraseña123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string | null;
}