// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
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
