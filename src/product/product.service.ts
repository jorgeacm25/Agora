import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserEnterprise } from '../user-enterprise/entities/user-enterprise.entity';
import { Result } from 'src/common/classes/result.class';
import { BaseError } from 'src/common/errors/base.error';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FilterProductsDto } from './dto/filter-products.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(UserEnterprise)
    private userEnterpriseRepository: Repository<UserEnterprise>,
  ) {}

  async getUserEnterprise(userId: string): Promise<UserEnterprise | null> {
    return await this.userEnterpriseRepository.findOne({
      where: { userId },
    });
  }

  // ✅ RETORNA Product (no void)
  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Result<Product>> {
    try {
      if (
        (createProductDto.priceCup === null || createProductDto.priceCup === undefined) &&
        (createProductDto.priceUsd === null || createProductDto.priceUsd === undefined)
      ) {
        return Result.error(new BaseError('Debe proporcionar al menos un precio (CUP o USD)', 400));
      }

      const enterprise = await this.userEnterpriseRepository.findOne({
        where: { idUserEnterprise: createProductDto.userEnterpriseId },
      });
      if (!enterprise) {
        return Result.error(new BaseError('Empresa no encontrada', 404));
      }

      const productData: any = {
        ...createProductDto,
        userEnterprise: enterprise,
      };

      if (file) {
        productData.image = `/products/image/${file.filename}`;
      }

      const product = this.productRepository.create(productData);
      const saved = await this.productRepository.save(product);
const savedProduct = Array.isArray(saved) ? saved[0] : saved;
return Result.success(savedProduct);
    } catch (error) {
      return Result.error(new BaseError('Error al crear producto', 500));
    }
  }

  async findAll(filters: FilterProductsDto): Promise<Result<{ products: Product[]; total: number }>> {
    try {
      const query = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.userEnterprise', 'userEnterprise');

      // 1. Filtro por precio (usamos priceCup como referencia principal)
      if (filters.minPrice !== undefined) {
        query.andWhere('product.priceCup >= :minPrice', { minPrice: filters.minPrice });
      }
      if (filters.maxPrice !== undefined) {
        query.andWhere('product.priceCup <= :maxPrice', { maxPrice: filters.maxPrice });
      }

      // 2. Filtro por rating promedio (subconsulta)
      if (filters.minRating !== undefined) {
        const ratingSubQuery = this.productRepository
          .createQueryBuilder('subProduct')
          .select('AVG(rating.quantity)', 'avgRating')
          .leftJoin('subProduct.ratings', 'rating')
          .where('subProduct.idProduct = product.idProduct')
          .groupBy('subProduct.idProduct');

        query.andWhere(`(${ratingSubQuery.getQuery()}) >= :minRating`, {
          minRating: filters.minRating,
        }).setParameters(ratingSubQuery.getParameters());
      }

      // 3. Filtro por ubicación (distancia desde coordenadas)
      if (filters.latitude !== undefined && filters.longitude !== undefined) {
        // Haversine formula (en km)
        const distanceFormula = `
          (6371 * acos(
            cos(radians(:lat)) * cos(radians(userEnterprise.latitude)) *
            cos(radians(userEnterprise.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(userEnterprise.latitude))
          ))
        `;
        query.andWhere(`${distanceFormula} <= :radius`, {
          lat: filters.latitude,
          lng: filters.longitude,
          radius: filters.radius || 10,
        });
      }

      // 4. Paginación
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      // 5. Orden (por precio ascendente como ejemplo)
      query.orderBy('product.priceCup', 'ASC');

      // 6. Obtener total (sin paginación) y luego los resultados
      const total = await query.getCount();
      query.skip(skip).take(limit);

      const products = await query.getMany();

      return Result.success({ products, total });
    } catch (error) {
      return Result.error(new BaseError('Error al obtener productos', 500));
    }
  }

  async findOne(id: string): Promise<Result<Product>> {
    try {
      const product = await this.productRepository.findOne({
        where: { idProduct: id },
        relations: { userEnterprise: { user: true } },
      });
      if (!product) {
        return Result.error(new BaseError('Producto no encontrado', 404));
      }
      return Result.success(product);
    } catch {
      return Result.error(new BaseError('Error al buscar producto', 500));
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<Result<void>> {
    try {
      const productResult = await this.findOne(id);
      if (!productResult.isSuccess) {
        return Result.error(productResult.error!);
      }
      const product = productResult.data!;

      const userEnterprise = await this.getUserEnterprise(userId);
      if (!userEnterprise || userEnterprise.idUserEnterprise !== product.userEnterpriseId) {
        return Result.error(
          new BaseError('No tienes permiso para editar este producto', 403),
        );
      }

      if (updateProductDto.userEnterpriseId !== undefined) {
        return Result.error(
          new BaseError('No se puede reasignar el producto a otra empresa', 400),
        );
      }

      // Si se actualizan precios, validar que al menos uno tenga valor
      if (
        updateProductDto.priceCup === null &&
        updateProductDto.priceUsd === null &&
        updateProductDto.priceCup !== undefined &&
        updateProductDto.priceUsd !== undefined
      ) {
        return Result.error(new BaseError('Debe proporcionar al menos un precio (CUP o USD)', 400));
      }

      Object.assign(product, updateProductDto);
      await this.productRepository.save(product);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al actualizar producto', 500));
    }
  }

  async remove(id: string, userId: string): Promise<Result<void>> {
    try {
      const productResult = await this.findOne(id);
      if (!productResult.isSuccess) {
        return Result.error(productResult.error!);
      }
      const product = productResult.data!;

      const userEnterprise = await this.getUserEnterprise(userId);
      if (!userEnterprise || userEnterprise.idUserEnterprise !== product.userEnterpriseId) {
        return Result.error(
          new BaseError('No tienes permiso para eliminar este producto', 403),
        );
      }

      if (product.image) {
        const fileName = product.image.split('/').pop();
        if (fileName) {
          const filePath = path.join(process.cwd(), 'uploads/products', fileName);
          try {
            await fs.unlink(filePath);
          } catch (error) {
            // Si no existe, continuar
          }
        }
      }

      await this.productRepository.delete(id);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al eliminar producto', 500));
    }
  }
}