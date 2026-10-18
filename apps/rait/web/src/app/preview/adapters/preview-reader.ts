// Leitura comum dos 8 adapters da prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §3,
// D-06, D-07, D-08, D-09): carrega a fixture (`PreviewFixtureStore`, uma vez por documento) e
// aplica o cenário global do documento (`PreviewStateService.state()`) por operação —
// `applyListScenario` nas listas, `applyReadScenario` nas leituras unitárias. `get*` de id ausente
// da coleção rejeita `Error('rait-preview-fixture-missing:<coleção>:<id>')` (D-08 → `kind
// 'unknown'` → `ReadStatus 'error'`), nunca 404 sintético. Também concentra os dois únicos
// auxiliares de preenchimento de D-06: `fixtureDateTime` (derivação literal (2)) e
// `sourcePending` (texto obrigatório sem fonte (5)).
import { Injectable, inject } from '@angular/core';
import type { ListQuerySpec } from '../../data/list-query';
import type { ListPage, ListQuery } from '../../data/models';
import {
  PREVIEW_SOURCE_PENDING,
  PreviewFixtureStore,
  type RaitFixturesJson,
} from '../preview-fixtures';
import { applyListScenario, applyReadScenario } from '../preview-scenario';
import { PreviewStateService } from '../preview-state.service';

export type FixtureProducer<T> = (fixtures: RaitFixturesJson) => readonly T[];

/** D-07: coleção sem registro na fixture (ou ainda não lida pelos adapters) → lista vazia. */
export function notInFixture<T>(): readonly T[] {
  return [];
}

/**
 * D-06 (2): data `AAAA-MM-DD` da fixture → data-hora `AAAA-MM-DDT00:00:00-04:00` (início do dia
 * no fuso `tenant.timezone`, `America/Manaus`); data-hora completa passa sem mudança.
 */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const TENANT_DAY_START = 'T00:00:00-04:00';

export function fixtureDateTime(value: string): string;
export function fixtureDateTime(
  value: string | null | undefined,
): string | null;
export function fixtureDateTime(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  return DATE_ONLY.test(value) ? `${value}${TENANT_DAY_START}` : value;
}

/** D-06 (5): único auxiliar tipado para campo obrigatório sem coluna na fixture/seed. */
export function sourcePending(): string {
  return PREVIEW_SOURCE_PENDING;
}

const MISSING_PREFIX = 'rait-preview-fixture-missing';

@Injectable({ providedIn: 'root' })
export class PreviewFixtureReader {
  private readonly store = inject(PreviewFixtureStore);
  private readonly preview = inject(PreviewStateService);

  async list<T>(
    query: ListQuery,
    spec: ListQuerySpec<T>,
    produce: FixtureProducer<T>,
  ): Promise<ListPage<T>> {
    const fixtures = await this.store.load();
    return applyListScenario(this.preview.state(), query, spec, () =>
      produce(fixtures),
    );
  }

  async get<T extends { readonly id: string }>(
    collection: string,
    id: string,
    produce: FixtureProducer<T>,
  ): Promise<T> {
    const fixtures = await this.store.load();
    return applyReadScenario(this.preview.state(), () => {
      const found = produce(fixtures).find((record) => record.id === id);
      if (!found) {
        throw new Error(`${MISSING_PREFIX}:${collection}:${id}`);
      }
      return found;
    });
  }
}
