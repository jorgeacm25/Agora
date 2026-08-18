import { BaseError } from '../../common/errors/base.error';

export class ServiceNotFoundForRatingError extends BaseError {
  constructor(serviceId: string) {
    super(`Servicio con ID ${serviceId} no encontrado`, 404);
  }
}