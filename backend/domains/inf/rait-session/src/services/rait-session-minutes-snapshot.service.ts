// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Injectable } from '@nestjs/common';
import { RaitSessionMinutesSnapshotRepository } from '../repositories/rait-session-minutes-snapshot.repository.js';
import type { RaitSessionMinutesSnapshot } from '../entities/rait-session-minutes-snapshot.entity.js';
import type { CreateRaitSessionMinutesSnapshotDto } from '../dto/create-rait-session-minutes-snapshot.dto.js';

@Injectable()
export class RaitSessionMinutesSnapshotService {
  constructor(
    private readonly repository: RaitSessionMinutesSnapshotRepository,
  ) {}
  findAll(): Promise<RaitSessionMinutesSnapshot[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitSessionMinutesSnapshot> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRaitSessionMinutesSnapshotDto,
  ): Promise<RaitSessionMinutesSnapshot> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitSessionMinutesSnapshotDto>,
  ): Promise<RaitSessionMinutesSnapshot> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
