// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
import { Injectable } from '@nestjs/common';
import { RaitBatchDrawSnapshotRepository } from '../repositories/rait-batch-draw-snapshot.repository.js';
import type { RaitBatchDrawSnapshot } from '../entities/rait-batch-draw-snapshot.entity.js';
import type { CreateRaitBatchDrawSnapshotDto } from '../dto/create-rait-batch-draw-snapshot.dto.js';

@Injectable()
export class RaitBatchDrawSnapshotService {
  constructor(private readonly repository: RaitBatchDrawSnapshotRepository) {}
  findAll(): Promise<RaitBatchDrawSnapshot[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitBatchDrawSnapshot> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitBatchDrawSnapshotDto): Promise<RaitBatchDrawSnapshot> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitBatchDrawSnapshotDto>,
  ): Promise<RaitBatchDrawSnapshot> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
