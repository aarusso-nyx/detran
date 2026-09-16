// CTG-0003 §6.6 (M13, R-0008, TASK-0007) — `GET
// /v1/inf/normative/mobile-packages/sync-metadata`.
//
// Só pacotes `published` **e** com `valid_until` nulo ou ≥ hoje, na ordem
// `published_at desc`.
import { rowValue } from './events.js';
import {
  dateOf,
  readRows,
  stringOf,
  todayOf,
  type NormativeDeps,
  type NormativeRow,
} from './normative-runtime.js';

export interface SyncMetadataPackage {
  id: string;
  package_uri: string;
  manifest_hash: string;
  package_version: string;
  published_at: string | null;
  valid_until: string | null;
}

export class PackageSyncMetadataQuery {
  constructor(private readonly deps: NormativeDeps) {}

  async execute(): Promise<{ packages: SyncMetadataPackage[] }> {
    const today = todayOf(this.deps.clock);
    const rows = await readRows(
      this.deps,
      'packages',
      (row) => row.status === 'published' && isCurrent(row, today),
    );
    const packages = rows
      .map((row) => ({
        id: stringOf(row.id),
        package_uri: stringOf(row.package_uri ?? ''),
        manifest_hash: stringOf(row.manifest_hash ?? ''),
        package_version: stringOf(row.package_version ?? ''),
        published_at: rowValue(row, 'published_at'),
        valid_until: rowValue(row, 'valid_until'),
      }))
      .sort(byPublishedAtDesc);
    return { packages };
  }
}

function isCurrent(row: NormativeRow, today: string): boolean {
  if (row.valid_until === null || row.valid_until === undefined) return true;
  return dateOf(row.valid_until) >= today;
}

function byPublishedAtDesc(
  left: SyncMetadataPackage,
  right: SyncMetadataPackage,
): number {
  return (right.published_at ?? '').localeCompare(left.published_at ?? '');
}
