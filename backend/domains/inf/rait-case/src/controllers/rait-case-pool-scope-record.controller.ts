// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
import type { CreateRaitCasePoolScopeRecordDto } from '../dto/create-rait-case-pool-scope-record.dto.js';
import { RaitCasePoolScopeRecordService } from '../services/rait-case-pool-scope-record.service.js';

@Controller('v1/inf/rait/rait-case-pool-scope-record')
@Resource('inf:rait-case-pool-scope-record')
export class RaitCasePoolScopeRecordController {
  constructor(private readonly service: RaitCasePoolScopeRecordService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_CASE_POOL_SCOPE_CREATE',
    entity: 'inf.rait_case_pool_scope',
  })
  create(@Body() dto: CreateRaitCasePoolScopeRecordDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_CASE_POOL_SCOPE_UPDATE',
    entity: 'inf.rait_case_pool_scope',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitCasePoolScopeRecordDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_CASE_POOL_SCOPE_DELETE',
    entity: 'inf.rait_case_pool_scope',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
