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
import type { CreateRequestDto } from '../dto/create-request.dto.js';
import { RequestService } from '../services/request.service.js';

@Controller('v1/portal/requests/requests')
@Resource('portal:request')
export class RequestController {
  constructor(private readonly service: RequestService) {}
}
