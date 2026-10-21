// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
import type { CreateRaitClaimLegacyQualificationDto } from '../dto/create-rait-claim-legacy-qualification.dto.js';
import { RaitClaimLegacyQualificationService } from '../services/rait-claim-legacy-qualification.service.js';

@Controller('v1/inf/rait/internal/claim-legacy-qualification')
@Resource('inf:rait-claim-legacy-qualification')
export class RaitClaimLegacyQualificationController {
  constructor(private readonly service: RaitClaimLegacyQualificationService) {}
}
