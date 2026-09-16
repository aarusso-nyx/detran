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
import type { CreatePointsViewDto } from '../dto/create-points-view.dto.js';
import { PointsViewService } from '../services/points-view.service.js';

@Controller('v1/portal/projections/points-views')
@Resource('portal:points-view')
export class PointsViewController {
  constructor(private readonly service: PointsViewService) {}
}
