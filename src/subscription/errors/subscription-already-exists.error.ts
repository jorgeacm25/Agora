import { BaseError } from '../../common/errors/base.error';

export class SubscriptionAlreadyExistsError extends BaseError {
  constructor(userId: string) {
    super(`El usuario con ID '${userId}' ya tiene una suscripción activa`, 409);
  }
}