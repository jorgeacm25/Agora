import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  Req,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permissions } from 'src/common/permissions/permissions';
import { Result } from 'src/common/classes/result.class';
import { Product } from './entities/product.entity';
import { multerConfig } from 'src/config/multer.config';
import * as path from 'path';
import * as fs from 'fs';
import { FilterProductsDto } from './dto/filter-products.dto';

@ApiTags('products')
@ApiBearerAuth('access-token')
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        priceCup: { type: 'number', nullable: true },
        priceUsd: { type: 'number', nullable: true },
        description: { type: 'string' },
        unit: { type: 'string' },
        stock: { type: 'boolean' },
        category: { type: 'string' },
        userEnterpriseId: { type: 'string', format: 'uuid' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @RequirePermissions(Permissions.PRODUCT_CREATE)
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ): Promise<Result<Product>> {
    return this.productService.create(createProductDto, file);
  }

   @Get()
  @RequirePermissions(Permissions.PRODUCT_VIEW)
  @ApiQuery({ type: FilterProductsDto })
  findAll(@Query() filters: FilterProductsDto): Promise<Result<{ products: Product[]; total: number }>> {
    return this.productService.findAll(filters);
  }

  @Get(':id')
  @RequirePermissions(Permissions.PRODUCT_VIEW)
  findOne(@Param('id') id: string): Promise<Result<Product>> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.PRODUCT_UPDATE)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ): Promise<Result<void>> {
    const userId = req.user.id;
    return this.productService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.PRODUCT_DELETE)
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<Result<void>> {
    const userId = req.user.id;
    return this.productService.remove(id, userId);
  }

  @Get('image/:filename')
  @RequirePermissions(Permissions.PRODUCT_VIEW)
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'uploads/products', filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      throw new NotFoundException('Imagen no encontrada');
    }
  }
}