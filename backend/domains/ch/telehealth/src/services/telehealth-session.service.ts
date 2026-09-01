// Generated from BP-CH-TELEHEALTH-001 v1.0.0 sha256:1702fef12182de18153031eed0b113c29e2eaa1406ccd4477fea59340ea96206
import { Injectable } from '@nestjs/common';
import { TelehealthSessionRepository } from '../repositories/telehealth-session.repository.js';
import type { TelehealthSession } from '../entities/telehealth-session.entity.js';
import type { CreateTelehealthSessionDto } from '../dto/create-telehealth-session.dto.js';

@Injectable()
export class TelehealthSessionService {
  constructor(private readonly repository: TelehealthSessionRepository) {}
  findAll(): Promise<TelehealthSession[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<TelehealthSession> {
    return this.repository.findOne(id);
  }
  create(dto: CreateTelehealthSessionDto): Promise<TelehealthSession> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateTelehealthSessionDto>,
  ): Promise<TelehealthSession> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
