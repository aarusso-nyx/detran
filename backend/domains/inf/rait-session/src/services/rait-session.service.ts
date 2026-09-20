// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Injectable } from '@nestjs/common';
import { RaitSessionRepository } from '../repositories/rait-session.repository.js';
import type { RaitSession } from '../entities/rait-session.entity.js';
import type { CreateRaitSessionDto } from '../dto/create-rait-session.dto.js';

@Injectable()
export class RaitSessionService {
  constructor(private readonly repository: RaitSessionRepository) {}
  findAll(): Promise<RaitSession[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitSession> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitSessionDto): Promise<RaitSession> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitSessionDto>): Promise<RaitSession> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
