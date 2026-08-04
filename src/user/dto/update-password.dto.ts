import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdatePasswordDto {
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string | null;
}