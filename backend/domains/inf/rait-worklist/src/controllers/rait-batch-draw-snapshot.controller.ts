// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
import type { CreateRaitBatchDrawSnapshotDto } from '../dto/create-rait-batch-draw-snapshot.dto.js';
import { RaitBatchDrawSnapshotService } from '../services/rait-batch-draw-snapshot.service.js';

@Controller('v1/inf/rait/batch-draw-snapshots')
@Resource('inf:rait-batch-draw-snapshot')
export class RaitBatchDrawSnapshotController {
  constructor(private readonly service: RaitBatchDrawSnapshotService) {}
}
