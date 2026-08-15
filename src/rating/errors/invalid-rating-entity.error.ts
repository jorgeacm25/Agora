import { BaseError } from '../../common/errors/base.error';

export class InvalidRatingEntityError extends BaseError {
  constructor() {
    super('Debe especificar productId o serviceId, no ambos', 400);
  }
}