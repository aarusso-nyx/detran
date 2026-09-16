// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
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
