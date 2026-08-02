// src/user/errors/user-not-found.error.ts
import { BaseError } from '../../common/errors/base.error';

export class UserNotFoundError extends BaseError {
  constructor() {
    super(`Usuario no encontrado`, 404);
  }
}