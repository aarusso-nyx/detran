// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
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
import type { CreateRaitOralArgumentDto } from '../dto/create-rait-oral-argument.dto.js';
import { RaitOralArgumentService } from '../services/rait-oral-argument.service.js';

@Controller('v1/inf/rait/oral-arguments')
@Resource('inf:rait-oral-argument')
export class RaitOralArgumentController {
  constructor(private readonly service: RaitOralArgumentService) {}
}
