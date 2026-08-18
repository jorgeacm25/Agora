import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from './account/account.module';
import { Account } from './account/entities/account.entity';
import { User } from '../../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, User]),
    AccountModule,
  ],
  exports: [AccountModule, TypeOrmModule],
})
export class AdministrationModule {}