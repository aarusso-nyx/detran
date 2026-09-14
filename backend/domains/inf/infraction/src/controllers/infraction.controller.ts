// Generated from BP-INF-INFRACTION-001 v1.1.1 sha256:c9e1dec5067f8324003780a279b646761b2298bf7712019b3023acdf50746e4c
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
import type { CreateInfractionDto } from '../dto/create-infraction.dto.js';
import { InfractionService } from '../services/infraction.service.js';

@Controller('v1/inf/infraction/infractions')
@Resource('inf:infraction')
export class InfractionController {
  constructor(private readonly service: InfractionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_INFRACTION_CREATE', entity: 'inf.infraction' })
  create(@Body() dto: CreateInfractionDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_INFRACTION_UPDATE', entity: 'inf.infraction' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateInfractionDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_INFRACTION_DELETE', entity: 'inf.infraction' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
