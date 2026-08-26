// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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
