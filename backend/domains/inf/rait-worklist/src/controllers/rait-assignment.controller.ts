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
import type { CreateRaitAssignmentDto } from '../dto/create-rait-assignment.dto.js';
import { RaitAssignmentService } from '../services/rait-assignment.service.js';

@Controller('v1/inf/rait/assignments')
@Resource('inf:rait-assignment')
export class RaitAssignmentController {
  constructor(private readonly service: RaitAssignmentService) {}
}
