import { describe, expect, it, vi } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const BATCH = '00000000-0000-7000-8000-000028000001';
const SNAPSHOT_HASH = 'b'.repeat(64);

type PreparedManifest = {
  readonly tenantId: string;
  readonly aggregateId: string;
  readonly documentId: string;
  readonly contentHash: string;
  readonly snapshotHash: string;
  readonly manifestHash: string;
  readonly documentKind: 'BATCH_DISTRIBUTION_MINUTES';
  readonly manifestVersion: string;
  readonly preparedAt: string;
};

type WorklistMinutesPort = {
  prepareBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
    snapshotVersion: 'draw-v1';
    idempotencyKey: string;
  }): Promise<PreparedManifest>;
  getBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
  }): Promise<PreparedManifest>;
};

const manifest: PreparedManifest = {
  tenantId: TENANT,
  aggregateId: BATCH,
  documentId: '00000000-0000-7000-8000-000012000001',
  contentHash: 'a'.repeat(64),
  snapshotHash: SNAPSHOT_HASH,
  manifestHash: 'c'.repeat(64),
  documentKind: 'BATCH_DISTRIBUTION_MINUTES',
  manifestVersion: 'draw-v1',
  preparedAt: '2026-09-19T02:00:00.000Z',
};

describe('TASK-0060 — fachada local da confiança documental worklist', () => {
  it('dado a manifestação preparada pelo serviço documental quando a fachada RAIT a delega então não a confunde com verificação de assinatura', async () => {
    const { RaitDocumentTrustVerifier } =
      await import('./rait-document-trust.verifier.js');
    const adapter = {
      prepareBatchMinutesManifest: vi.fn(async () => manifest),
      getBatchMinutesManifest: vi.fn(async () => manifest),
    };
    const subject = new RaitDocumentTrustVerifier(
      adapter as never,
    ) as unknown as WorklistMinutesPort;
    const prepare = {
      tenantId: TENANT,
      batchId: BATCH,
      snapshotHash: SNAPSHOT_HASH,
      snapshotVersion: 'draw-v1' as const,
      idempotencyKey: 'task-0060-wrapper-prepare',
    };
    const retrieve = {
      tenantId: TENANT,
      batchId: BATCH,
      snapshotHash: SNAPSHOT_HASH,
    };

    await expect(subject.prepareBatchMinutesManifest(prepare)).resolves.toEqual(
      manifest,
    );
    await expect(subject.getBatchMinutesManifest(retrieve)).resolves.toEqual(
      manifest,
    );
    expect(adapter.prepareBatchMinutesManifest).toHaveBeenCalledWith(prepare);
    expect(adapter.getBatchMinutesManifest).toHaveBeenCalledWith(retrieve);
  });
});
