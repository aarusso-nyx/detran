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
import type { CreateRaitScheduleSlotDto } from '../dto/create-rait-schedule-slot.dto.js';
import { RaitScheduleSlotService } from '../services/rait-schedule-slot.service.js';

@Controller('v1/inf/rait/schedule-slots')
@Resource('inf:rait-schedule-slot')
export class RaitScheduleSlotController {
  constructor(private readonly service: RaitScheduleSlotService) {}
}
