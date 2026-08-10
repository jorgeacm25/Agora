import { BaseError } from '../../common/errors/base.error';

export class UserNotFoundForSubscriptionError extends BaseError {
  constructor(userId: string) {
    super(`Usuario con ID '${userId}' no encontrado para crear la suscripción`, 404);
  }
}