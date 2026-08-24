// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
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
import type { CreateAitPersonDto } from '../dto/create-ait-person.dto.js';
import { AitPersonService } from '../services/ait-person.service.js';

@Controller('v1/inf/aitpeople')
@Resource('inf:ait-person')
export class AitPersonController {
  constructor(private readonly service: AitPersonService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_AIT_PERSON_CREATE', entity: 'inf.ait_person' })
  create(@Body() dto: CreateAitPersonDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_AIT_PERSON_UPDATE', entity: 'inf.ait_person' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAitPersonDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_AIT_PERSON_DELETE', entity: 'inf.ait_person' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
