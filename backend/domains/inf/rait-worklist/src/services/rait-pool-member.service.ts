// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:2297f42351909b6ac68f4a18e7c8b535508fa219dfdaa0f9b087f1ca3b745234
import { Injectable } from '@nestjs/common';
import { RaitPoolMemberRepository } from '../repositories/rait-pool-member.repository.js';
import type { RaitPoolMember } from '../entities/rait-pool-member.entity.js';
import type { CreateRaitPoolMemberDto } from '../dto/create-rait-pool-member.dto.js';

@Injectable()
export class RaitPoolMemberService {
  constructor(private readonly repository: RaitPoolMemberRepository) {}
  findAll(): Promise<RaitPoolMember[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitPoolMember> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitPoolMemberDto): Promise<RaitPoolMember> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitPoolMemberDto>,
  ): Promise<RaitPoolMember> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
