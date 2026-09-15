// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
