// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
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
