// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
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
