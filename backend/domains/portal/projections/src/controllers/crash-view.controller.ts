// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
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
import type { CreateCrashViewDto } from '../dto/create-crash-view.dto.js';
import { CrashViewService } from '../services/crash-view.service.js';

@Controller('v1/portal/projections/crash-views')
@Resource('portal:crash-view')
export class CrashViewController {
  constructor(private readonly service: CrashViewService) {}
}
