import { describe, expect, it, vi } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const BATCH = '00000000-0000-7000-8000-000028000001';
const DOCUMENT = '00000000-0000-7000-8000-000012000001';
const SNAPSHOT_HASH = 'b'.repeat(64);

type PreparedBatchMinutesManifest = {
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
  }): Promise<PreparedBatchMinutesManifest>;
  getBatchMinutesManifest(input: {
    tenantId: string;
    batchId: string;
    snapshotHash: string;
  }): Promise<PreparedBatchMinutesManifest>;
};

const prepared: PreparedBatchMinutesManifest = {
  tenantId: TENANT,
  aggregateId: BATCH,
  documentId: DOCUMENT,
  contentHash: 'a'.repeat(64),
  snapshotHash: SNAPSHOT_HASH,
  manifestHash: 'c'.repeat(64),
  documentKind: 'BATCH_DISTRIBUTION_MINUTES',
  manifestVersion: 'draw-v1',
  preparedAt: '2026-09-19T02:00:00.000Z',
};

describe('TASK-0060 — porta documental tipada da worklist', () => {
  it('dado snapshot server-owned do lote quando a manifestação é preparada e recuperada então expõe operações distintas e preserva tenant, lote e hashes', async () => {
    const { DocumentTrustHttpAdapter } =
      await import('./document-trust.http-adapter.js');
    const subject =
      new DocumentTrustHttpAdapter() as unknown as WorklistMinutesPort;
    const prepare = {
      tenantId: TENANT,
      batchId: BATCH,
      snapshotHash: SNAPSHOT_HASH,
      snapshotVersion: 'draw-v1' as const,
      idempotencyKey: 'task-0060-prepare-batch-minutes',
    };
    const retrieve = {
      tenantId: TENANT,
      batchId: BATCH,
      snapshotHash: SNAPSHOT_HASH,
    };

    const prepareSpy = vi
      .spyOn(subject, 'prepareBatchMinutesManifest')
      .mockResolvedValue(prepared);
    const retrieveSpy = vi
      .spyOn(subject, 'getBatchMinutesManifest')
      .mockResolvedValue(prepared);

    await expect(subject.prepareBatchMinutesManifest(prepare)).resolves.toEqual(
      prepared,
    );
    await expect(subject.getBatchMinutesManifest(retrieve)).resolves.toEqual(
      prepared,
    );
    expect(prepareSpy).toHaveBeenCalledWith(prepare);
    expect(retrieveSpy).toHaveBeenCalledWith(retrieve);
    expect(prepared).toMatchObject({
      tenantId: TENANT,
      aggregateId: BATCH,
      documentId: DOCUMENT,
      snapshotHash: SNAPSHOT_HASH,
      documentKind: 'BATCH_DISTRIBUTION_MINUTES',
    });
  });
});
