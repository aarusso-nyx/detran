// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
import type { CreateRaitPoolDto } from '../dto/create-rait-pool.dto.js';
import { RaitPoolService } from '../services/rait-pool.service.js';

@Controller('v1/inf/rait/pools')
@Resource('inf:rait-pool')
export class RaitPoolController {
  constructor(private readonly service: RaitPoolService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_POOL_CREATE', entity: 'inf.rait_pool' })
  create(@Body() dto: CreateRaitPoolDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_POOL_UPDATE', entity: 'inf.rait_pool' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitPoolDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_POOL_DELETE', entity: 'inf.rait_pool' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
