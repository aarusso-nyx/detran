// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
import type { CreateRaitCommunicationDto } from '../dto/create-rait-communication.dto.js';
import { RaitCommunicationService } from '../services/rait-communication.service.js';

@Controller('v1/inf/rait/communications')
@Resource('inf:rait-communication')
export class RaitCommunicationController {
  constructor(private readonly service: RaitCommunicationService) {}
}
