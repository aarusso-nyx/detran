// Generated from BP-EST-CRASH-001 v1.0.0 sha256:b47af7c82f17c4a1fa3e3eefb69f476ee022559780b97f30285d2582d18c8231
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
import type { CreateCrashPersonDto } from '../dto/create-crash-person.dto.js';
import { CrashPersonService } from '../services/crash-person.service.js';

@Controller('v1/est/crash/people')
@Resource('est:crash-person')
export class CrashPersonController {
  constructor(private readonly service: CrashPersonService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'EST_CRASH_PERSON_CREATE', entity: 'est.crash_person' })
  create(@Body() dto: CreateCrashPersonDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'EST_CRASH_PERSON_UPDATE', entity: 'est.crash_person' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCrashPersonDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'EST_CRASH_PERSON_DELETE', entity: 'est.crash_person' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
