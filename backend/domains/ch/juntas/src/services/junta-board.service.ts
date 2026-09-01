// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
import { Injectable } from '@nestjs/common';
import { JuntaBoardRepository } from '../repositories/junta-board.repository.js';
import type { JuntaBoard } from '../entities/junta-board.entity.js';
import type { CreateJuntaBoardDto } from '../dto/create-junta-board.dto.js';

@Injectable()
export class JuntaBoardService {
  constructor(private readonly repository: JuntaBoardRepository) {}
  findAll(): Promise<JuntaBoard[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<JuntaBoard> {
    return this.repository.findOne(id);
  }
  create(dto: CreateJuntaBoardDto): Promise<JuntaBoard> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateJuntaBoardDto>): Promise<JuntaBoard> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
