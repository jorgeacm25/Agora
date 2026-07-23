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
import { BusinessTypesService } from './business-types.service';
import { CreateBusinessTypeDto } from './dto/create-business-type.dto';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto';
import { ResponseBusinessTypeDto } from './dto/response-business-type.dto';
import { plainToInstance } from 'class-transformer';

@Controller('business-types')
export class BusinessTypesController {
  constructor(private readonly businessTypesService: BusinessTypesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createBusinessTypeDto: CreateBusinessTypeDto,
  ): Promise<ResponseBusinessTypeDto> {
    const businessType = await this.businessTypesService.create(createBusinessTypeDto);
    return plainToInstance(ResponseBusinessTypeDto, businessType, {
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
  ) {
    const result = await this.businessTypesService.findAll(page, limit, search, isActive);
    return {
      ...result,
      data: result.data.map((item) =>
        plainToInstance(ResponseBusinessTypeDto, item, {
          excludeExtraneousValues: true,
        }),
      ),
    };
  }

  @Get('active')
  async getActiveBusinessTypes(): Promise<ResponseBusinessTypeDto[]> {
    const businessTypes = await this.businessTypesService.getActiveBusinessTypes();
    return businessTypes.map((item) =>
      plainToInstance(ResponseBusinessTypeDto, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('stats')
  async getStats() {
    const [total, active, inactive, average] = await Promise.all([
      this.businessTypesService.getTotalBusinessTypes(),
      this.businessTypesService.getTotalActive(),
      this.businessTypesService.getTotalInactive(),
      this.businessTypesService.getAveragePayCant(),
    ]);

    return {
      total,
      active,
      inactive,
      averagePayCant: average,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseBusinessTypeDto> {
    const businessType = await this.businessTypesService.findOne(id);
    return plainToInstance(ResponseBusinessTypeDto, businessType, {
      excludeExtraneousValues: true,
    });
  }

  @Get('by-name/:name')
  async findByName(@Param('name') name: string): Promise<ResponseBusinessTypeDto> {
    const businessType = await this.businessTypesService.findByName(name);
    return plainToInstance(ResponseBusinessTypeDto, businessType, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBusinessTypeDto: UpdateBusinessTypeDto,
  ): Promise<ResponseBusinessTypeDto> {
    const businessType = await this.businessTypesService.update(id, updateBusinessTypeDto);
    return plainToInstance(ResponseBusinessTypeDto, businessType, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/activate')
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseBusinessTypeDto> {
    const businessType = await this.businessTypesService.restore(id);
    return plainToInstance(ResponseBusinessTypeDto, businessType, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseBusinessTypeDto> {
    const businessType = await this.businessTypesService.softDelete(id);
    return plainToInstance(ResponseBusinessTypeDto, businessType, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.businessTypesService.remove(id);
  }
}