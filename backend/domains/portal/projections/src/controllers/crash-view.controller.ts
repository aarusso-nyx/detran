// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
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
