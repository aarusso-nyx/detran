// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
import { Injectable } from '@nestjs/common';
import { SessionHandoffRepository } from '../repositories/session-handoff.repository.js';
import type { SessionHandoff } from '../entities/session-handoff.entity.js';
import type { CreateSessionHandoffDto } from '../dto/create-session-handoff.dto.js';

@Injectable()
export class SessionHandoffService {
  constructor(private readonly repository: SessionHandoffRepository) {}
  findAll(): Promise<SessionHandoff[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SessionHandoff> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSessionHandoffDto): Promise<SessionHandoff> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateSessionHandoffDto>,
  ): Promise<SessionHandoff> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
