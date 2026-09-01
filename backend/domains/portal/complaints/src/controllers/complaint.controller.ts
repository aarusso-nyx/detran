// Generated from BP-PORTAL-COMPLAINTS-001 v1.0.0 sha256:8c3bc3ce59e94126c71a50e9fad090538fbbb36536ce8c56fca3e2c64e93b60c
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
import type { CreateComplaintDto } from '../dto/create-complaint.dto.js';
import { ComplaintService } from '../services/complaint.service.js';

@Controller('v1/portal/complaints/records')
@Resource('portal:complaint')
export class ComplaintController {
  constructor(private readonly service: ComplaintService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
