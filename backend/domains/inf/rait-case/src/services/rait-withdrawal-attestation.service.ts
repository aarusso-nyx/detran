// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
import { Injectable } from '@nestjs/common';
import { RaitWithdrawalAttestationRepository } from '../repositories/rait-withdrawal-attestation.repository.js';
import type { RaitWithdrawalAttestation } from '../entities/rait-withdrawal-attestation.entity.js';
import type { CreateRaitWithdrawalAttestationDto } from '../dto/create-rait-withdrawal-attestation.dto.js';

@Injectable()
export class RaitWithdrawalAttestationService {
  constructor(
    private readonly repository: RaitWithdrawalAttestationRepository,
  ) {}
  findAll(): Promise<RaitWithdrawalAttestation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitWithdrawalAttestation> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRaitWithdrawalAttestationDto,
  ): Promise<RaitWithdrawalAttestation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitWithdrawalAttestationDto>,
  ): Promise<RaitWithdrawalAttestation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
