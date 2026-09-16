// CTG-0003 §6.1 (R-0008, TASK-0007) — `POST
// /v1/inf/normative/catalogs/{id}/publish` e `.../retire`.
//
// [WF-TEAT-003]: `publish` vale de `draft` **e** de `active` (é idempotente);
// `retire` só de `active`. Fora disso, 409 `TEAT.CATALOG_STATE_INVALID`.
import { catalogPublishedEvent, rowValue } from './events.js';
import {
  catalogStateInvalid,
  dateOf,
  inTenantTransaction,
  patchRow,
  readRow,
  stringOf,
  tenantMismatch,
  tenantScope,
  todayOf,
  type NormativeDeps,
  type NormativeRow,
} from './normative-runtime.js';

const PUBLISHABLE = ['draft', 'active'] as const;
const RETIRABLE = ['active'] as const;

export interface PublishCatalogInput {
  published_at?: string;
}

export interface RetireCatalogInput {
  valid_to?: string;
}

export interface CatalogCommandResult {
  id: string;
  status: string;
  published_at: string | null;
  valid_to: string | null;
}

export class PublishCatalogCommand {
  constructor(private readonly deps: NormativeDeps) {}

  async publish(
    catalogId: string,
    input: PublishCatalogInput = {},
  ): Promise<CatalogCommandResult> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const occurredAt = this.deps.clock.now();
    const catalog = await this.load(catalogId);
    const currentState = stringOf(catalog.status);
    if (!(PUBLISHABLE as readonly string[]).includes(currentState))
      throw catalogStateInvalid(catalogId, currentState, PUBLISHABLE);

    const publishedAt = input?.published_at
      ? dateOf(input.published_at)
      : todayOf(this.deps.clock);

    return inTenantTransaction(this.deps, async (tx) => {
      const updated = (await patchRow(this.deps, tx, 'catalogs', catalogId, {
        status: 'active',
        published_at: publishedAt,
      })) ?? { ...catalog, status: 'active', published_at: publishedAt };

      await this.deps.outbox?.append(
        tx,
        catalogPublishedEvent(
          { tenantId, actorId, occurredAt },
          {
            catalogId,
            name: stringOf(catalog.name),
            version: stringOf(catalog.version),
            publishedAt,
            validFrom: rowValue(catalog, 'valid_from'),
          },
        ),
      );

      return view(updated, catalogId);
    });
  }

  async retire(
    catalogId: string,
    input: RetireCatalogInput = {},
  ): Promise<CatalogCommandResult> {
    const catalog = await this.load(catalogId);
    const currentState = stringOf(catalog.status);
    if (!(RETIRABLE as readonly string[]).includes(currentState))
      throw catalogStateInvalid(catalogId, currentState, RETIRABLE);

    const validTo = input?.valid_to
      ? dateOf(input.valid_to)
      : todayOf(this.deps.clock);

    return inTenantTransaction(this.deps, async (tx) => {
      const updated = (await patchRow(this.deps, tx, 'catalogs', catalogId, {
        status: 'retired',
        valid_to: validTo,
      })) ?? { ...catalog, status: 'retired', valid_to: validTo };
      return view(updated, catalogId);
    });
  }

  private async load(catalogId: string): Promise<NormativeRow> {
    const catalog = await readRow(this.deps, 'catalogs', catalogId);
    if (!catalog) throw tenantMismatch({ catalogId });
    return catalog;
  }
}

function view(row: NormativeRow, catalogId: string): CatalogCommandResult {
  return {
    id: stringOf(row.id || catalogId),
    status: stringOf(row.status),
    published_at: rowValue(row, 'published_at'),
    valid_to: rowValue(row, 'valid_to'),
  };
}
