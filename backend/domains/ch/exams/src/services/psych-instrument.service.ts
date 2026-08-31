// Generated from BP-CH-EXAMS-001 v1.1.0 sha256:bc8c0fd1f8e0a5a9684ebb7d2165df727ebdb3730cb7cf8f3bb8b106f2990fa9
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
