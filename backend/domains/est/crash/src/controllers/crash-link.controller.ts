// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
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
import type { CreateCrashLinkDto } from '../dto/create-crash-link.dto.js';
import { CrashLinkService } from '../services/crash-link.service.js';

@Controller('v1/est/crash/links')
@Resource('est:crash-link')
export class CrashLinkController {
  constructor(private readonly service: CrashLinkService) {}
}
