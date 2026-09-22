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
import type { CreateDutyDto } from '../dto/create-duty.dto.js';
import { DutyService } from '../services/duty.service.js';

@Controller('v1/dashboard/duties')
@Resource('dashboard:duty')
export class DutyController {
  constructor(private readonly service: DutyService) {}
}
