// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
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
import type { CreateRaitCapacityPlanDto } from '../dto/create-rait-capacity-plan.dto.js';
import { RaitCapacityPlanService } from '../services/rait-capacity-plan.service.js';

@Controller('v1/inf/rait/capacity-plans')
@Resource('inf:rait-capacity-plan')
export class RaitCapacityPlanController {
  constructor(private readonly service: RaitCapacityPlanService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_CAPACITY_PLAN_CREATE',
    entity: 'inf.rait_capacity_plan',
  })
  create(@Body() dto: CreateRaitCapacityPlanDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_CAPACITY_PLAN_UPDATE',
    entity: 'inf.rait_capacity_plan',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitCapacityPlanDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_CAPACITY_PLAN_DELETE',
    entity: 'inf.rait_capacity_plan',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
