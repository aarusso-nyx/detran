// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
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
