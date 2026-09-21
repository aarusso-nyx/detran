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
import type { CreateDeviceRevocationDto } from '../dto/create-device-revocation.dto.js';
import { DeviceRevocationService } from '../services/device-revocation.service.js';

@Controller('v1/ops/provisioning/device-revocations')
@Resource('ops:device-revocation')
export class DeviceRevocationController {
  constructor(private readonly service: DeviceRevocationService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
