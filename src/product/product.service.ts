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

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(UserEnterprise)
    private userEnterpriseRepository: Repository<UserEnterprise>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Result<void>> {
    try {
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
      await this.productRepository.save(product);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al crear producto', 500));
    }
  }

  async findAll(): Promise<Result<Product[]>> {
    try {
      const products = await this.productRepository.find();
      return Result.success(products);
    } catch {
      return Result.error(new BaseError('Error al obtener productos', 500));
    }
  }

  async findOne(id: string): Promise<Result<Product>> {
    try {
      const product = await this.productRepository.findOne({
        where: { idProduct: id },
        relations: { userEnterprise: true },
      });
      if (!product) {
        return Result.error(new BaseError('Producto no encontrado', 404));
      }
      return Result.success(product);
    } catch {
      return Result.error(new BaseError('Error al buscar producto', 500));
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Result<void>> {
    try {
      const productResult = await this.findOne(id);
      if (!productResult.isSuccess) {
        return Result.error(productResult.error!);
      }
      const product = productResult.data!;

      if (updateProductDto.userEnterpriseId) {
        const enterprise = await this.userEnterpriseRepository.findOne({
          where: { idUserEnterprise: updateProductDto.userEnterpriseId },
        });
        if (!enterprise) {
          return Result.error(new BaseError('Empresa no encontrada', 404));
        }
        product.userEnterprise = enterprise;
        product.userEnterpriseId = updateProductDto.userEnterpriseId;
      }

      Object.assign(product, updateProductDto);
      await this.productRepository.save(product);
      return Result.successNoData();
    } catch {
      return Result.error(new BaseError('Error al actualizar producto', 500));
    }
  }

  async remove(id: string): Promise<Result<void>> {
    try {
      // 1. Obtener el producto antes de eliminarlo
      const product = await this.productRepository.findOne({
        where: { idProduct: id },
      });
      if (!product) {
        return Result.error(new BaseError('Producto no encontrado', 404));
      }

      // 2. Si tiene imagen, eliminar el archivo físico
      if (product.image) {
        // Extraer el nombre del archivo de la URL (ej: /products/image/archivo.png)
        const fileName = product.image.split('/').pop();
        if (fileName) {
          const filePath = path.join(process.cwd(), 'uploads/products', fileName);
          try {
            await fs.unlink(filePath);
          } catch (error) {
            // Si el archivo no existe, continuar (puedes registrar el error si quieres)
            // console.warn(`No se pudo eliminar la imagen: ${filePath}`, error.message);
          }
        }
      }

      // 3. Eliminar el registro de la base de datos
      await this.productRepository.delete(id);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al eliminar producto', 500));
    }
  }
}