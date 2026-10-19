// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
import type { CreateRaitScheduleDto } from '../dto/create-rait-schedule.dto.js';
import { RaitScheduleService } from '../services/rait-schedule.service.js';

@Controller('v1/inf/rait/schedules')
@Resource('inf:rait-schedule')
export class RaitScheduleController {
  constructor(private readonly service: RaitScheduleService) {}
}
