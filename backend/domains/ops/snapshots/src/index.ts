import { OpsTenantRepository } from '@detran/ops-core';

export class FrozenSnapshotService {
  constructor(
    private readonly repositories: Record<string, OpsTenantRepository>,
  ) {}
  list(surface: string) {
    return (
      this.repositories[surface]?.list() ??
      Promise.reject(new Error(`Unbound snapshot surface: ${surface}`))
    );
  }
  create(surface: string, dto: Record<string, unknown>) {
    const repository = this.repositories[surface];
    if (!repository) throw new Error(`Unbound snapshot surface: ${surface}`);
    return repository.create(dto);
  }
}

export * from './frozen-snapshot.controller.js';
