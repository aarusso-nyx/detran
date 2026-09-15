// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import type { CreateTowProviderDto } from '../dto/create-tow-provider.dto.js';
import { TowProviderService } from '../services/tow-provider.service.js';

@Controller('v1/inf/measures/tow-providers')
@Resource('inf:tow-provider')
export class TowProviderController {
  constructor(private readonly service: TowProviderService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_TOW_PROVIDER_CREATE', entity: 'inf.tow_provider' })
  create(@Body() dto: CreateTowProviderDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_TOW_PROVIDER_UPDATE', entity: 'inf.tow_provider' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateTowProviderDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_TOW_PROVIDER_DELETE', entity: 'inf.tow_provider' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
