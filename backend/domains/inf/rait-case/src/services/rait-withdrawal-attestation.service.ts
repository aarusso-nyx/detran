// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
