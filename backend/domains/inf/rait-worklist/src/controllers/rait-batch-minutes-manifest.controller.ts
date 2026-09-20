// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
import type { CreateRaitBatchMinutesManifestDto } from '../dto/create-rait-batch-minutes-manifest.dto.js';
import { RaitBatchMinutesManifestService } from '../services/rait-batch-minutes-manifest.service.js';

@Controller('v1/inf/rait/batch-minutes-manifests')
@Resource('inf:rait-batch-minutes-manifest')
export class RaitBatchMinutesManifestController {
  constructor(private readonly service: RaitBatchMinutesManifestService) {}
}
