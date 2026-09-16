// CTG-0003 §6.3 (M13, R-0008, TASK-0007) — `POST
// /v1/inf/normative/mobile-packages/{id}/publish` e `.../retire`.
//
// `publish` vale de `draft` e de `published` (idempotente); `retire` só de
// `published`. `retire` não publica evento: §8 não nomeia token de retirada.
import { packagePublishedEvent, rowValue } from './events.js';
import {
  catalogNotActive,
  dateOf,
  inTenantTransaction,
  packageStateInvalid,
  patchRow,
  readRow,
  stringOf,
  manifestMismatch,
  tenantMismatch,
  tenantScope,
  type NormativeDeps,
  type NormativeRow,
} from './normative-runtime.js';

const PUBLISHABLE = ['draft', 'published'] as const;
const RETIRABLE = ['published'] as const;

export interface PublishPackageInput {
  package_uri?: string;
  manifest_hash?: string;
  valid_until?: string;
}

export interface RetirePackageInput {
  valid_until?: string;
}

export interface PackageCommandResult {
  id: string;
  status: string;
  package_version: string;
  manifest_hash: string;
  published_at: string | null;
  valid_until: string | null;
}

export class PublishPackageCommand {
  constructor(private readonly deps: NormativeDeps) {}

  async publish(
    packageId: string,
    input: PublishPackageInput = {},
  ): Promise<PackageCommandResult> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const occurredAt = this.deps.clock.now();
    const row = await this.load(packageId);
    const currentState = stringOf(row.status);
    if (!(PUBLISHABLE as readonly string[]).includes(currentState))
      throw packageStateInvalid(packageId, currentState, PUBLISHABLE);

    const catalogId = stringOf(row.catalog_id);
    const catalog = await readRow(this.deps, 'catalogs', catalogId);
    const catalogState = stringOf(catalog?.status ?? '');
    if (catalogState !== 'active')
      throw catalogNotActive(catalogId, catalogState);

    const storedHash = stringOf(row.manifest_hash);
    const declaredHash = stringOf(input?.manifest_hash ?? '').trim();
    if (declaredHash && declaredHash !== storedHash)
      throw manifestMismatch(packageId, storedHash, declaredHash);

    const validUntil = input?.valid_until ? dateOf(input.valid_until) : null;
    const patch: NormativeRow = {
      status: 'published',
      published_at: occurredAt,
      ...(input?.package_uri ? { package_uri: input.package_uri } : {}),
      ...(validUntil ? { valid_until: validUntil } : {}),
    };

    return inTenantTransaction(this.deps, async (tx) => {
      const updated =
        (await patchRow(this.deps, tx, 'packages', packageId, patch)) ??
        ({ ...row, ...patch } as NormativeRow);

      await this.deps.outbox?.append(
        tx,
        packagePublishedEvent(
          { tenantId, actorId, occurredAt },
          {
            packageId,
            catalogId,
            packageVersion: stringOf(row.package_version),
            manifestHash: storedHash,
            publishedAt: occurredAt,
            validUntil: rowValue(updated, 'valid_until'),
          },
        ),
      );

      return view(updated, packageId);
    });
  }

  async retire(
    packageId: string,
    input: RetirePackageInput = {},
  ): Promise<PackageCommandResult> {
    const row = await this.load(packageId);
    const currentState = stringOf(row.status);
    if (!(RETIRABLE as readonly string[]).includes(currentState))
      throw packageStateInvalid(packageId, currentState, RETIRABLE);

    const validUntil = input?.valid_until ? dateOf(input.valid_until) : null;
    const patch: NormativeRow = {
      status: 'retired',
      ...(validUntil ? { valid_until: validUntil } : {}),
    };

    return inTenantTransaction(this.deps, async (tx) => {
      const updated =
        (await patchRow(this.deps, tx, 'packages', packageId, patch)) ??
        ({ ...row, ...patch } as NormativeRow);
      return view(updated, packageId);
    });
  }

  private async load(packageId: string): Promise<NormativeRow> {
    const row = await readRow(this.deps, 'packages', packageId);
    if (!row) throw tenantMismatch({ packageId });
    return row;
  }
}

function view(row: NormativeRow, packageId: string): PackageCommandResult {
  return {
    id: stringOf(row.id || packageId),
    status: stringOf(row.status),
    package_version: stringOf(row.package_version ?? ''),
    manifest_hash: stringOf(row.manifest_hash ?? ''),
    published_at: rowValue(row, 'published_at'),
    valid_until: rowValue(row, 'valid_until'),
  };
}
