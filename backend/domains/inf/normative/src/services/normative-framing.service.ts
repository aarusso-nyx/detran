// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9b6f79a3cdcad0f477ef759231f4effedede012dda39fe184dad78a5196f11ca
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
