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

  async create(createUserEnterpriseDto: CreateUserEnterpriseDto, userId: string): Promise<Result<UserEnterprise>> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return Result.error(new UserNotFoundForEnterpriseError(userId));
      }

      const existing = await this.userEnterpriseRepository.findOne({
        where: { user: { id: userId } },
      });
      if (existing) {
        return Result.error(new UserEnterpriseAlreadyExistsError(userId));
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

  async findOne(id: string, userId: string): Promise<Result<UserEnterprise>> {
    try {
      const enterprise = await this.userEnterpriseRepository.findOne({
        where: { idUserEnterprise: id },
        relations: { user: true },
      });
      if (!enterprise) {
        return Result.error(new UserEnterpriseNotFoundError());
      }
      if (enterprise.userId !== userId) {
        return Result.error(new BaseError('No tienes permiso para acceder a esta empresa', 403));
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

  async update(
    id: string,
    updateUserEnterpriseDto: UpdateUserEnterpriseDto,
    userId: string,
  ): Promise<Result<UserEnterprise>> {
    try {
      const enterpriseResult = await this.findOne(id, userId);
      if (!enterpriseResult.isSuccess) {
        return Result.error(enterpriseResult.error!);
      }
      const enterprise = enterpriseResult.data!;

      // Si llegamos aquí, ya pertenece al usuario (findOne lo verifica)

      if (updateUserEnterpriseDto.companyName !== undefined) {
        enterprise.companyName = updateUserEnterpriseDto.companyName;
      }
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

  async remove(id: string, userId: string): Promise<Result<void>> {
    try {
      const enterpriseResult = await this.findOne(id, userId);
      if (!enterpriseResult.isSuccess) {
        return Result.error(enterpriseResult.error!);
      }
      // Si llegamos aquí, ya pertenece al usuario
      await this.userEnterpriseRepository.delete(id);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al eliminar la empresa', 500));
    }
  }
}