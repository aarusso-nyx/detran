// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
