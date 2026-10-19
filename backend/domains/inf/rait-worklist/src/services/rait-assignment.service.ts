// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
import { Injectable } from '@nestjs/common';
import { RaitAssignmentRepository } from '../repositories/rait-assignment.repository.js';
import type { RaitAssignment } from '../entities/rait-assignment.entity.js';
import type { CreateRaitAssignmentDto } from '../dto/create-rait-assignment.dto.js';

@Injectable()
export class RaitAssignmentService {
  constructor(private readonly repository: RaitAssignmentRepository) {}
  findAll(): Promise<RaitAssignment[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitAssignment> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitAssignmentDto): Promise<RaitAssignment> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitAssignmentDto>,
  ): Promise<RaitAssignment> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
