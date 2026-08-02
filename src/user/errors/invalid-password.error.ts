// src/user/errors/invalid-password.error.ts
import { BaseError } from '../../common/errors/base.error';

export class InvalidPasswordError extends BaseError {
  constructor() {
    super('La contraseña debe tener al menos 6 caracteres', 400);
  }
}