// FreshnessStore (CTG-0002.md §6): guarda a `meta.freshness` publicada pelo
// `freshnessInterceptor` por fonte (`meta.source`) e as violações de contrato (resposta 2xx de
// leitura sem selo). Nenhum estado é calculado aqui: `ATRASADO`/`DESATUALIZADO_MARCADO` vêm do
// backend (contrato de rotas §1 regra 3; OD-D07) e o app só exibe.
import {
  Injectable,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';

/** [WF-DASH-003] §Estados — os quatro estados de frescor, na ordem da semente i18n. */
export const FRESHNESS_STATES = [
  'FRESCO',
  'ATRASADO',
  'INDISPONIVEL',
  'DESATUALIZADO_MARCADO',
] as const;

export type FreshnessState = (typeof FRESHNESS_STATES)[number];

/** `meta.freshness` do contrato de rotas §1 regra 3 (literal; formatos `source_pending`: OD-D16-017). */
export interface FreshnessMeta {
  readonly state: FreshnessState;
  /** ISO 8601; `null` só com `INDISPONIVEL` sem leitura anterior. */
  readonly asOf: string | null;
  /** Token exibido, nunca calculado (OD-D16-017). */
  readonly acceptableLatency: string | null;
  readonly source: string;
}

/** Resposta 2xx de leitura sem `meta.freshness` (§2 invariante 1: todo número tem selo). */
export interface FreshnessViolation {
  readonly url: string;
  readonly requestId: string | null;
  readonly at: string;
}

function isFreshnessState(value: unknown): value is FreshnessState {
  return (FRESHNESS_STATES as readonly unknown[]).includes(value);
}

export function isFreshnessMeta(value: unknown): value is FreshnessMeta {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const asOf = candidate['asOf'];
  return (
    isFreshnessState(candidate['state']) &&
    typeof candidate['source'] === 'string' &&
    candidate['source'].length > 0 &&
    (asOf === null || typeof asOf === 'string')
  );
}

@Injectable({ providedIn: 'root' })
export class FreshnessStore {
  private readonly metas = new Map<
    string,
    WritableSignal<FreshnessMeta | null>
  >();
  private readonly sourcesState = signal<readonly string[]>([]);
  private readonly violationsState = signal<readonly FreshnessViolation[]>([]);

  readonly sources: Signal<readonly string[]> = this.sourcesState.asReadonly();
  readonly violations: Signal<readonly FreshnessViolation[]> =
    this.violationsState.asReadonly();

  /** Signal estável por fonte (criado sob demanda; a identidade nunca muda). */
  freshnessOf(source: string): Signal<FreshnessMeta | null> {
    return this.slotOf(source).asReadonly();
  }

  publish(meta: FreshnessMeta): void {
    this.slotOf(meta.source).set(meta);
    if (!this.sourcesState().includes(meta.source)) {
      this.sourcesState.update((sources) => [...sources, meta.source]);
    }
  }

  /** `DASH.SOURCE_UNAVAILABLE` (503) vira selo, nunca erro (catálogo §7 linha 1). */
  markUnavailable(source: string, lastSeenAt: string | null): void {
    this.publish({
      state: 'INDISPONIVEL',
      asOf: lastSeenAt,
      acceptableLatency: null,
      source,
    });
  }

  recordViolation(violation: FreshnessViolation): void {
    this.violationsState.update((violations) => [...violations, violation]);
  }

  /** Usado no logout e nos testes. */
  reset(): void {
    for (const slot of this.metas.values()) slot.set(null);
    this.sourcesState.set([]);
    this.violationsState.set([]);
  }

  private slotOf(source: string): WritableSignal<FreshnessMeta | null> {
    let slot = this.metas.get(source);
    if (!slot) {
      slot = signal<FreshnessMeta | null>(null);
      this.metas.set(source, slot);
    }
    return slot;
  }
}
