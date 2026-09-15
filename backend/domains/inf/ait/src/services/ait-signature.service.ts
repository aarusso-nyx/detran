// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
