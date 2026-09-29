// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
