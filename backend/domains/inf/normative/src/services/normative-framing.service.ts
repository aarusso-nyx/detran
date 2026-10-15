// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
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
