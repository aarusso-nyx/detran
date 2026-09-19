// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1 sha256:81c05ec48ec8ab36465ae1b250c4a59f59931b99835bfd1ef52f3b10520f9029
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
import type { CreateServiceCatalogDto } from '../dto/create-service-catalog.dto.js';
import { ServiceCatalogService } from '../services/service-catalog.service.js';

@Controller('v1/portal/citizen-service/services')
@Resource('portal:service-charter')
export class ServiceCatalogController {
  constructor(private readonly service: ServiceCatalogService) {}
}
