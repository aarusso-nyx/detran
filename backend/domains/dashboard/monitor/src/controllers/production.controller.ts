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
import type { CreateProductionDto } from '../dto/create-production.dto.js';
import { ProductionService } from '../services/production.service.js';

@Controller('v1/dashboard/production')
@Resource('dashboard:production')
export class ProductionController {
  constructor(private readonly service: ProductionService) {}
}
