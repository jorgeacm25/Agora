import { BaseError } from 'src/common/errors/base.error';

export class UserAlreadyRegisteredError extends BaseError {
  constructor(username: string) {
    super(`El nombre de usuario '${username}' ya está en uso`, 409);
  }
}