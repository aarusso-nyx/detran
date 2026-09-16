// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:be057438a0ae6bba679549fa27603002919b4035701f4ea81d9ed853b9c00734
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
import type { CreatePersonDto } from '../dto/create-person.dto.js';
import { PersonService } from '../services/person.service.js';

@Controller('v1/ops/snapshots/people')
@Resource('ops:person')
export class PersonController {
  constructor(private readonly service: PersonService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_SNAPSHOTS_PERSON_CREATE',
    entity: 'ops.snapshots_person',
  })
  create(@Body() dto: CreatePersonDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_SNAPSHOTS_PERSON_UPDATE',
    entity: 'ops.snapshots_person',
  })
  update(@Param('id') id: string, @Body() dto: Partial<CreatePersonDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_SNAPSHOTS_PERSON_DELETE',
    entity: 'ops.snapshots_person',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
