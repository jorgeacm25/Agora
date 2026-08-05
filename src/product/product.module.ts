import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { UserEnterprise } from '../user-enterprise/entities/user-enterprise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, UserEnterprise])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}