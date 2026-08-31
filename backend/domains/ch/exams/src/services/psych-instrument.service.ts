// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:b8585266a2e5ca4734d9b60ec5bade83fc01a1b209d3b3dbd1729a16a6b03734
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
