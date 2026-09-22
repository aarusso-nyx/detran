import type { MobileEncryptedStorePort } from '@stynx-nyx/mobile-runtime';

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

  corrupt(collection: string, key: string, value: unknown): void {
    this.values.set(`${collection}:${key}`, structuredClone(value));
  }
}
