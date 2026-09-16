// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
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
import type { CreateProcessTimelineDto } from '../dto/create-process-timeline.dto.js';
import { ProcessTimelineService } from '../services/process-timeline.service.js';

@Controller('v1/portal/projections/process-timelines')
@Resource('portal:process-timeline')
export class ProcessTimelineController {
  constructor(private readonly service: ProcessTimelineService) {}
}
