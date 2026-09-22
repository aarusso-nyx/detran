// Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.1 sha256:2d42a37638b7f6930d1b8ac07d6cd13218f965f5c2857948e0afeea8df277caf
import { Injectable } from '@nestjs/common';
import { RaitReconciliationRepository } from '../repositories/rait-reconciliation.repository.js';
import type { RaitReconciliation } from '../entities/rait-reconciliation.entity.js';
import type { CreateRaitReconciliationDto } from '../dto/create-rait-reconciliation.dto.js';

@Injectable()
export class RaitReconciliationService {
  constructor(private readonly repository: RaitReconciliationRepository) {}
  findAll(): Promise<RaitReconciliation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitReconciliation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitReconciliationDto): Promise<RaitReconciliation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitReconciliationDto>,
  ): Promise<RaitReconciliation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
