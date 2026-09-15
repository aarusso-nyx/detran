// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
import { Injectable } from '@nestjs/common';
import { RaitJetonSheetRepository } from '../repositories/rait-jeton-sheet.repository.js';
import type { RaitJetonSheet } from '../entities/rait-jeton-sheet.entity.js';
import type { CreateRaitJetonSheetDto } from '../dto/create-rait-jeton-sheet.dto.js';

@Injectable()
export class RaitJetonSheetService {
  constructor(private readonly repository: RaitJetonSheetRepository) {}
  findAll(): Promise<RaitJetonSheet[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitJetonSheet> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitJetonSheetDto): Promise<RaitJetonSheet> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitJetonSheetDto>,
  ): Promise<RaitJetonSheet> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
