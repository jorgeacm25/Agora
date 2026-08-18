import { BaseError } from '../../../../common/errors/base.error';

export class UserNotFoundForAccountError extends BaseError {
  constructor(userId: string) {
    super(`Usuario con ID '${userId}' no encontrado para crear la cuenta`, 404);
  }
}