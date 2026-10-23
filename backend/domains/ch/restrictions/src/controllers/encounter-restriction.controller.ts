// Generated from BP-CH-RESTRICTIONS-001 v1.0.0 sha256:05527c0aea012ece64e79955246e666899d444700b824e484f1800ff151769bf
import { Controller, Get, Param } from '@nestjs/common';
import { Action, Resource } from '@detran/shared';
import { EncounterRestrictionService } from '../services/encounter-restriction.service.js';

@Controller('v1/ch/restrictions/applied')
@Resource('ch:restriction')
export class EncounterRestrictionController {
  constructor(private readonly service: EncounterRestrictionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
