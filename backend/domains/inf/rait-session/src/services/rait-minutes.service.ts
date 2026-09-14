// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
import { Injectable } from '@nestjs/common';
import { RaitMinutesRepository } from '../repositories/rait-minutes.repository.js';
import type { RaitMinutes } from '../entities/rait-minutes.entity.js';
import type { CreateRaitMinutesDto } from '../dto/create-rait-minutes.dto.js';

@Injectable()
export class RaitMinutesService {
  constructor(private readonly repository: RaitMinutesRepository) {}
  findAll(): Promise<RaitMinutes[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitMinutes> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitMinutesDto): Promise<RaitMinutes> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitMinutesDto>): Promise<RaitMinutes> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
