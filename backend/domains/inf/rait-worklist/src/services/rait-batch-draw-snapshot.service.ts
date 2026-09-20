// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
