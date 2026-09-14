// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
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
