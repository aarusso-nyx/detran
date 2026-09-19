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
import type { CreateRequestAttachmentDto } from '../dto/create-request-attachment.dto.js';
import { RequestAttachmentService } from '../services/request-attachment.service.js';

@Controller('v1/portal/requests/attachments')
@Resource('portal:request-attachment')
export class RequestAttachmentController {
  constructor(private readonly service: RequestAttachmentService) {}
}
