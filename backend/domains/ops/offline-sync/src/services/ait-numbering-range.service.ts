// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:060a1bba7bd902d60194a1ee2fe169a4b0972602bd54e5330083d9c518641e52
import { Injectable } from '@nestjs/common';
import { AitNumberingRangeRepository } from '../repositories/ait-numbering-range.repository.js';
import type { AitNumberingRange } from '../entities/ait-numbering-range.entity.js';
import type { CreateAitNumberingRangeDto } from '../dto/create-ait-numbering-range.dto.js';

@Injectable()
export class AitNumberingRangeService {
  constructor(private readonly repository: AitNumberingRangeRepository) {}
  findAll(): Promise<AitNumberingRange[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AitNumberingRange> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAitNumberingRangeDto): Promise<AitNumberingRange> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAitNumberingRangeDto>,
  ): Promise<AitNumberingRange> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
