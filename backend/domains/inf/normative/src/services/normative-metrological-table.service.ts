// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
import { Injectable } from '@nestjs/common';
import { NormativeMetrologicalTableRepository } from '../repositories/normative-metrological-table.repository.js';
import type { NormativeMetrologicalTable } from '../entities/normative-metrological-table.entity.js';
import type { CreateNormativeMetrologicalTableDto } from '../dto/create-normative-metrological-table.dto.js';

@Injectable()
export class NormativeMetrologicalTableService {
  constructor(
    private readonly repository: NormativeMetrologicalTableRepository,
  ) {}
  findAll(): Promise<NormativeMetrologicalTable[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NormativeMetrologicalTable> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateNormativeMetrologicalTableDto,
  ): Promise<NormativeMetrologicalTable> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNormativeMetrologicalTableDto>,
  ): Promise<NormativeMetrologicalTable> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
