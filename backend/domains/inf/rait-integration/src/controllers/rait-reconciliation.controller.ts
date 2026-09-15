// Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.0 sha256:ddd770d620f969774d0560bb02a8ebae3a43c42b4340a4092a1a7828963820a5
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
import type { CreateRaitReconciliationDto } from '../dto/create-rait-reconciliation.dto.js';
import { RaitReconciliationService } from '../services/rait-reconciliation.service.js';

@Controller('v1/inf/rait/reconciliations')
@Resource('inf:rait-reconciliation')
export class RaitReconciliationController {
  constructor(private readonly service: RaitReconciliationService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_RECONCILIATION_CREATE',
    entity: 'inf.rait_reconciliation',
  })
  create(@Body() dto: CreateRaitReconciliationDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_RECONCILIATION_UPDATE',
    entity: 'inf.rait_reconciliation',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitReconciliationDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_RECONCILIATION_DELETE',
    entity: 'inf.rait_reconciliation',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
