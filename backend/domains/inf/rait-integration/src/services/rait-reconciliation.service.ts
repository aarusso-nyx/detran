// Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.0 sha256:ddd770d620f969774d0560bb02a8ebae3a43c42b4340a4092a1a7828963820a5
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
