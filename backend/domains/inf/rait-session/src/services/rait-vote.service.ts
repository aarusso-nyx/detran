// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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
