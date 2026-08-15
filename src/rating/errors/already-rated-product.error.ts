import { BaseError } from '../../common/errors/base.error';

export class AlreadyRatedProductError extends BaseError {
  constructor() {
    super('Ya calificaste este producto', 409);
  }
}