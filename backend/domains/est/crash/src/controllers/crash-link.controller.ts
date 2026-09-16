// Generated from BP-EST-CRASH-001 v1.0.0 sha256:b47af7c82f17c4a1fa3e3eefb69f476ee022559780b97f30285d2582d18c8231
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
