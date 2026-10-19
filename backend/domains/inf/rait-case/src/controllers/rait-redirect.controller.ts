// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
import type { CreateRaitRedirectDto } from '../dto/create-rait-redirect.dto.js';
import { RaitRedirectService } from '../services/rait-redirect.service.js';

@Controller('v1/inf/rait/redirects')
@Resource('inf:rait-redirect')
export class RaitRedirectController {
  constructor(private readonly service: RaitRedirectService) {}
}
