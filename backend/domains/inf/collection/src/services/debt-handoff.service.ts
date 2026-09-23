// Generated from BP-INF-COLLECTION-001 v1.0.2 sha256:10fb057463797bde8609b1b2a33435d80259cd90c69c2e991c5f42e355f924cd
import { Injectable } from '@nestjs/common';
import { DebtHandoffRepository } from '../repositories/debt-handoff.repository.js';
import type { DebtHandoff } from '../entities/debt-handoff.entity.js';
import type { CreateDebtHandoffDto } from '../dto/create-debt-handoff.dto.js';

@Injectable()
export class DebtHandoffService {
  constructor(private readonly repository: DebtHandoffRepository) {}
  findAll(): Promise<DebtHandoff[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<DebtHandoff> {
    return this.repository.findOne(id);
  }
  create(dto: CreateDebtHandoffDto): Promise<DebtHandoff> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateDebtHandoffDto>): Promise<DebtHandoff> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
