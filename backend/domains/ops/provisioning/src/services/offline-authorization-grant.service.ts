// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
import { Injectable } from '@nestjs/common';
import { OfflineAuthorizationGrantRepository } from '../repositories/offline-authorization-grant.repository.js';
import type { OfflineAuthorizationGrant } from '../entities/offline-authorization-grant.entity.js';
import type { CreateOfflineAuthorizationGrantDto } from '../dto/create-offline-authorization-grant.dto.js';

@Injectable()
export class OfflineAuthorizationGrantService {
  constructor(
    private readonly repository: OfflineAuthorizationGrantRepository,
  ) {}
  findAll(): Promise<OfflineAuthorizationGrant[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<OfflineAuthorizationGrant> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateOfflineAuthorizationGrantDto,
  ): Promise<OfflineAuthorizationGrant> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateOfflineAuthorizationGrantDto>,
  ): Promise<OfflineAuthorizationGrant> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
