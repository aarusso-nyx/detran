// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:4768197f351ea702628ed5198543624eb79b54621bfc8fb4c6383ecc414b17b9
import { Injectable } from '@nestjs/common';
import { PsychInstrumentRepository } from '../repositories/psych-instrument.repository.js';
import type { PsychInstrument } from '../entities/psych-instrument.entity.js';
import type { CreatePsychInstrumentDto } from '../dto/create-psych-instrument.dto.js';

@Injectable()
export class PsychInstrumentService {
  constructor(private readonly repository: PsychInstrumentRepository) {}
  findAll(): Promise<PsychInstrument[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PsychInstrument> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePsychInstrumentDto): Promise<PsychInstrument> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreatePsychInstrumentDto>,
  ): Promise<PsychInstrument> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
