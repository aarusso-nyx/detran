// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
import { Injectable } from '@nestjs/common';
import { JuntaCaseRepository } from '../repositories/junta-case.repository.js';
import type { JuntaCase } from '../entities/junta-case.entity.js';
import type { CreateJuntaCaseDto } from '../dto/create-junta-case.dto.js';

@Injectable()
export class JuntaCaseService {
  constructor(private readonly repository: JuntaCaseRepository) {}
  findAll(): Promise<JuntaCase[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<JuntaCase> {
    return this.repository.findOne(id);
  }
  create(dto: CreateJuntaCaseDto): Promise<JuntaCase> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateJuntaCaseDto>): Promise<JuntaCase> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
