import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEnterpriseController } from './user-enterprise.controller';
import { UserEnterpriseService } from './user-enterprise.service';
import { UserEnterprise } from './entities/user-enterprise.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEnterprise, User])],
  controllers: [UserEnterpriseController],
  providers: [UserEnterpriseService],
  exports: [UserEnterpriseService],
})
export class UserEnterpriseModule {}