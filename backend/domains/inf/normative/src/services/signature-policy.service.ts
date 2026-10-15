// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
import { Injectable } from '@nestjs/common';
import { SignaturePolicyRepository } from '../repositories/signature-policy.repository.js';
import type { SignaturePolicy } from '../entities/signature-policy.entity.js';
import type { CreateSignaturePolicyDto } from '../dto/create-signature-policy.dto.js';

@Injectable()
export class SignaturePolicyService {
  constructor(private readonly repository: SignaturePolicyRepository) {}
  findAll(): Promise<SignaturePolicy[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SignaturePolicy> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSignaturePolicyDto): Promise<SignaturePolicy> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateSignaturePolicyDto>,
  ): Promise<SignaturePolicy> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
