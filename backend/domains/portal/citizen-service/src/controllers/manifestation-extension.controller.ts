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
import type { CreateManifestationExtensionDto } from '../dto/create-manifestation-extension.dto.js';
import { ManifestationExtensionService } from '../services/manifestation-extension.service.js';

@Controller('v1/portal/citizen-service/manifestation-extensions')
@Resource('portal:manifestation-extension')
export class ManifestationExtensionController {
  constructor(private readonly service: ManifestationExtensionService) {}
}
