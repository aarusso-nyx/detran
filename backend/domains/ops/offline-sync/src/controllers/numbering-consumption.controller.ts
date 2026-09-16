// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
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
import type { CreateNumberingConsumptionDto } from '../dto/create-numbering-consumption.dto.js';
import { NumberingConsumptionService } from '../services/numbering-consumption.service.js';

@Controller('v1/ops/offline-sync/numbering-consumptions')
@Resource('ops:numbering-consumption')
export class NumberingConsumptionController {
  constructor(private readonly service: NumberingConsumptionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_NUMBERING_CONSUMPTION_CREATE',
    entity: 'ops.numbering_consumption',
  })
  create(@Body() dto: CreateNumberingConsumptionDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_NUMBERING_CONSUMPTION_UPDATE',
    entity: 'ops.numbering_consumption',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateNumberingConsumptionDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_NUMBERING_CONSUMPTION_DELETE',
    entity: 'ops.numbering_consumption',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
