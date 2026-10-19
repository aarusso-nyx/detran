// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
import type { CreateRaitCaseEventDto } from '../dto/create-rait-case-event.dto.js';
import { RaitCaseEventService } from '../services/rait-case-event.service.js';

@Controller('v1/inf/rait/events')
@Resource('inf:rait-case-event')
export class RaitCaseEventController {
  constructor(private readonly service: RaitCaseEventService) {}
}
