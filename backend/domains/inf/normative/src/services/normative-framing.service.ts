// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
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
