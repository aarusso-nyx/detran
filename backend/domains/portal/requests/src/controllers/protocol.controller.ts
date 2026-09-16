// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:1861cc41e71895a553a106b4be9f7f02958d1829af65885904d1c8f6a9aeb07c
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
import type { CreateProtocolDto } from '../dto/create-protocol.dto.js';
import { ProtocolService } from '../services/protocol.service.js';

@Controller('v1/portal/requests/protocols')
@Resource('portal:protocol')
export class ProtocolController {
  constructor(private readonly service: ProtocolService) {}
}
