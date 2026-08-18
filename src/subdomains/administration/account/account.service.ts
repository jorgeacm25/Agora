import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Account } from './entities/account.entity';
import { User } from '../../../user/entities/user.entity';

import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Result } from '../../../common/classes/result.class';
import { AccountNotFoundError } from './errors/account-not-found.error';
import { AccountAlreadyExistsError } from './errors/account-already-exists.error';
import { UserNotFoundForAccountError } from './errors/user-not-found-for-account.error';
import { AccountNumberAlreadyExistsError } from './errors/account-number-already-exists.error';
import { BaseError } from '../../../common/errors/base.error';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Generar número de cuenta único
  private generateAccountNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `ACC-${timestamp}-${random}`;
  }

  // Crear cuenta
  async create(createAccountDto: CreateAccountDto): Promise<Result<Account>> {
    try {
      // 1. Verificar que el usuario existe
      const user = await this.userRepository.findOne({
        where: { id: createAccountDto.userId },
      });

      if (!user) {
        return Result.error(
          new UserNotFoundForAccountError(createAccountDto.userId),
        );
      }

      // 2. Verificar si el usuario ya tiene una cuenta activa
      const existingAccount = await this.accountRepository.findOne({
        where: {
          userId: createAccountDto.userId,
          deletedAt: IsNull(),
        },
      });

      if (existingAccount) {
        return Result.error(
          new AccountAlreadyExistsError(createAccountDto.userId),
        );
      }

      // 3. Verificar si se proporcionó un número de cuenta y si ya existe
      if (createAccountDto.accountNumber) {
        const accountWithNumber = await this.accountRepository.findOne({
          where: {
            accountNumber: createAccountDto.accountNumber,
            deletedAt: IsNull(),
          },
        });

        if (accountWithNumber) {
          return Result.error(
            new AccountNumberAlreadyExistsError(createAccountDto.accountNumber),
          );
        }
      }

      // 4. Crear la cuenta
      const accountNumber = createAccountDto.accountNumber || this.generateAccountNumber();

      const newAccount = this.accountRepository.create({
        user: user,
        userId: user.id,
        name: createAccountDto.name,
        description: createAccountDto.description || '',
        accountType: createAccountDto.accountType,
        accountNumber: accountNumber,
        balance: createAccountDto.initialBalance,
        initialBalance: createAccountDto.initialBalance,
        currency: createAccountDto.currency || 'USD',
        status: true,
        createdAt: new Date(),
        lastActivityAt: new Date(),
      });

      const saved = await this.accountRepository.save(newAccount);
      return Result.success(saved);
    } catch (error) {
      return Result.error(
        new BaseError('Error interno al crear la cuenta', 500),
      );
    }
  }

  // Obtener todas las cuentas
  async findAll(includeDeleted: boolean = false): Promise<Result<Account[]>> {
    try {
      const whereCondition: any = {};
      if (!includeDeleted) {
        whereCondition.deletedAt = IsNull();
      }

      const accounts = await this.accountRepository.find({
        where: whereCondition,
        relations: { user: true },
        order: { createdAt: 'DESC' },
      });
      return Result.success(accounts);
    } catch {
      return Result.error(new BaseError('Error al obtener las cuentas', 500));
    }
  }

  // Obtener cuentas activas
  async findActive(): Promise<Result<Account[]>> {
    try {
      const accounts = await this.accountRepository.find({
        where: {
          status: true,
          deletedAt: IsNull(),
        },
        relations: { user: true },
        order: { createdAt: 'DESC' },
      });
      return Result.success(accounts);
    } catch {
      return Result.error(new BaseError('Error al obtener cuentas activas', 500));
    }
  }

  // Obtener cuenta por ID
  async findOne(id: string): Promise<Result<Account>> {
    try {
      const account = await this.accountRepository.findOne({
        where: {
          idAccount: id,
          deletedAt: IsNull(),
        },
        relations: { user: true },
      });

      if (!account) {
        return Result.error(new AccountNotFoundError());
      }

      return Result.success(account);
    } catch {
      return Result.error(new BaseError('Error al buscar la cuenta', 500));
    }
  }

  // Obtener cuenta por número de cuenta
  async findByAccountNumber(accountNumber: string): Promise<Result<Account>> {
    try {
      const account = await this.accountRepository.findOne({
        where: {
          accountNumber: accountNumber,
          deletedAt: IsNull(),
        },
        relations: { user: true },
      });

      if (!account) {
        return Result.error(new AccountNotFoundError());
      }

      return Result.success(account);
    } catch {
      return Result.error(new BaseError('Error al buscar la cuenta por número', 500));
    }
  }

  // Obtener cuenta por usuario
  async findByUserId(userId: string): Promise<Result<Account>> {
    try {
      const account = await this.accountRepository.findOne({
        where: {
          userId: userId,
          deletedAt: IsNull(),
        },
        relations: { user: true },
      });

      if (!account) {
        return Result.error(new AccountNotFoundError());
      }

      return Result.success(account);
    } catch {
      return Result.error(new BaseError('Error al buscar la cuenta por usuario', 500));
    }
  }

  // Actualizar cuenta
  async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Result<Account>> {
    try {
      const accountResult = await this.findOne(id);

      if (!accountResult.isSuccess) {
        return Result.error(accountResult.error!);
      }

      const account = accountResult.data!;

      if (updateAccountDto.name !== undefined) {
        account.name = updateAccountDto.name;
      }

      if (updateAccountDto.description !== undefined) {
        account.description = updateAccountDto.description;
      }

      if (updateAccountDto.accountType !== undefined) {
        account.accountType = updateAccountDto.accountType;
      }

      if (updateAccountDto.balance !== undefined) {
        account.balance = updateAccountDto.balance;
      }

      if (updateAccountDto.currency !== undefined) {
        account.currency = updateAccountDto.currency;
      }

      if (updateAccountDto.status !== undefined) {
        account.status = updateAccountDto.status;
      }

      if (updateAccountDto.userId !== undefined) {
        const user = await this.userRepository.findOne({
          where: { id: updateAccountDto.userId },
        });

        if (!user) {
          return Result.error(
            new UserNotFoundForAccountError(updateAccountDto.userId),
          );
        }

        account.userId = updateAccountDto.userId;
        account.user = user;
      }

      const updated = await this.accountRepository.save(account);
      return Result.success(updated);
    } catch (error) {
      return Result.error(new BaseError('Error al actualizar la cuenta', 500));
    }
  }

  // Actualizar saldo
  async updateBalance(id: string, amount: number): Promise<Result<Account>> {
    try {
      const accountResult = await this.findOne(id);

      if (!accountResult.isSuccess) {
        return Result.error(accountResult.error!);
      }

      const account = accountResult.data!;
      account.balance += amount;
      account.lastActivityAt = new Date();

      const updated = await this.accountRepository.save(account);
      return Result.success(updated);
    } catch (error) {
      return Result.error(new BaseError('Error al actualizar el saldo', 500));
    }
  }

  // Soft Delete
  async remove(id: string): Promise<Result<void>> {
    try {
      const accountResult = await this.findOne(id);

      if (!accountResult.isSuccess) {
        return Result.error(accountResult.error!);
      }

      const account = accountResult.data!;
      account.status = false;
      account.deletedAt = new Date();

      await this.accountRepository.save(account);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al eliminar la cuenta', 500));
    }
  }

  // Restaurar cuenta eliminada
  async restore(id: string): Promise<Result<Account>> {
    try {
      const account = await this.accountRepository.findOne({
        where: {
          idAccount: id,
          deletedAt: Not(IsNull()),
        },
        relations: { user: true },
      });

      if (!account) {
        return Result.error(new AccountNotFoundError());
      }

      account.status = true;
      account.deletedAt = null;

      const restored = await this.accountRepository.save(account);
      return Result.success(restored);
    } catch (error) {
      return Result.error(new BaseError('Error al restaurar la cuenta', 500));
    }
  }
}