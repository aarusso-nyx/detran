// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
import { Injectable } from '@nestjs/common';
import { OperationRepository } from '../repositories/operation.repository.js';
import type { Operation } from '../entities/operation.entity.js';
import type { CreateOperationDto } from '../dto/create-operation.dto.js';

@Injectable()
export class OperationService {
  constructor(private readonly repository: OperationRepository) {}
  findAll(): Promise<Operation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Operation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateOperationDto): Promise<Operation> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateOperationDto>): Promise<Operation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
