/** Memory-only queue scenario for UI/workflow homologation. Never an offline authority. */
import { InjectionToken, signal, type Signal } from '@angular/core';

export type HomologationSyncStatus =
  'empty' | 'queued' | 'failed' | 'retried' | 'conflict' | 'resolved';

export interface HomologationSyncPort {
  readonly status: Signal<HomologationSyncStatus>;
  enqueue(): void;
  fail(): void;
  retry(): void;
  markConflict(): void;
  resolve(): void;
}

export const TEAT_MOBILE_HOMOLOGATION_SYNC =
  new InjectionToken<HomologationSyncPort>('TEAT_MOBILE_HOMOLOGATION_SYNC');

export function createTeatMobileHomologationSync(): HomologationSyncPort {
  const status = signal<HomologationSyncStatus>('empty');
  return {
    status: status.asReadonly(),
    enqueue: () => status.set('queued'),
    fail: () => {
      if (status() !== 'queued') throw new Error('demo-sync-item-not-queued');
      status.set('failed');
    },
    retry: () => {
      if (status() !== 'failed') throw new Error('demo-sync-item-not-failed');
      status.set('retried');
    },
    markConflict: () => {
      if (status() !== 'retried') throw new Error('demo-sync-item-not-retried');
      status.set('conflict');
    },
    resolve: () => {
      if (status() !== 'conflict')
        throw new Error('demo-sync-item-not-conflict');
      status.set('resolved');
    },
  };
}
