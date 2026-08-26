// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
import { Injectable } from '@nestjs/common';
import { RaitOralArgumentRepository } from '../repositories/rait-oral-argument.repository.js';
import type { RaitOralArgument } from '../entities/rait-oral-argument.entity.js';
import type { CreateRaitOralArgumentDto } from '../dto/create-rait-oral-argument.dto.js';

@Injectable()
export class RaitOralArgumentService {
  constructor(private readonly repository: RaitOralArgumentRepository) {}
  findAll(): Promise<RaitOralArgument[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitOralArgument> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitOralArgumentDto): Promise<RaitOralArgument> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitOralArgumentDto>,
  ): Promise<RaitOralArgument> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
