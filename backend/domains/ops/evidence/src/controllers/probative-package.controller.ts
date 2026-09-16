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
import type { CreateProbativePackageDto } from '../dto/create-probative-package.dto.js';
import { ProbativePackageService } from '../services/probative-package.service.js';

@Controller('v1/ops/evidence/probative-packages')
@Resource('ops:probative-package')
export class ProbativePackageController {
  constructor(private readonly service: ProbativePackageService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_EVIDENCE_PROBATIVE_PACKAGE_CREATE',
    entity: 'ops.evidence_probative_package',
  })
  create(@Body() dto: CreateProbativePackageDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_EVIDENCE_PROBATIVE_PACKAGE_UPDATE',
    entity: 'ops.evidence_probative_package',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProbativePackageDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_EVIDENCE_PROBATIVE_PACKAGE_DELETE',
    entity: 'ops.evidence_probative_package',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
