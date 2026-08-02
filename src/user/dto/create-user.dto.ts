import { IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsOptional()  
  @IsString()
  @MinLength(6)
  password?: string | null;
}
