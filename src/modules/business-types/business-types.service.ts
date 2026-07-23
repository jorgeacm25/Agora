import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { BusinessType } from './entities/business-type.entity';
import { CreateBusinessTypeDto } from './dto/create-business-type.dto';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto';

@Injectable()
export class BusinessTypesService {
  constructor(
    @InjectRepository(BusinessType)
    private businessTypeRepository: Repository<BusinessType>,
  ) {}

  async create(
    createBusinessTypeDto: CreateBusinessTypeDto,
  ): Promise<BusinessType> {
    const existing = await this.businessTypeRepository.findOne({
      where: { name: createBusinessTypeDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un tipo de negocio con el nombre "${createBusinessTypeDto.name}"`,
      );
    }

    const businessType = this.businessTypeRepository.create(
      createBusinessTypeDto,
    );
    return await this.businessTypeRepository.save(businessType);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
  ): Promise<{
    data: BusinessType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<BusinessType> = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [data, total] = await this.businessTypeRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        name: 'ASC',
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<BusinessType> {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id },
    });

    if (!businessType) {
      throw new NotFoundException(
        `Tipo de negocio con ID "${id}" no encontrado`,
      );
    }

    return businessType;
  }

  async findByName(name: string): Promise<BusinessType> {
    const businessType = await this.businessTypeRepository.findOne({
      where: { name },
    });

    if (!businessType) {
      throw new NotFoundException(
        `Tipo de negocio con nombre "${name}" no encontrado`,
      );
    }

    return businessType;
  }

  async update(
    id: string,
    updateBusinessTypeDto: UpdateBusinessTypeDto,
  ): Promise<BusinessType> {
    const businessType = await this.findOne(id);

    if (updateBusinessTypeDto.name) {
      const existing = await this.businessTypeRepository.findOne({
        where: { name: updateBusinessTypeDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe un tipo de negocio con el nombre "${updateBusinessTypeDto.name}"`,
        );
      }
    }

    if (
      updateBusinessTypeDto.payCant !== undefined &&
      updateBusinessTypeDto.payCant < 0
    ) {
      throw new BadRequestException('El monto no puede ser negativo');
    }

    Object.assign(businessType, updateBusinessTypeDto);
    return await this.businessTypeRepository.save(businessType);
  }

  async remove(id: string): Promise<void> {
    const businessType = await this.findOne(id);
    await this.businessTypeRepository.remove(businessType);
  }

  async softDelete(id: string): Promise<BusinessType> {
    const businessType = await this.findOne(id);
    businessType.isActive = false;
    return await this.businessTypeRepository.save(businessType);
  }

  async restore(id: string): Promise<BusinessType> {
    const businessType = await this.findOne(id);
    businessType.isActive = true;
    return await this.businessTypeRepository.save(businessType);
  }

  async getActiveBusinessTypes(): Promise<BusinessType[]> {
    return await this.businessTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getTotalBusinessTypes(): Promise<number> {
    return await this.businessTypeRepository.count();
  }

  async getTotalActive(): Promise<number> {
    return await this.businessTypeRepository.count({
      where: { isActive: true },
    });
  }

  async getTotalInactive(): Promise<number> {
    return await this.businessTypeRepository.count({
      where: { isActive: false },
    });
  }

  async getAveragePayCant(): Promise<number> {
    const result = await this.businessTypeRepository
      .createQueryBuilder('business_type')
      .select('AVG(business_type.payCant)', 'average')
      .where('business_type.isActive = :isActive', { isActive: true })
      .getRawOne();

    return parseFloat(result.average) || 0;
  }
}
