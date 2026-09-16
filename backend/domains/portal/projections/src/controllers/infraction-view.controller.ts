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
import type { CreateInfractionViewDto } from '../dto/create-infraction-view.dto.js';
import { InfractionViewService } from '../services/infraction-view.service.js';

@Controller('v1/portal/projections/infraction-views')
@Resource('portal:infraction-view')
export class InfractionViewController {
  constructor(private readonly service: InfractionViewService) {}
}
