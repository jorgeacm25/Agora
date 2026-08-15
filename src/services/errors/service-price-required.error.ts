import { BaseError } from '../../common/errors/base.error';

export class ServicePriceRequiredError extends BaseError {
  constructor() {
    super('Debe proporcionar al menos un precio (CUP o USD)', 400);
  }
}