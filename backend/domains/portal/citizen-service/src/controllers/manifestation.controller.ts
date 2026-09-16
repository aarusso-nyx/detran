// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.0 sha256:adb8933e9c3c31077273c68bff12efa5e0bfefa8843cdc29798c6d43fa63a246
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
import type { CreateManifestationDto } from '../dto/create-manifestation.dto.js';
import { ManifestationService } from '../services/manifestation.service.js';

@Controller('v1/portal/citizen-service/manifestations')
@Resource('portal:manifestation')
export class ManifestationController {
  constructor(private readonly service: ManifestationService) {}
}
