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
import type { CreateProjectionAppliedEventDto } from '../dto/create-projection-applied-event.dto.js';
import { ProjectionAppliedEventService } from '../services/projection-applied-event.service.js';

@Controller('v1/portal/projections/applied-events')
@Resource('portal:projection-applied-event')
export class ProjectionAppliedEventController {
  constructor(private readonly service: ProjectionAppliedEventService) {}
}
