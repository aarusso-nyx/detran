// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
import { Injectable } from '@nestjs/common';
import { JuntaBoardMemberRepository } from '../repositories/junta-board-member.repository.js';
import type { JuntaBoardMember } from '../entities/junta-board-member.entity.js';
import type { CreateJuntaBoardMemberDto } from '../dto/create-junta-board-member.dto.js';

@Injectable()
export class JuntaBoardMemberService {
  constructor(private readonly repository: JuntaBoardMemberRepository) {}
  findAll(): Promise<JuntaBoardMember[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<JuntaBoardMember> {
    return this.repository.findOne(id);
  }
  create(dto: CreateJuntaBoardMemberDto): Promise<JuntaBoardMember> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateJuntaBoardMemberDto>,
  ): Promise<JuntaBoardMember> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
