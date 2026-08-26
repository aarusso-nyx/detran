// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:a4378f112c84361ebe923b17329c2848218c3f266f9811c1b18090d9c79f0ee1
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
