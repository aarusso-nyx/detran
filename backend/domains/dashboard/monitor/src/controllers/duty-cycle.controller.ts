// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
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
import type { CreateDutyCycleDto } from '../dto/create-duty-cycle.dto.js';
import { DutyCycleService } from '../services/duty-cycle.service.js';

@Controller('v1/dashboard/duty-cycles')
@Resource('dashboard:duty-cycle')
export class DutyCycleController {
  constructor(private readonly service: DutyCycleService) {}
}
