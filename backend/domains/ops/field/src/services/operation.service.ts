// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
