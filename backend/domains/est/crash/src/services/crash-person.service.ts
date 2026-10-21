// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
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
