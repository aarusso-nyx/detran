// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
import type { CreateRaitWithdrawalAttestationDto } from '../dto/create-rait-withdrawal-attestation.dto.js';
import { RaitWithdrawalAttestationService } from '../services/rait-withdrawal-attestation.service.js';

@Controller('v1/inf/rait/internal/withdrawal-attestations')
@Resource('inf:rait-withdrawal-attestation')
export class RaitWithdrawalAttestationController {
  constructor(private readonly service: RaitWithdrawalAttestationService) {}
}
