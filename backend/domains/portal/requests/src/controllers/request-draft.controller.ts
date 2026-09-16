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
import type { CreateRequestDraftDto } from '../dto/create-request-draft.dto.js';
import { RequestDraftService } from '../services/request-draft.service.js';

@Controller('v1/portal/requests/drafts')
@Resource('portal:request-draft')
export class RequestDraftController {
  constructor(private readonly service: RequestDraftService) {}
}
