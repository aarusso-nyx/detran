// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:8f7f7c36486cc7f2062f87bdfda6722994b3aff5dc8e5b80183ffea196fad19f
import { Injectable } from '@nestjs/common';
import { NormativeFramingRepository } from '../repositories/normative-framing.repository.js';
import type { NormativeFraming } from '../entities/normative-framing.entity.js';
import type { CreateNormativeFramingDto } from '../dto/create-normative-framing.dto.js';

@Injectable()
export class NormativeFramingService {
  constructor(private readonly repository: NormativeFramingRepository) {}
  findAll(): Promise<NormativeFraming[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NormativeFraming> {
    return this.repository.findOne(id);
  }
  create(dto: CreateNormativeFramingDto): Promise<NormativeFraming> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNormativeFramingDto>,
  ): Promise<NormativeFraming> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
