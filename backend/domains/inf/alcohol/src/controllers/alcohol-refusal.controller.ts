// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
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
import type { CreateAlcoholRefusalDto } from '../dto/create-alcohol-refusal.dto.js';
import { AlcoholRefusalService } from '../services/alcohol-refusal.service.js';

@Controller('v1/inf/alcohol/refusals')
@Resource('inf:alcohol-refusal')
export class AlcoholRefusalController {
  constructor(private readonly service: AlcoholRefusalService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_ALCOHOL_REFUSAL_CREATE',
    entity: 'inf.alcohol_refusal',
  })
  create(@Body() dto: CreateAlcoholRefusalDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_ALCOHOL_REFUSAL_UPDATE',
    entity: 'inf.alcohol_refusal',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAlcoholRefusalDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_ALCOHOL_REFUSAL_DELETE',
    entity: 'inf.alcohol_refusal',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
