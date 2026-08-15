import { BaseError } from '../../common/errors/base.error';

export class ServicePermissionError extends BaseError {
  constructor() {
    super('No tienes permiso para realizar esta acción en este servicio', 403);
  }
}