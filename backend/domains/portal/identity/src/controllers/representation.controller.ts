// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
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
import type { CreateRepresentationDto } from '../dto/create-representation.dto.js';
import { RepresentationService } from '../services/representation.service.js';

@Controller('v1/portal/identity/representations')
@Resource('portal:representation')
export class RepresentationController {
  constructor(private readonly service: RepresentationService) {}
}
