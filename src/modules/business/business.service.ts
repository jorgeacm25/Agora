import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, In } from 'typeorm';
import { Business } from './entities/business.entity';
import { BusinessType } from '../business-types/entities/business-type.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(BusinessType)
    private businessTypeRepository: Repository<BusinessType>,
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id: createBusinessDto.businessTypeId },
    });

    if (!businessType) {
      throw new NotFoundException(
        `Tipo de negocio con ID "${createBusinessDto.businessTypeId}" no encontrado`,
      );
    }

    const existing = await this.businessRepository.findOne({
      where: { name: createBusinessDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un negocio con el nombre "${createBusinessDto.name}"`,
      );
    }

    const business = this.businessRepository.create({
      ...createBusinessDto,
      businessType,
    });

    return await this.businessRepository.save(business);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
    businessTypeId?: string,
  ): Promise<{ data: Business[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Business> = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (businessTypeId) {
      where.businessTypeId = businessTypeId;
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [data, total] = await this.businessRepository.findAndCount({
      where,
      relations: { businessType: true }, 
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

  async findOne(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: { businessType: true }, 
    });

    if (!business) {
      throw new NotFoundException(`Negocio con ID "${id}" no encontrado`);
    }

    return business;
  }

  async findByName(name: string): Promise<Business[]> {
    return await this.businessRepository.find({
      where: { name: ILike(`%${name}%`) },
      relations: { businessType: true }, 
      order: { name: 'ASC' },
    });
  }

  async findByBusinessType(businessTypeId: string): Promise<Business[]> {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id: businessTypeId },
    });

    if (!businessType) {
      throw new NotFoundException(
        `Tipo de negocio con ID "${businessTypeId}" no encontrado`,
      );
    }

    return await this.businessRepository.find({
      where: { businessTypeId, isActive: true },
      relations: { businessType: true }, 
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto): Promise<Business> {
    const business = await this.findOne(id);

    if (updateBusinessDto.businessTypeId) {
      const businessType = await this.businessTypeRepository.findOne({
        where: { id: updateBusinessDto.businessTypeId },
      });

      if (!businessType) {
        throw new NotFoundException(
          `Tipo de negocio con ID "${updateBusinessDto.businessTypeId}" no encontrado`,
        );
      }

      business.businessType = businessType;
      business.businessTypeId = updateBusinessDto.businessTypeId;
    }

    if (updateBusinessDto.name && updateBusinessDto.name !== business.name) {
      const existing = await this.businessRepository.findOne({
        where: { name: updateBusinessDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe un negocio con el nombre "${updateBusinessDto.name}"`,
        );
      }
    }

    const { businessTypeId, ...updateData } = updateBusinessDto;
    Object.assign(business, updateData);

    return await this.businessRepository.save(business);
  }

  async remove(id: string): Promise<void> {
    const business = await this.findOne(id);
    await this.businessRepository.remove(business);
  }

  async softDelete(id: string): Promise<Business> {
    const business = await this.findOne(id);
    business.isActive = false;
    return await this.businessRepository.save(business);
  }

  async restore(id: string): Promise<Business> {
    const business = await this.findOne(id);
    business.isActive = true;
    return await this.businessRepository.save(business);
  }

  async getActiveBusinesses(): Promise<Business[]> {
    return await this.businessRepository.find({
      where: { isActive: true },
      relations: { businessType: true }, 
      order: { name: 'ASC' },
    });
  }

  async getBusinessesByTypeIds(typeIds: string[]): Promise<Business[]> {
    return await this.businessRepository.find({
      where: {
        businessTypeId: In(typeIds),
        isActive: true,
      },
      relations: { businessType: true }, 
      order: { name: 'ASC' },
    });
  }

  async getTotalBusinesses(): Promise<number> {
    return await this.businessRepository.count();
  }

  async getTotalActive(): Promise<number> {
    return await this.businessRepository.count({
      where: { isActive: true },
    });
  }

  async getTotalInactive(): Promise<number> {
    return await this.businessRepository.count({
      where: { isActive: false },
    });
  }

  async getBusinessesByType(): Promise<any> {
    const result = await this.businessRepository
      .createQueryBuilder('business')
      .select('business.businessTypeId', 'typeId')
      .addSelect('businessType.name', 'typeName')
      .addSelect('COUNT(business.id)', 'count')
      .leftJoin('business.businessType', 'businessType')
      .where('business.isActive = :isActive', { isActive: true })
      .groupBy('business.businessTypeId')
      .addGroupBy('businessType.name')
      .getRawMany();

    return result;
  }

  async getRecentBusinesses(limit: number = 5): Promise<Business[]> {
    return await this.businessRepository.find({
      relations: { businessType: true }, 
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}