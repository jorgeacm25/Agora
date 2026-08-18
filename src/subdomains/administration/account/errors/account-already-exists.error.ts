import { BaseError } from '../../../../common/errors/base.error';

export class AccountAlreadyExistsError extends BaseError {
  constructor(userId: string) {
    super(`El usuario con ID '${userId}' ya tiene una cuenta asociada`, 409);
  }
}