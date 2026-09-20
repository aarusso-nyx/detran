// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Injectable } from '@nestjs/common';
import { RaitMinutesRepository } from '../repositories/rait-minutes.repository.js';
import type { RaitMinutes } from '../entities/rait-minutes.entity.js';
import type { CreateRaitMinutesDto } from '../dto/create-rait-minutes.dto.js';

@Injectable()
export class RaitMinutesService {
  constructor(private readonly repository: RaitMinutesRepository) {}
  findAll(): Promise<RaitMinutes[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitMinutes> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitMinutesDto): Promise<RaitMinutes> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitMinutesDto>): Promise<RaitMinutes> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
