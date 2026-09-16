// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
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
import type { CreateSneEnrollmentDto } from '../dto/create-sne-enrollment.dto.js';
import { SneEnrollmentService } from '../services/sne-enrollment.service.js';

@Controller('v1/portal/inbox/sne-enrollments')
@Resource('portal:sne-enrollment')
export class SneEnrollmentController {
  constructor(private readonly service: SneEnrollmentService) {}
}
