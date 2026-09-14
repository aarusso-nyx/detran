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
import type { CreateRaitBatchDto } from '../dto/create-rait-batch.dto.js';
import { RaitBatchService } from '../services/rait-batch.service.js';

@Controller('v1/inf/rait/batches')
@Resource('inf:rait-batch')
export class RaitBatchController {
  constructor(private readonly service: RaitBatchService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_BATCH_CREATE', entity: 'inf.rait_batch' })
  create(@Body() dto: CreateRaitBatchDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_BATCH_UPDATE', entity: 'inf.rait_batch' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitBatchDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_BATCH_DELETE', entity: 'inf.rait_batch' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
