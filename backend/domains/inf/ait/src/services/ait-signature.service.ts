// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
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
