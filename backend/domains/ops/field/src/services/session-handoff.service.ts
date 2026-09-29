// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
