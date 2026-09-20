// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Injectable } from '@nestjs/common';
import { RaitMinutesRequiredSignerRepository } from '../repositories/rait-minutes-required-signer.repository.js';
import type { RaitMinutesRequiredSigner } from '../entities/rait-minutes-required-signer.entity.js';
import type { CreateRaitMinutesRequiredSignerDto } from '../dto/create-rait-minutes-required-signer.dto.js';

@Injectable()
export class RaitMinutesRequiredSignerService {
  constructor(
    private readonly repository: RaitMinutesRequiredSignerRepository,
  ) {}
  findAll(): Promise<RaitMinutesRequiredSigner[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitMinutesRequiredSigner> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRaitMinutesRequiredSignerDto,
  ): Promise<RaitMinutesRequiredSigner> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitMinutesRequiredSignerDto>,
  ): Promise<RaitMinutesRequiredSigner> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
