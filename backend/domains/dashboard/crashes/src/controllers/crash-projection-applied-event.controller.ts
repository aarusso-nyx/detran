// Generated from BP-DASHBOARD-CRASHES-001 v1.0.0 sha256:45f272c2e89a665bb7a2cfecc671d0b26d136439df8f239f51adf116bd65b241
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
import type { CreateCrashProjectionAppliedEventDto } from '../dto/create-crash-projection-applied-event.dto.js';
import { CrashProjectionAppliedEventService } from '../services/crash-projection-applied-event.service.js';

@Controller('v1/dashboard/crashes/applied-events')
@Resource('dashboard:crash-projection-applied-event')
export class CrashProjectionAppliedEventController {
  constructor(private readonly service: CrashProjectionAppliedEventService) {}
}
