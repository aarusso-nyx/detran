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
import type { CreateOfflineAuthorizationGrantDto } from '../dto/create-offline-authorization-grant.dto.js';
import { OfflineAuthorizationGrantService } from '../services/offline-authorization-grant.service.js';

@Controller('v1/ops/provisioning/grants')
@Resource('ops:grant')
export class OfflineAuthorizationGrantController {
  constructor(private readonly service: OfflineAuthorizationGrantService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
