// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
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
