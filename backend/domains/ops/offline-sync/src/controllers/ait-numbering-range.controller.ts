// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:060a1bba7bd902d60194a1ee2fe169a4b0972602bd54e5330083d9c518641e52
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
import type { CreateAitNumberingRangeDto } from '../dto/create-ait-numbering-range.dto.js';
import { AitNumberingRangeService } from '../services/ait-numbering-range.service.js';

@Controller('v1/ops/offline-sync/numbering-ranges')
@Resource('ops:numbering-range')
export class AitNumberingRangeController {
  constructor(private readonly service: AitNumberingRangeService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_AIT_NUMBERING_RANGE_CREATE',
    entity: 'ops.ait_numbering_range',
  })
  create(@Body() dto: CreateAitNumberingRangeDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_AIT_NUMBERING_RANGE_UPDATE',
    entity: 'ops.ait_numbering_range',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAitNumberingRangeDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_AIT_NUMBERING_RANGE_DELETE',
    entity: 'ops.ait_numbering_range',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
