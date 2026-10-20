// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
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
