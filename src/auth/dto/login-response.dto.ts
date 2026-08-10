export class LoginResponseDto {
  accessToken: string;
  expiresIn: string;
  user: {
    id: string;
    username: string;
    permissions: string[];
  }; // 👈 Añadir usuario
}