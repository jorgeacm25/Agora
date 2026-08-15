import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UserEnterprise } from '../user-enterprise/entities/user-enterprise.entity';
import { Result } from '../common/classes/result.class';
import { BaseError } from '../common/errors/base.error';
import { ServiceNotFoundError } from './errors/service-not-found.error';
import { ServicePriceRequiredError } from './errors/service-price-required.error';
import { ServicePermissionError } from './errors/service-permission.error';
import { ServiceAlreadyExistsError } from './errors/service-already-exists.error';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(UserEnterprise)
    private userEnterpriseRepository: Repository<UserEnterprise>,
  ) {}

  async getUserEnterprise(userId: string): Promise<UserEnterprise | null> {
    return await this.userEnterpriseRepository.findOne({
      where: { userId },
    });
  }

  async create(createServiceDto: CreateServiceDto): Promise<Result<Service>> {
    try {
      if (
        (createServiceDto.priceCup === null || createServiceDto.priceCup === undefined) &&
        (createServiceDto.priceUsd === null || createServiceDto.priceUsd === undefined)
      ) {
        return Result.error(new ServicePriceRequiredError());
      }

      const enterprise = await this.userEnterpriseRepository.findOne({
        where: { idUserEnterprise: createServiceDto.userEnterpriseId },
      });
      if (!enterprise) {
        return Result.error(new BaseError('Empresa no encontrada', 404));
      }

      const existingService = await this.serviceRepository.findOne({
        where: {
          name: createServiceDto.name,
          userEnterpriseId: createServiceDto.userEnterpriseId,
        },
      });
      if (existingService) {
        return Result.error(new ServiceAlreadyExistsError(createServiceDto.name));
      }

      const serviceData: any = {
        ...createServiceDto,
        userEnterprise: enterprise,
      };

      const service = this.serviceRepository.create(serviceData);
      const saved = await this.serviceRepository.save(service);
      const savedService = Array.isArray(saved) ? saved[0] : saved;
      return Result.success(savedService);
    } catch (error) {
      return Result.error(new BaseError('Error al crear el servicio', 500));
    }
  }

  async findAll(): Promise<Result<Service[]>> {
    try {
      const services = await this.serviceRepository.find({
        relations: { userEnterprise: { user: true } },
      });
      return Result.success(services);
    } catch {
      return Result.error(new BaseError('Error al obtener los servicios', 500));
    }
  }

  async findOne(id: string): Promise<Result<Service>> {
    try {
      const service = await this.serviceRepository.findOne({
        where: { idService: id },
        relations: { userEnterprise: { user: true } },
      });
      if (!service) {
        return Result.error(new ServiceNotFoundError(id));
      }
      return Result.success(service);
    } catch {
      return Result.error(new BaseError('Error al buscar el servicio', 500));
    }
  }

  async findByEnterprise(enterpriseId: string): Promise<Result<Service[]>> {
    try {
      const services = await this.serviceRepository.find({
        where: { userEnterpriseId: enterpriseId },
        relations: { userEnterprise: { user: true } },
      });
      return Result.success(services);
    } catch {
      return Result.error(new BaseError('Error al obtener servicios de la empresa', 500));
    }
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    userId: string,
  ): Promise<Result<void>> {
    try {
      const serviceResult = await this.findOne(id);
      if (!serviceResult.isSuccess) {
        return Result.error(serviceResult.error!);
      }
      const service = serviceResult.data!;

      const userEnterprise = await this.getUserEnterprise(userId);
      if (!userEnterprise || userEnterprise.idUserEnterprise !== service.userEnterpriseId) {
        return Result.error(new ServicePermissionError());
      }

      if (updateServiceDto.userEnterpriseId !== undefined) {
        return Result.error(new BaseError('No se puede reasignar el servicio a otra empresa', 400));
      }

      if (
        updateServiceDto.priceCup === null &&
        updateServiceDto.priceUsd === null &&
        updateServiceDto.priceCup !== undefined &&
        updateServiceDto.priceUsd !== undefined
      ) {
        return Result.error(new ServicePriceRequiredError());
      }

      Object.assign(service, updateServiceDto);
      await this.serviceRepository.save(service);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al actualizar el servicio', 500));
    }
  }

  async remove(id: string, userId: string): Promise<Result<void>> {
    try {
      const serviceResult = await this.findOne(id);
      if (!serviceResult.isSuccess) {
        return Result.error(serviceResult.error!);
      }
      const service = serviceResult.data!;

      const userEnterprise = await this.getUserEnterprise(userId);
      if (!userEnterprise || userEnterprise.idUserEnterprise !== service.userEnterpriseId) {
        return Result.error(new ServicePermissionError());
      }

      await this.serviceRepository.delete(id);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al eliminar el servicio', 500));
    }
  }
}