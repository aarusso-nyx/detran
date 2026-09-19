// CTG-0003 §4.6 (M11, R-0008, TASK-0007) — manifesto canônico do pacote
// probatório. Mesma `stableJson` de `ait-lifecycle.service.ts`: chaves
// ordenadas recursivamente, sem espaços, para que o `manifest_hash` seja
// determinístico entre execuções e entre máquinas.
import { createHash } from 'node:crypto';

export function stableJson(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((entry) => sortDeep(entry));
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const source = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(source)
        .sort()
        .map((key) => [key, sortDeep(source[key])]),
    );
  }
  return value;
}

export function sha256Hex(payload: string): string {
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

/** `'sha256:' + sha256hex(<json canônico>)` (CTG-0003 §3 e §4.6). */
export function manifestHashOf(manifest: unknown): string {
  return `sha256:${sha256Hex(stableJson(manifest))}`;
}

export interface ProbativeManifestItem {
  sequence: number;
  evidenceId: string;
  itemType: string;
  itemHash: string;
}

export interface ProbativeManifest {
  entityType: string;
  entityId: string;
  purpose: string;
  items: ProbativeManifestItem[];
}

export function probativeManifest(input: ProbativeManifest): ProbativeManifest {
  return {
    entityType: input.entityType,
    entityId: input.entityId,
    purpose: input.purpose,
    items: input.items,
  };
}
