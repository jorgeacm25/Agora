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
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { ResponseBusinessDto } from './dto/response-business.dto';
import { plainToInstance } from 'class-transformer';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
  ): Promise<ResponseBusinessDto> {
    const business = await this.businessService.create(createBusinessDto);
    return plainToInstance(ResponseBusinessDto, business, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('isActive', new DefaultValuePipe(undefined), new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
    @Query('businessTypeId') businessTypeId?: string,
  ) {
    const result = await this.businessService.findAll(
      page,
      limit,
      search,
      isActive,
      businessTypeId,
    );
    return {
      ...result,
      data: result.data.map((item) =>
        plainToInstance(ResponseBusinessDto, item, {
          excludeExtraneousValues: true,
        }),
      ),
    };
  }

  @Get('active')
  async getActiveBusinesses(): Promise<ResponseBusinessDto[]> {
    const businesses = await this.businessService.getActiveBusinesses();
    return businesses.map((item) =>
      plainToInstance(ResponseBusinessDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('recent')
  async getRecent(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ): Promise<ResponseBusinessDto[]> {
    const businesses = await this.businessService.getRecentBusinesses(limit);
    return businesses.map((item) =>
      plainToInstance(ResponseBusinessDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('stats')
  async getStats() {
    const [total, active, inactive, byType] = await Promise.all([
      this.businessService.getTotalBusinesses(),
      this.businessService.getTotalActive(),
      this.businessService.getTotalInactive(),
      this.businessService.getBusinessesByType(),
    ]);

    return {
      total,
      active,
      inactive,
      byType,
    };
  }

  @Get('by-type/:businessTypeId')
  async findByBusinessType(
    @Param('businessTypeId', ParseUUIDPipe) businessTypeId: string,
  ): Promise<ResponseBusinessDto[]> {
    const businesses = await this.businessService.findByBusinessType(businessTypeId);
    return businesses.map((item) =>
      plainToInstance(ResponseBusinessDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseBusinessDto> {
    const business = await this.businessService.findOne(id);
    return plainToInstance(ResponseBusinessDto, business, {
      excludeExtraneousValues: true,
    });
  }

  @Get('search/:name')
  async findByName(@Param('name') name: string): Promise<ResponseBusinessDto[]> {
    const businesses = await this.businessService.findByName(name);
    return businesses.map((item) =>
      plainToInstance(ResponseBusinessDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ): Promise<ResponseBusinessDto> {
    const business = await this.businessService.update(id, updateBusinessDto);
    return plainToInstance(ResponseBusinessDto, business, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/activate')
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseBusinessDto> {
    const business = await this.businessService.restore(id);
    return plainToInstance(ResponseBusinessDto, business, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseBusinessDto> {
    const business = await this.businessService.softDelete(id);
    return plainToInstance(ResponseBusinessDto, business, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.businessService.remove(id);
  }
}