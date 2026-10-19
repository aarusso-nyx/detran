// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
import type { CreateRaitPoolMemberDto } from '../dto/create-rait-pool-member.dto.js';
import { RaitPoolMemberService } from '../services/rait-pool-member.service.js';

@Controller('v1/inf/rait/pool-members')
@Resource('inf:rait-pool-member')
export class RaitPoolMemberController {
  constructor(private readonly service: RaitPoolMemberService) {}
}
