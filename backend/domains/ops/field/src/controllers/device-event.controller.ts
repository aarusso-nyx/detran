// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
import type { CreateDeviceEventDto } from '../dto/create-device-event.dto.js';
import { DeviceEventService } from '../services/device-event.service.js';

@Controller('v1/ops/field/device-events')
@Resource('ops:device-event')
export class DeviceEventController {
  constructor(private readonly service: DeviceEventService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_OPS_DEVICE_EVENT_CREATE',
    entity: 'ops.ops_device_event',
  })
  create(@Body() dto: CreateDeviceEventDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_OPS_DEVICE_EVENT_UPDATE',
    entity: 'ops.ops_device_event',
  })
  update(@Param('id') id: string, @Body() dto: Partial<CreateDeviceEventDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_OPS_DEVICE_EVENT_DELETE',
    entity: 'ops.ops_device_event',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
