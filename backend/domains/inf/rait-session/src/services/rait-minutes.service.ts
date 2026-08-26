// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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
