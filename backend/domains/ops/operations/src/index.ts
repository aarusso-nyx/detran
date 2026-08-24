import { OpsTenantRepository } from '@detran/ops-core';

export class FieldOperationsService {
  constructor(
    private readonly repositories: Record<string, OpsTenantRepository>,
  ) {}
  list(surface: string) {
    return this.repository(surface).list();
  }
  get(surface: string, id: string) {
    return this.repository(surface).find(id);
  }
  create(surface: string, dto: Record<string, unknown>) {
    return this.repository(surface).create(dto);
  }
  private repository(surface: string) {
    const value = this.repositories[surface];
    if (!value) throw new Error(`Unbound ops surface: ${surface}`);
    return value;
  }
}

export * from './field-operations.controller.js';
