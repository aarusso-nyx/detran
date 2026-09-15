// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
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
import type { CreateNormativeMetrologicalTableDto } from '../dto/create-normative-metrological-table.dto.js';
import { NormativeMetrologicalTableService } from '../services/normative-metrological-table.service.js';

@Controller('v1/inf/normative/metrological-tables')
@Resource('inf:normative-metrological-table')
export class NormativeMetrologicalTableController {
  constructor(private readonly service: NormativeMetrologicalTableService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_NORMATIVE_METROLOGICAL_TABLE_CREATE',
    entity: 'inf.normative_metrological_table',
  })
  create(@Body() dto: CreateNormativeMetrologicalTableDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_NORMATIVE_METROLOGICAL_TABLE_UPDATE',
    entity: 'inf.normative_metrological_table',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateNormativeMetrologicalTableDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_NORMATIVE_METROLOGICAL_TABLE_DELETE',
    entity: 'inf.normative_metrological_table',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
