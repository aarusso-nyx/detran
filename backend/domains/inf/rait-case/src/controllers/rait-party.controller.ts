// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
import type { CreateRaitPartyDto } from '../dto/create-rait-party.dto.js';
import { RaitPartyService } from '../services/rait-party.service.js';

@Controller('v1/inf/rait/parties')
@Resource('inf:rait-party')
export class RaitPartyController {
  constructor(private readonly service: RaitPartyService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_PARTY_CREATE', entity: 'inf.rait_party' })
  create(@Body() dto: CreateRaitPartyDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_PARTY_UPDATE', entity: 'inf.rait_party' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitPartyDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_PARTY_DELETE', entity: 'inf.rait_party' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
