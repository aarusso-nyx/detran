// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
import { Injectable } from '@nestjs/common';
import { RaitJetonLineRepository } from '../repositories/rait-jeton-line.repository.js';
import type { RaitJetonLine } from '../entities/rait-jeton-line.entity.js';
import type { CreateRaitJetonLineDto } from '../dto/create-rait-jeton-line.dto.js';

@Injectable()
export class RaitJetonLineService {
  constructor(private readonly repository: RaitJetonLineRepository) {}
  findAll(): Promise<RaitJetonLine[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitJetonLine> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitJetonLineDto): Promise<RaitJetonLine> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitJetonLineDto>,
  ): Promise<RaitJetonLine> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
