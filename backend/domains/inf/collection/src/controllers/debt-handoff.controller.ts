// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:72e0af13a687dd9bcaa3931941707644a2214b4ece8daa63d55712fee4ad0243
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
import type { CreateDebtHandoffDto } from '../dto/create-debt-handoff.dto.js';
import { DebtHandoffService } from '../services/debt-handoff.service.js';

@Controller('v1/inf/collection/debt-handoffs')
@Resource('inf:debt-handoff')
export class DebtHandoffController {
  constructor(private readonly service: DebtHandoffService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_DEBT_HANDOFF_CREATE', entity: 'inf.debt_handoff' })
  create(@Body() dto: CreateDebtHandoffDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_DEBT_HANDOFF_UPDATE', entity: 'inf.debt_handoff' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateDebtHandoffDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_DEBT_HANDOFF_DELETE', entity: 'inf.debt_handoff' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
