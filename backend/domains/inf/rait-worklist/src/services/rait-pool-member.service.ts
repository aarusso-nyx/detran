// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
