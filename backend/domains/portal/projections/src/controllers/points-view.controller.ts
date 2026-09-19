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
import type { CreatePointsViewDto } from '../dto/create-points-view.dto.js';
import { PointsViewService } from '../services/points-view.service.js';

@Controller('v1/portal/projections/points-views')
@Resource('portal:points-view')
export class PointsViewController {
  constructor(private readonly service: PointsViewService) {}
}
