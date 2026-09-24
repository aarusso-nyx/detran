import type { MobileEncryptedStorePort } from '@stynx-nyx/mobile-runtime';
import type { ScopedAitReservation } from '../app/data/local/local-act.store';

export class EncryptedStoreFixture implements MobileEncryptedStorePort {
  readonly adapterName = 'inspector-encrypted-store';
  readonly encrypted = true;
  readonly encryptionScope = 'device' as const;
  readonly securityLevel = 'hardware-backed' as const;
  private readonly values = new Map<string, unknown>();

  async put<T>(collection: string, key: string, value: T): Promise<void> {
    this.values.set(`${collection}:${key}`, structuredClone(value));
  }

  async get<T>(collection: string, key: string): Promise<T | undefined> {
    const value = this.values.get(`${collection}:${key}`);
    return value === undefined ? undefined : structuredClone(value as T);
  }

  async list<T>(collection: string): Promise<T[]> {
    const prefix = `${collection}:`;
    return [...this.values.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => structuredClone(value as T));
  }

  async remove(collection: string, key: string): Promise<void> {
    this.values.delete(`${collection}:${key}`);
  }

  async clear(): Promise<void> {
    this.values.clear();
  }

  async installAitReservationAuthoritiesAtomic(
    authorities: readonly ScopedAitReservation[],
  ): Promise<void> {
    const staged = new Map(this.values);
    for (const authority of authorities) {
      const key = `reservation:${authority.reservationId}`;
      const existing = staged.get(key);
      if (
        existing !== undefined &&
        JSON.stringify(existing) !== JSON.stringify(authority)
      ) {
        throw new Error('local-store-identity-conflict');
      }
      staged.set(key, structuredClone(authority));
    }
    this.values.clear();
    for (const [key, value] of staged) this.values.set(key, value);
  }

  corrupt(collection: string, key: string, value: unknown): void {
    this.values.set(`${collection}:${key}`, structuredClone(value));
  }
}
