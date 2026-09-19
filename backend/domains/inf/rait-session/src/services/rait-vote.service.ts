// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Injectable } from '@nestjs/common';
import { RaitVoteRepository } from '../repositories/rait-vote.repository.js';
import type { RaitVote } from '../entities/rait-vote.entity.js';
import type { CreateRaitVoteDto } from '../dto/create-rait-vote.dto.js';

@Injectable()
export class RaitVoteService {
  constructor(private readonly repository: RaitVoteRepository) {}
  findAll(): Promise<RaitVote[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitVote> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitVoteDto): Promise<RaitVote> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitVoteDto>): Promise<RaitVote> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
