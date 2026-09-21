// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
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
import type { CreateDeviceKeyDto } from '../dto/create-device-key.dto.js';
import { DeviceKeyService } from '../services/device-key.service.js';

@Controller('v1/ops/provisioning/device-keys')
@Resource('ops:device-key')
export class DeviceKeyController {
  constructor(private readonly service: DeviceKeyService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
