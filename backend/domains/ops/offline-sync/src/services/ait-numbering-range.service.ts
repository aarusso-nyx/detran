// Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d
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
