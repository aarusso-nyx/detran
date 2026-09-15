// Generated from BP-OPS-OFFLINE-SYNC-001 v1.2.0 sha256:caa6ee5fb47a5169864e22d9763e35d774009a12ac8d550129bacf8d39ac2cac
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
import type { CreateSyncConflictDto } from '../dto/create-sync-conflict.dto.js';
import { SyncConflictService } from '../services/sync-conflict.service.js';

@Controller('v1/ops/offline-sync/sync-conflicts')
@Resource('ops:sync-conflict')
export class SyncConflictController {
  constructor(private readonly service: SyncConflictService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_SYNC_CONFLICT_CREATE', entity: 'ops.sync_conflict' })
  create(@Body() dto: CreateSyncConflictDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_SYNC_CONFLICT_UPDATE', entity: 'ops.sync_conflict' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateSyncConflictDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_SYNC_CONFLICT_DELETE', entity: 'ops.sync_conflict' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
