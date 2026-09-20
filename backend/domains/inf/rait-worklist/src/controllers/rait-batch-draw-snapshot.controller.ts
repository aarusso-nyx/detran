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
import type { CreateRaitBatchDrawSnapshotDto } from '../dto/create-rait-batch-draw-snapshot.dto.js';
import { RaitBatchDrawSnapshotService } from '../services/rait-batch-draw-snapshot.service.js';

@Controller('v1/inf/rait/batch-draw-snapshots')
@Resource('inf:rait-batch-draw-snapshot')
export class RaitBatchDrawSnapshotController {
  constructor(private readonly service: RaitBatchDrawSnapshotService) {}
}
