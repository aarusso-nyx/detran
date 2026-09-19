// SinistrosFacade (contrato CTG-0003c §3.4; T-18/T-19; [RN-PORTAL-118]; [JRN-PORTAL-007]; OD-P19):
// a lista de sinistros (`GET crashes`, sem parâmetros de busca no OpenAPI — [DIVERGE-14]: o filtro
// de T-18 é LOCAL, case-insensitive, sobre `stateLabel` e os valores string de `summary`; nunca uma
// consulta inventada) e o detalhe (`GET crashes/{id}`, vínculo `crash`). `CRASH_NOT_FINAL` é erro
// recuperável sem prazo; `thirdPartyFieldsSuppressed` é aviso informativo que não muda o status —
// o servidor já suprimiu os dados de terceiro. Nenhum download de boletim ([DIVERGE-15]).
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import { PortalClient } from '../../data/portal.client';
import type { CrashDetail, CrashSummary } from '../../data/portal-read.models';
import { readStatusFor, type ReadStatus } from '../../data/read-status';

/** Texto pesquisável de um item: `stateLabel` + valores string de `summary` (forma livre, OD-P91). */
function searchableText(item: CrashSummary): string {
  const values = Object.values(item.summary ?? {}).filter(
    (value): value is string => typeof value === 'string',
  );
  return [item.stateLabel, ...values].join('\n').toLocaleLowerCase();
}

@Injectable()
export class SinistrosFacade {
  private readonly client = inject(PortalClient);

  private readonly statusState = signal<ReadStatus>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly itemsState = signal<readonly CrashSummary[]>([]);
  private readonly searchState = signal('');
  private readonly detailStatusState = signal<ReadStatus>('idle');
  private readonly detailState = signal<CrashDetail | null>(null);
  private readonly detailErrorState = signal<ErrorPresentation | null>(null);
  private listSequence = 0;
  private detailSequence = 0;

  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly items = this.itemsState.asReadonly();
  /** Texto do campo de busca (T-18). */
  readonly search = this.searchState.asReadonly();
  /** Filtro LOCAL; vazio → todos. Nunca consulta o servidor por texto. */
  readonly filtered = computed<readonly CrashSummary[]>(() => {
    const needle = this.searchState().trim().toLocaleLowerCase();
    const items = this.itemsState();
    if (needle.length === 0) return items;
    return items.filter((item) => searchableText(item).includes(needle));
  });
  readonly detailStatus = this.detailStatusState.asReadonly();
  readonly detail = this.detailState.asReadonly();
  readonly detailError = this.detailErrorState.asReadonly();

  /** GET crashes; `empty` quando `items.length === 0`. */
  async loadList(): Promise<void> {
    this.statusState.set('loading');
    this.errorState.set(null);
    const sequence = ++this.listSequence;
    try {
      const page = await this.client.listCrashes();
      if (sequence !== this.listSequence) return;
      const items = page.items ?? [];
      this.itemsState.set(items);
      this.statusState.set(items.length === 0 ? 'empty' : 'ready');
    } catch (error: unknown) {
      if (sequence !== this.listSequence) return;
      const presentation = presentError(error);
      this.errorState.set(presentation);
      this.statusState.set(readStatusFor(presentation));
    }
  }

  setSearch(text: string): void {
    this.searchState.set(text);
  }

  /** GET crashes/{id}; entitlement { kind: 'crash', id }. */
  async loadDetail(crashId: string): Promise<void> {
    this.detailStatusState.set('loading');
    this.detailErrorState.set(null);
    const sequence = ++this.detailSequence;
    try {
      const detail = await this.client.getCrash(crashId);
      if (sequence !== this.detailSequence) return;
      this.detailState.set(detail);
      this.detailStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.detailSequence) return;
      const presentation = presentError(error, {
        entitlement: { kind: 'crash', id: crashId },
      });
      this.detailState.set(null);
      this.detailErrorState.set(presentation);
      this.detailStatusState.set(readStatusFor(presentation));
    }
  }
}
