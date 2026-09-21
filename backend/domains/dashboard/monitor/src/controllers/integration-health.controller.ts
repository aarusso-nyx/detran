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
import type { CreateIntegrationHealthDto } from '../dto/create-integration-health.dto.js';
import { IntegrationHealthService } from '../services/integration-health.service.js';

@Controller('v1/dashboard/integration-health')
@Resource('dashboard:integration-health')
export class IntegrationHealthController {
  constructor(private readonly service: IntegrationHealthService) {}
}
