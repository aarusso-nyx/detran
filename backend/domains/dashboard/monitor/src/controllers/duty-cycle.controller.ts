// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
