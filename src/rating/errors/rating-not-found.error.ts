import { BaseError } from '../../common/errors/base.error';

export class RatingNotFoundError extends BaseError {
  constructor(id: string) {
    super(`Calificación con ID ${id} no encontrada`, 404);
  }
}