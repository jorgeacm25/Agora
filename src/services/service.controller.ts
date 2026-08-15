import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permissions } from '../common/permissions/permissions';
import { Result } from '../common/classes/result.class';
import { Service } from './entities/service.entity';

@ApiTags('services')
@ApiBearerAuth('access-token')
@Controller('services')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @RequirePermissions(Permissions.SERVICE_CREATE)
  create(
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<Result<Service>> {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @RequirePermissions(Permissions.SERVICE_VIEW)
  findAll(): Promise<Result<Service[]>> {
    return this.serviceService.findAll();
  }

  @Get('enterprise/:enterpriseId')
  @RequirePermissions(Permissions.SERVICE_VIEW)
  findByEnterprise(@Param('enterpriseId') enterpriseId: string): Promise<Result<Service[]>> {
    return this.serviceService.findByEnterprise(enterpriseId);
  }

  @Get(':id')
  @RequirePermissions(Permissions.SERVICE_VIEW)
  findOne(@Param('id') id: string): Promise<Result<Service>> {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.SERVICE_UPDATE)
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Req() req: any,
  ): Promise<Result<void>> {
    const userId = req.user.id;
    return this.serviceService.update(id, updateServiceDto, userId);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.SERVICE_DELETE)
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<Result<void>> {
    const userId = req.user.id;
    return this.serviceService.remove(id, userId);
  }
}