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
import type { CreateCrashAggregateDto } from '../dto/create-crash-aggregate.dto.js';
import { CrashAggregateService } from '../services/crash-aggregate.service.js';

@Controller('v1/dashboard/crashes/aggregates')
@Resource('dashboard:crash-aggregate')
export class CrashAggregateController {
  constructor(private readonly service: CrashAggregateService) {}
}
