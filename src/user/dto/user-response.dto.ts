import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  permissions: string[];

  @Exclude()
  password: string;
  
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}