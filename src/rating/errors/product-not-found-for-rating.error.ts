import { BaseError } from '../../common/errors/base.error';

export class ProductNotFoundForRatingError extends BaseError {
  constructor(productId: string) {
    super(`Producto con ID ${productId} no encontrado`, 404);
  }
}