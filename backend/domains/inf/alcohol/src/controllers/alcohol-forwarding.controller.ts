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
import type { CreateAlcoholForwardingDto } from '../dto/create-alcohol-forwarding.dto.js';
import { AlcoholForwardingService } from '../services/alcohol-forwarding.service.js';

@Controller('v1/inf/alcohol/forwardings')
@Resource('inf:alcohol-forwarding')
export class AlcoholForwardingController {
  constructor(private readonly service: AlcoholForwardingService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_ALCOHOL_FORWARDING_CREATE',
    entity: 'inf.alcohol_forwarding',
  })
  create(@Body() dto: CreateAlcoholForwardingDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_ALCOHOL_FORWARDING_UPDATE',
    entity: 'inf.alcohol_forwarding',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAlcoholForwardingDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_ALCOHOL_FORWARDING_DELETE',
    entity: 'inf.alcohol_forwarding',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
