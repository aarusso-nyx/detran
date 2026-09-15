// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
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
