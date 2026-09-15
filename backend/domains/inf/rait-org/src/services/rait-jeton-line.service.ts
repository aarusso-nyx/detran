// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
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
