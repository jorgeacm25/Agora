import { BaseError } from '../../common/errors/base.error';

export class SubscriptionNotFoundError extends BaseError {
  constructor() {
    super('Suscripción no encontrada', 404);
  }
}