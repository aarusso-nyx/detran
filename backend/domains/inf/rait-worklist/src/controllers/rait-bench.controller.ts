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
import type { CreateRaitBenchDto } from '../dto/create-rait-bench.dto.js';
import { RaitBenchService } from '../services/rait-bench.service.js';

@Controller('v1/inf/rait/benches')
@Resource('inf:rait-bench')
export class RaitBenchController {
  constructor(private readonly service: RaitBenchService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_BENCH_CREATE', entity: 'inf.rait_bench' })
  create(@Body() dto: CreateRaitBenchDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_BENCH_UPDATE', entity: 'inf.rait_bench' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitBenchDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_BENCH_DELETE', entity: 'inf.rait_bench' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
