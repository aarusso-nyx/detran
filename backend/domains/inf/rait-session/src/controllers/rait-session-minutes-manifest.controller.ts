// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
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
import type { CreateRaitSessionMinutesManifestDto } from '../dto/create-rait-session-minutes-manifest.dto.js';
import { RaitSessionMinutesManifestService } from '../services/rait-session-minutes-manifest.service.js';

@Controller('v1/inf/rait/session-minutes-manifests')
@Resource('inf:rait-session-minutes-manifest')
export class RaitSessionMinutesManifestController {
  constructor(private readonly service: RaitSessionMinutesManifestService) {}
}
