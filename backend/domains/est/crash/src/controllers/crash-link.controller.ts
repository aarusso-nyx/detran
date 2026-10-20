// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
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
