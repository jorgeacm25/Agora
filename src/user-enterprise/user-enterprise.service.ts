import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEnterprise } from './entities/user-enterprise.entity';
import { User } from '../user/entities/user.entity';
import { CreateUserEnterpriseDto } from './dto/create-user-enterprise.dto';
import { UpdateUserEnterpriseDto } from './dto/update-user-enterprise.dto';
import { Result } from '../common/classes/result.class';
import { UserEnterpriseNotFoundError } from './errors/user-enterprise-not-found.error';
import { UserEnterpriseAlreadyExistsError } from './errors/user-enterprise-already-exists.error';
import { UserNotFoundForEnterpriseError } from './errors/user-not-found-for-enterprise.error';
import { BaseError } from '../common/errors/base.error';

@Injectable()
export class UserEnterpriseService {
  constructor(
    @InjectRepository(UserEnterprise)
    private userEnterpriseRepository: Repository<UserEnterprise>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserEnterpriseDto: CreateUserEnterpriseDto): Promise<Result<UserEnterprise>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: createUserEnterpriseDto.userId },
      });
      
      if (!user) {
        return Result.error(new UserNotFoundForEnterpriseError(createUserEnterpriseDto.userId));
      }

      const existing = await this.userEnterpriseRepository.findOne({
        where: { user: { id: createUserEnterpriseDto.userId } },
        relations: { user: true },
      });

      if (existing) {
        return Result.error(new UserEnterpriseAlreadyExistsError(createUserEnterpriseDto.userId));
      }

      const newUserEnterprise = this.userEnterpriseRepository.create({
        user: user,
        companyName: createUserEnterpriseDto.companyName,
        address: createUserEnterpriseDto.address,
        contact: createUserEnterpriseDto.contact,
        officeHours: createUserEnterpriseDto.officeHours,
        code: createUserEnterpriseDto.code,
      });

      const saved = await this.userEnterpriseRepository.save(newUserEnterprise);
      return Result.success(saved);
    } catch (error) {
      return Result.error(new BaseError('Error interno al crear la empresa', 500));
    }
  }

  async findAll(): Promise<Result<UserEnterprise[]>> {
    try {
      const enterprises = await this.userEnterpriseRepository.find({
        relations: { user: true },
      });
      return Result.success(enterprises);
    } catch {
      return Result.error(new BaseError('Error al obtener las empresas', 500));
    }
  }

  async findOne(id: string): Promise<Result<UserEnterprise>> {
    try {
      const enterprise = await this.userEnterpriseRepository.findOne({
        where: { idUserEnterprise: id },
        relations: { user: true },
      });
      
      if (!enterprise) {
        return Result.error(new UserEnterpriseNotFoundError());
      }
      
      return Result.success(enterprise);
    } catch {
      return Result.error(new BaseError('Error al buscar la empresa', 500));
    }
  }

  async findByUserId(userId: string): Promise<Result<UserEnterprise>> {
    try {
      const enterprise = await this.userEnterpriseRepository.findOne({
        where: { user: { id: userId } },
        relations: { user: true },
      });
      
      if (!enterprise) {
        return Result.error(new UserEnterpriseNotFoundError());
      }
      
      return Result.success(enterprise);
    } catch {
      return Result.error(new BaseError('Error al buscar la empresa por usuario', 500));
    }
  }

  async update(id: string, updateUserEnterpriseDto: UpdateUserEnterpriseDto): Promise<Result<UserEnterprise>> {
    try {
      const enterpriseResult = await this.findOne(id);
      
      if (!enterpriseResult.isSuccess) {
        return Result.error(enterpriseResult.error!);
      }

      const enterprise = enterpriseResult.data!;

      // Actualizar campos simples
      if (updateUserEnterpriseDto.companyName !== undefined) {
        enterprise.companyName = updateUserEnterpriseDto.companyName;
      }
      
      // Actualizar address - propiedad por propiedad
      if (updateUserEnterpriseDto.address !== undefined) {
        const addressDto = updateUserEnterpriseDto.address;
        enterprise.address = {
          street: addressDto.street ?? enterprise.address.street,
          city: addressDto.city ?? enterprise.address.city,
          state: addressDto.state ?? enterprise.address.state,
          zipCode: addressDto.zipCode ?? enterprise.address.zipCode,
          country: addressDto.country ?? enterprise.address.country,
        };
      }
      
      // Actualizar contact - propiedad por propiedad
      if (updateUserEnterpriseDto.contact !== undefined) {
        const contactDto = updateUserEnterpriseDto.contact;
        enterprise.contact = {
          email: contactDto.email ?? enterprise.contact.email,
          phone: contactDto.phone ?? enterprise.contact.phone,
          website: contactDto.website ?? enterprise.contact.website,
        };
      }
      
      if (updateUserEnterpriseDto.officeHours !== undefined) {
        enterprise.officeHours = updateUserEnterpriseDto.officeHours;
      }
      
      if (updateUserEnterpriseDto.code !== undefined) {
        enterprise.code = updateUserEnterpriseDto.code;
      }

      const updated = await this.userEnterpriseRepository.save(enterprise);
      return Result.success(updated);
    } catch (error) {
      return Result.error(new BaseError('Error al actualizar la empresa', 500));
    }
  }

  async remove(id: string): Promise<Result<void>> {
    try {
      const result = await this.userEnterpriseRepository.delete(id);
      
      if (result.affected === 0) {
        return Result.error(new UserEnterpriseNotFoundError());
      }
      
      return Result.successNoData();
    } catch {
      return Result.error(new BaseError('Error al eliminar la empresa', 500));
    }
  }
}