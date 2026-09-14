// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
import { Injectable } from '@nestjs/common';
import { AitSignatureRepository } from '../repositories/ait-signature.repository.js';
import type { AitSignature } from '../entities/ait-signature.entity.js';
import type { CreateAitSignatureDto } from '../dto/create-ait-signature.dto.js';

@Injectable()
export class AitSignatureService {
  constructor(private readonly repository: AitSignatureRepository) {}
  findAll(): Promise<AitSignature[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AitSignature> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAitSignatureDto): Promise<AitSignature> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAitSignatureDto>,
  ): Promise<AitSignature> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
