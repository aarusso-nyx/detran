// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
import { Injectable } from '@nestjs/common';
import { RaitImpedimentRepository } from '../repositories/rait-impediment.repository.js';
import type { RaitImpediment } from '../entities/rait-impediment.entity.js';
import type { CreateRaitImpedimentDto } from '../dto/create-rait-impediment.dto.js';

@Injectable()
export class RaitImpedimentService {
  constructor(private readonly repository: RaitImpedimentRepository) {}
  findAll(): Promise<RaitImpediment[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitImpediment> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitImpedimentDto): Promise<RaitImpediment> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitImpedimentDto>,
  ): Promise<RaitImpediment> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
