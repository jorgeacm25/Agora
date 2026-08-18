import { BaseError } from '../../common/errors/base.error';

export class AlreadyRatedServiceError extends BaseError {
  constructor() {
    super('Ya calificaste este servicio', 409);
  }
}