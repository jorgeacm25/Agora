import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
  ValidationPipe,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseProductDto } from './dto/response-product.dto';
import { plainToInstance } from 'class-transformer';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseProductDto> {
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Tipo de archivo no permitido. Use: JPEG, PNG, GIF o WEBP',
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException(
          'El archivo no puede superar los 5MB',
        );
      }
    }

    const product = await this.productService.create(createProductDto, file);
    return plainToInstance(ResponseProductDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('available', new DefaultValuePipe(undefined), new ParseBoolPipe({ optional: true }))
    available?: boolean,
    @Query('businessId') businessId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const result = await this.productService.findAll(
      page,
      limit,
      search,
      available,
      businessId,
      minPrice ? parseFloat(minPrice) : undefined,
      maxPrice ? parseFloat(maxPrice) : undefined,
    );
    return {
      ...result,
      data: result.data.map((item) =>
        plainToInstance(ResponseProductDto, item, {
          excludeExtraneousValues: true,
        }),
      ),
    };
  }

  @Get('available')
  async getAvailableProducts(): Promise<ResponseProductDto[]> {
    const result = await this.productService.findAll(1, 100, undefined, true);
    return result.data.map((item) =>
      plainToInstance(ResponseProductDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('low-stock')
  async getLowStock(
    @Query('threshold', new DefaultValuePipe(5), ParseIntPipe) threshold: number,
  ): Promise<ResponseProductDto[]> {
    const products = await this.productService.getLowStockProducts(threshold);
    return products.map((item) =>
      plainToInstance(ResponseProductDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('stats')
  async getStats() {
    return await this.productService.getProductStats();
  }

  @Get('by-business/:businessId')
  async findByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ): Promise<ResponseProductDto[]> {
    const products = await this.productService.findByBusiness(businessId);
    return products.map((item) =>
      plainToInstance(ResponseProductDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('by-business-type/:businessTypeId')
  async findByBusinessType(
    @Param('businessTypeId', ParseUUIDPipe) businessTypeId: string,
  ): Promise<ResponseProductDto[]> {
    const products = await this.productService.getProductsByBusinessType(
      businessTypeId,
    );
    return products.map((item) =>
      plainToInstance(ResponseProductDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseProductDto> {
    const product = await this.productService.findOne(id);
    return plainToInstance(ResponseProductDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Get('search/:name')
  async findByName(@Param('name') name: string): Promise<ResponseProductDto[]> {
    const products = await this.productService.findByName(name);
    return products.map((item) =>
      plainToInstance(ResponseProductDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseProductDto> {
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Tipo de archivo no permitido. Use: JPEG, PNG, GIF o WEBP',
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException(
          'El archivo no puede superar los 5MB',
        );
      }
    }

    const product = await this.productService.update(id, updateProductDto, file);
    return plainToInstance(ResponseProductDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('stock', ParseIntPipe) stock: number,
  ): Promise<ResponseProductDto> {
    const product = await this.productService.updateStock(id, stock);
    return plainToInstance(ResponseProductDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/increase-stock')
  async increaseStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<ResponseProductDto> {
    const product = await this.productService.increaseStock(id, quantity);
    return plainToInstance(ResponseProductDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/decrease-stock')
  async decreaseStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<ResponseProductDto> {
    const product = await this.productService.decreaseStock(id, quantity);
    return plainToInstance(ResponseProductDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/activate')
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseProductDto> {
    const product = await this.productService.restore(id);
    return plainToInstance(ResponseProductDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseProductDto> {
    const product = await this.productService.softDelete(id);
    return plainToInstance(ResponseProductDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productService.remove(id);
  }
}