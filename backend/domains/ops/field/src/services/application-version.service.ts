// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
import { Injectable } from '@nestjs/common';
import { ApplicationVersionRepository } from '../repositories/application-version.repository.js';
import type { ApplicationVersion } from '../entities/application-version.entity.js';
import type { CreateApplicationVersionDto } from '../dto/create-application-version.dto.js';

@Injectable()
export class ApplicationVersionService {
  constructor(private readonly repository: ApplicationVersionRepository) {}
  findAll(): Promise<ApplicationVersion[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ApplicationVersion> {
    return this.repository.findOne(id);
  }
  create(dto: CreateApplicationVersionDto): Promise<ApplicationVersion> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateApplicationVersionDto>,
  ): Promise<ApplicationVersion> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
