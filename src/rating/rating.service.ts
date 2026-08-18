import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { User } from '../user/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from 'src/services/entities/service.entity';
import { Result } from '../common/classes/result.class';
import { BaseError } from '../common/errors/base.error';

// Importar errores personalizados
import { RatingNotFoundError } from './errors/rating-not-found.error';
import { AlreadyRatedProductError } from './errors/already-rated-product.error';
import { AlreadyRatedServiceError } from './errors/already-rated-service.error';
import { InvalidRatingEntityError } from './errors/invalid-rating-entity.error';
import { UserNotFoundForRatingError } from './errors/user-not-found-for-rating.error';
import { ProductNotFoundForRatingError } from './errors/product-not-found-for-rating.error';
import { ServiceNotFoundForRatingError } from './errors/service-not-found-for-rating.error';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async create(createRatingDto: CreateRatingDto): Promise<Result<Rating>> {
    try {
      // Validar que al menos uno de productId o serviceId esté presente
      if (!createRatingDto.productId && !createRatingDto.serviceId) {
        return Result.error(new InvalidRatingEntityError());
      }

      // Verificar que no se envíen ambos
      if (createRatingDto.productId && createRatingDto.serviceId) {
        return Result.error(new InvalidRatingEntityError());
      }

      // Verificar que el usuario existe
      const user = await this.userRepository.findOne({
        where: { id: createRatingDto.userId },
      });
      if (!user) {
        return Result.error(new UserNotFoundForRatingError(createRatingDto.userId));
      }

      // Verificar que el producto existe (si se envía)
      if (createRatingDto.productId) {
        const product = await this.productRepository.findOne({
          where: { idProduct: createRatingDto.productId },
        });
        if (!product) {
          return Result.error(new ProductNotFoundForRatingError(createRatingDto.productId));
        }

        // Verificar que el usuario no haya calificado este producto antes
        const existing = await this.ratingRepository.findOne({
          where: {
            userId: createRatingDto.userId,
            productId: createRatingDto.productId,
          },
        });
        if (existing) {
          return Result.error(new AlreadyRatedProductError());
        }
      }

      // Verificar que el servicio existe (si se envía)
      if (createRatingDto.serviceId) {
        const service = await this.serviceRepository.findOne({
          where: { idService: createRatingDto.serviceId },
        });
        if (!service) {
          return Result.error(new ServiceNotFoundForRatingError(createRatingDto.serviceId));
        }

        const existing = await this.ratingRepository.findOne({
          where: {
            userId: createRatingDto.userId,
            serviceId: createRatingDto.serviceId,
          },
        });
        if (existing) {
          return Result.error(new AlreadyRatedServiceError());
        }
      }

      const newRating = this.ratingRepository.create({
        quantity: createRatingDto.quantity,
        userId: createRatingDto.userId,
        productId: createRatingDto.productId || null,
        serviceId: createRatingDto.serviceId || null,
      });

      const saved = await this.ratingRepository.save(newRating);
      return Result.success(saved);
    } catch (error) {
      return Result.error(new BaseError('Error interno al crear la calificación', 500));
    }
  }

  async findAll(): Promise<Result<Rating[]>> {
    try {
      const ratings = await this.ratingRepository.find({
        relations: { user: true, product: true, service: true },
      });
      return Result.success(ratings);
    } catch {
      return Result.error(new BaseError('Error al obtener calificaciones', 500));
    }
  }

  async findOne(id: string): Promise<Result<Rating>> {
    try {
      const rating = await this.ratingRepository.findOne({
        where: { idRating: id },
        relations: { user: true, product: true, service: true },
      });
      if (!rating) {
        return Result.error(new RatingNotFoundError(id));
      }
      return Result.success(rating);
    } catch {
      return Result.error(new BaseError('Error al buscar calificación', 500));
    }
  }

  async findByProduct(productId: string): Promise<Result<Rating[]>> {
    try {
      const ratings = await this.ratingRepository.find({
        where: { productId },
        relations: { user: true },
      });
      return Result.success(ratings);
    } catch {
      return Result.error(new BaseError('Error al obtener calificaciones del producto', 500));
    }
  }

  async findByService(serviceId: string): Promise<Result<Rating[]>> {
    try {
      const ratings = await this.ratingRepository.find({
        where: { serviceId },
        relations: { user: true },
      });
      return Result.success(ratings);
    } catch {
      return Result.error(new BaseError('Error al obtener calificaciones del servicio', 500));
    }
  }

  async update(id: string, updateRatingDto: UpdateRatingDto): Promise<Result<Rating>> {
    try {
      const ratingResult = await this.findOne(id);
      if (!ratingResult.isSuccess) {
        return Result.error(ratingResult.error!);
      }
      const rating = ratingResult.data!;

      if (updateRatingDto.quantity !== undefined) {
        rating.quantity = updateRatingDto.quantity;
      }

      const updated = await this.ratingRepository.save(rating);
      return Result.success(updated);
    } catch {
      return Result.error(new BaseError('Error al actualizar calificación', 500));
    }
  }

  async remove(id: string): Promise<Result<void>> {
    try {
      const ratingResult = await this.findOne(id);
      if (!ratingResult.isSuccess) {
        return Result.error(ratingResult.error!);
      }
      await this.ratingRepository.delete(id);
      return Result.successNoData();
    } catch {
      return Result.error(new BaseError('Error al eliminar calificación', 500));
    }
  }
}