import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Product } from './entities/product.entity';
import { Business } from '../business/entities/business.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const business = await this.businessRepository.findOne({
      where: { id: createProductDto.businessId },
    });

    if (!business) {
      throw new NotFoundException(
        `Negocio con ID "${createProductDto.businessId}" no encontrado`,
      );
    }

    const existing = await this.productRepository.findOne({
      where: {
        name: createProductDto.name,
        businessId: createProductDto.businessId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un producto con el nombre "${createProductDto.name}" en este negocio`,
      );
    }

    let photoPath: string | null = null;
    let photoPublicId: string | null = null;

    if (file) {
      const uploadResult = await this.saveImage(file);
      photoPath = uploadResult.path;
      photoPublicId = uploadResult.publicId;
    }

    const product = new Product();
    product.name = createProductDto.name;
    product.description = createProductDto.description || '';
    product.stock = createProductDto.stock;
    product.price = createProductDto.price;
    product.businessId = createProductDto.businessId;
    product.photo = photoPath || '';
    product.photoPublicId = photoPublicId || '';
    product.available = createProductDto.stock > 0;
    product.business = business;

    return await this.productRepository.save(product);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isAvailable?: boolean,
    businessId?: string,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Product> = {};

    if (isAvailable !== undefined) {
      where.available = isAvailable;
    }

    if (businessId) {
      where.businessId = businessId;
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.business', 'business')
      .where(where);

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('product.name', 'ASC')
      .addOrderBy('product.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { business: true },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
    }

    return product;
  }

  async findByBusiness(businessId: string): Promise<Product[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException(
        `Negocio con ID "${businessId}" no encontrado`,
      );
    }

    return await this.productRepository.find({
      where: { businessId, available: true },
      relations: { business: true },
      order: { name: 'ASC' },
    });
  }

  async findByName(name: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { name: ILike(`%${name}%`), available: true },
      relations: { business: true },
      order: { name: 'ASC' },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.businessId) {
      const business = await this.businessRepository.findOne({
        where: { id: updateProductDto.businessId },
      });

      if (!business) {
        throw new NotFoundException(
          `Negocio con ID "${updateProductDto.businessId}" no encontrado`,
        );
      }

      product.business = business;
      product.businessId = updateProductDto.businessId;
    }

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existing = await this.productRepository.findOne({
        where: {
          name: updateProductDto.name,
          businessId: product.businessId,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe un producto con el nombre "${updateProductDto.name}" en este negocio`,
        );
      }
    }

    if (file) {
      if (product.photo) {
        await this.deleteImage(product.photo);
      }

      const uploadResult = await this.saveImage(file);
      product.photo = uploadResult.path;
      product.photoPublicId = uploadResult.publicId;
    }

    if (updateProductDto.stock !== undefined) {
      product.stock = updateProductDto.stock;
      product.available = product.stock > 0;
    }

    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }

    if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description;
    }

    if (updateProductDto.price !== undefined) {
      product.price = updateProductDto.price;
    }

    if (updateProductDto.available !== undefined) {
      product.available = updateProductDto.available;
    }

    return await this.productRepository.save(product);
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    const product = await this.findOne(id);

    if (newStock < 0) {
      throw new BadRequestException('El stock no puede ser negativo');
    }

    product.stock = newStock;
    product.available = product.stock > 0;

    return await this.productRepository.save(product);
  }

  async increaseStock(id: string, quantity: number): Promise<Product> {
    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    const product = await this.findOne(id);
    product.stock += quantity;
    product.available = product.stock > 0;

    return await this.productRepository.save(product);
  }

  async decreaseStock(id: string, quantity: number): Promise<Product> {
    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    const product = await this.findOne(id);

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Stock actual: ${product.stock}, solicitado: ${quantity}`,
      );
    }

    product.stock -= quantity;
    product.available = product.stock > 0;

    return await this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    if (product.photo) {
      await this.deleteImage(product.photo);
    }

    await this.productRepository.remove(product);
  }

  async softDelete(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.available = false;
    return await this.productRepository.save(product);
  }

  async restore(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.available = product.stock > 0;
    return await this.productRepository.save(product);
  }

  async getProductsByBusinessType(businessTypeId: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.business', 'business')
      .leftJoinAndSelect('business.businessType', 'businessType')
      .where('businessType.id = :businessTypeId', { businessTypeId })
      .andWhere('product.available = :available', { available: true })
      .orderBy('product.name', 'ASC')
      .getMany();
  }

  async getTotalProducts(): Promise<number> {
    return await this.productRepository.count();
  }

  async getTotalAvailable(): Promise<number> {
    return await this.productRepository.count({
      where: { available: true },
    });
  }

  async getTotalUnavailable(): Promise<number> {
    return await this.productRepository.count({
      where: { available: false },
    });
  }

  async getLowStockProducts(threshold: number = 5): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.business', 'business')
      .where('product.stock <= :threshold', { threshold })
      .andWhere('product.available = :available', { available: true })
      .orderBy('product.stock', 'ASC')
      .getMany();
  }

  private async saveImage(file: Express.Multer.File): Promise<{
    path: string;
    publicId: string;
  }> {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', 'products');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      return {
        path: `/uploads/products/${fileName}`,
        publicId: fileName,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al guardar la imagen: ${error.message}`,
      );
    }
  }

  private async deleteImage(imagePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error(`Error al eliminar imagen: ${error.message}`);
    }
  }

  async getProductStats() {
    const [total, available, unavailable, lowStock] = await Promise.all([
      this.getTotalProducts(),
      this.getTotalAvailable(),
      this.getTotalUnavailable(),
      this.getLowStockProducts(5),
    ]);

    return {
      total,
      available,
      unavailable,
      lowStock: lowStock.length,
      lowStockProducts: lowStock.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        business: p.business?.name,
      })),
    };
  }
}