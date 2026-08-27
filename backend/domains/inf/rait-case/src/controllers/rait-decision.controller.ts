// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
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
import type { CreateRaitDecisionDto } from '../dto/create-rait-decision.dto.js';
import { RaitDecisionService } from '../services/rait-decision.service.js';

@Controller('v1/inf/raitdecisions')
@Resource('inf:rait-decision')
export class RaitDecisionController {
  constructor(private readonly service: RaitDecisionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_DECISION_CREATE', entity: 'inf.rait_decision' })
  create(@Body() dto: CreateRaitDecisionDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_DECISION_UPDATE', entity: 'inf.rait_decision' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitDecisionDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_DECISION_DELETE', entity: 'inf.rait_decision' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
