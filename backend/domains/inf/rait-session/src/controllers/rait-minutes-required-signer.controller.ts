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
import type { CreateRaitMinutesRequiredSignerDto } from '../dto/create-rait-minutes-required-signer.dto.js';
import { RaitMinutesRequiredSignerService } from '../services/rait-minutes-required-signer.service.js';

@Controller('v1/inf/rait/minutes-required-signers')
@Resource('inf:rait-minutes-required-signer')
export class RaitMinutesRequiredSignerController {
  constructor(private readonly service: RaitMinutesRequiredSignerService) {}
}
