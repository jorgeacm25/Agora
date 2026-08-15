import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { UserEnterprise } from '../user-enterprise/entities/user-enterprise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, UserEnterprise])],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}