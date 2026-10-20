// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
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
import type { CreateCrashRecordDto } from '../dto/create-crash-record.dto.js';
import { CrashRecordService } from '../services/crash-record.service.js';

@Controller('v1/est/crash/records')
@Resource('est:crash-record')
export class CrashRecordController {
  constructor(private readonly service: CrashRecordService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'EST_CRASH_RECORD_CREATE', entity: 'est.crash_record' })
  create(@Body() dto: CreateCrashRecordDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'EST_CRASH_RECORD_UPDATE', entity: 'est.crash_record' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCrashRecordDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'EST_CRASH_RECORD_DELETE', entity: 'est.crash_record' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
