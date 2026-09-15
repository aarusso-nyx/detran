// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
import type { CreateOperationalDeviceDto } from '../dto/create-operational-device.dto.js';
import { OperationalDeviceService } from '../services/operational-device.service.js';

@Controller('v1/ops/field/devices')
@Resource('ops:operational-device')
export class OperationalDeviceController {
  constructor(private readonly service: OperationalDeviceService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_OPS_OPERATIONAL_DEVICE_CREATE',
    entity: 'ops.ops_operational_device',
  })
  create(@Body() dto: CreateOperationalDeviceDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_OPS_OPERATIONAL_DEVICE_UPDATE',
    entity: 'ops.ops_operational_device',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOperationalDeviceDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_OPS_OPERATIONAL_DEVICE_DELETE',
    entity: 'ops.ops_operational_device',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
