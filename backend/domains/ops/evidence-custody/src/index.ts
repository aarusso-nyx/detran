import { OpsTenantRepository } from '@detran/ops-core';

export class EvidenceCustodyService {
  constructor(
    private readonly repositories: Record<string, OpsTenantRepository>,
  ) {}
  list(surface: string) {
    const repository = this.repositories[surface];
    if (!repository) throw new Error(`Unbound evidence surface: ${surface}`);
    return repository.list();
  }
  create(surface: string, dto: Record<string, unknown>) {
    const repository = this.repositories[surface];
    if (!repository) throw new Error(`Unbound evidence surface: ${surface}`);
    return repository.create(dto);
  }
}

export * from './evidence-custody.controller.js';
