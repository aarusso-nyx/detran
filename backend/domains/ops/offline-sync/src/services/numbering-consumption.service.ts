// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:060a1bba7bd902d60194a1ee2fe169a4b0972602bd54e5330083d9c518641e52
import { Injectable } from '@nestjs/common';
import { NumberingConsumptionRepository } from '../repositories/numbering-consumption.repository.js';
import type { NumberingConsumption } from '../entities/numbering-consumption.entity.js';
import type { CreateNumberingConsumptionDto } from '../dto/create-numbering-consumption.dto.js';

@Injectable()
export class NumberingConsumptionService {
  constructor(private readonly repository: NumberingConsumptionRepository) {}
  findAll(): Promise<NumberingConsumption[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NumberingConsumption> {
    return this.repository.findOne(id);
  }
  create(dto: CreateNumberingConsumptionDto): Promise<NumberingConsumption> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNumberingConsumptionDto>,
  ): Promise<NumberingConsumption> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
