// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
