// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
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
import type { CreateStorageIntentDto } from '../dto/create-storage-intent.dto.js';
import { StorageIntentService } from '../services/storage-intent.service.js';

@Controller('v1/ops/evidence/storage-intents')
@Resource('ops:storage-intent')
export class StorageIntentController {
  constructor(private readonly service: StorageIntentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_STORAGE_INTENT_CREATE', entity: 'ops.storage_intent' })
  create(@Body() dto: CreateStorageIntentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_STORAGE_INTENT_UPDATE', entity: 'ops.storage_intent' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateStorageIntentDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_STORAGE_INTENT_DELETE', entity: 'ops.storage_intent' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
