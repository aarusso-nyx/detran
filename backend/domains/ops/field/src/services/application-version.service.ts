// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
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
