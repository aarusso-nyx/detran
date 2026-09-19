// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
import { Injectable } from '@nestjs/common';
import { CrashPersonRepository } from '../repositories/crash-person.repository.js';
import type { CrashPerson } from '../entities/crash-person.entity.js';
import type { CreateCrashPersonDto } from '../dto/create-crash-person.dto.js';

@Injectable()
export class CrashPersonService {
  constructor(private readonly repository: CrashPersonRepository) {}
  findAll(): Promise<CrashPerson[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashPerson> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashPersonDto): Promise<CrashPerson> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateCrashPersonDto>): Promise<CrashPerson> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
