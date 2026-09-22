// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
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
import type { CreateProvisioningPackageDto } from '../dto/create-provisioning-package.dto.js';
import { ProvisioningPackageService } from '../services/provisioning-package.service.js';

@Controller('v1/ops/provisioning/packages')
@Resource('ops:package')
export class ProvisioningPackageController {
  constructor(private readonly service: ProvisioningPackageService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
