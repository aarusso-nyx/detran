// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
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
import type { CreateProbativePackageItemDto } from '../dto/create-probative-package-item.dto.js';
import { ProbativePackageItemService } from '../services/probative-package-item.service.js';

@Controller('v1/ops/evidence/probative-package-items')
@Resource('ops:probative-package-item')
export class ProbativePackageItemController {
  constructor(private readonly service: ProbativePackageItemService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_EVIDENCE_PROBATIVE_PACKAGE_ITEM_CREATE',
    entity: 'ops.evidence_probative_package_item',
  })
  create(@Body() dto: CreateProbativePackageItemDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_EVIDENCE_PROBATIVE_PACKAGE_ITEM_UPDATE',
    entity: 'ops.evidence_probative_package_item',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProbativePackageItemDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_EVIDENCE_PROBATIVE_PACKAGE_ITEM_DELETE',
    entity: 'ops.evidence_probative_package_item',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
