import { expect } from 'vitest';

export interface AuditPersistenceBehaviorAdapter {
  write(action: string): Promise<void>;
  count(): Promise<number>;
  verify(): Promise<boolean>;
}

export function auditPersistenceBehavior(
  adapter: AuditPersistenceBehaviorAdapter,
): void {
  it('persists two events into one valid tenant hash chain', async () => {
    await adapter.write('CREATE');
    await adapter.write('UPDATE');
    expect(await adapter.count()).toBe(2);
    expect(await adapter.verify()).toBe(true);
  });
}
