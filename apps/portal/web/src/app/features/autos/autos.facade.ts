// AutosFacade (contrato CTG-0003b §3.2; T-14/T-01): leituras de autuações e pontuação por
// navegação — provida na página (`providers: [AutosFacade]`), sem cache local. Filtro e paginação
// vão ao SERVIDOR (`vehicle`, `status`, `page`; [DIVERGE-7]); a lista e o resumo de pontos são
// independentes (a falha de um não derruba o outro); os pontos do AIT são lidos depois do detalhe
// e a falha deles não muda `aitStatus`. Erros só pelo `ErrorBoundary` (`presentError` →
// `readStatusFor`); nenhuma aritmética de datas, nenhuma decisão de prazo ou de nível aqui.
//
// Semântica das leituras (`loadList`, `setQuery`, `loadPointsSummary`, `loadAit`): a promessa
// resolve assim que a leitura é DESPACHADA; o resultado chega pelos signals (`status`, `page`,
// `ait`…), que as páginas observam — uma releitura nunca bloqueia quem a pediu (especificação
// executável C-3b-09/10/16/23/24). Cada resposta é refletida nos signals no tick seguinte à sua
// chegada (o cliente resolve no `next` da resposta).
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import { PortalClient } from '../../data/portal.client';
import type {
  AitDetail,
  AitListPage,
  AitListQuery,
  AitPoints,
  AitSummary,
  InfractionSituation,
  PointsSummary,
} from '../../data/portal-read.models';
import { readStatusFor, type ReadStatus } from '../../data/read-status';

/** Os 7 tokens que o servidor aceita em `status` (fora deles: 400 ENUM_INVALID). */
export const INFRACTION_SITUATIONS: readonly InfractionSituation[] = [
  'aguardando_defesa',
  'em_defesa',
  'penalidade_aplicada',
  'em_recurso',
  'encerrada',
  'cancelada',
  'arquivada',
];

const FIRST_PAGE = 1;

function withoutEmpty(query: AitListQuery): AitListQuery {
  const next: Record<string, string | number | undefined> = { ...query };
  for (const key of Object.keys(next)) {
    const value = next[key];
    if (value === undefined || value === '') delete next[key];
  }
  return next as AitListQuery;
}

@Injectable()
export class AutosFacade {
  private readonly client = inject(PortalClient);

  // T-14
  private readonly statusState = signal<ReadStatus>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly queryState = signal<AitListQuery>({});
  private readonly pageState = signal<AitListPage | null>(null);
  private readonly pointsStatusState = signal<ReadStatus>('idle');
  private readonly pointsState = signal<PointsSummary | null>(null);
  private readonly pointsErrorState = signal<ErrorPresentation | null>(null);
  // T-01
  private readonly aitStatusState = signal<ReadStatus>('idle');
  private readonly aitState = signal<AitDetail | null>(null);
  private readonly aitErrorState = signal<ErrorPresentation | null>(null);
  private readonly aitPointsState = signal<AitPoints | null>(null);
  /** Última leitura despachada por família — respostas atrasadas de leituras antigas são ignoradas. */
  private listSequence = 0;
  private aitSequence = 0;

  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  /** `{ vehicle?, status?, page?, pageSize? }` — vai ao servidor ([DIVERGE-7]). */
  readonly query = this.queryState.asReadonly();
  readonly page = this.pageState.asReadonly();
  readonly items = computed<readonly AitSummary[]>(
    () => (this.pageState()?.items as readonly AitSummary[] | undefined) ?? [],
  );
  readonly pointsStatus = this.pointsStatusState.asReadonly();
  readonly points = this.pointsState.asReadonly();
  readonly pointsError = this.pointsErrorState.asReadonly();

  readonly aitStatus = this.aitStatusState.asReadonly();
  readonly ait = this.aitState.asReadonly();
  readonly aitError = this.aitErrorState.asReadonly();
  readonly aitPoints = this.aitPointsState.asReadonly();

  /** GET aits com a query dada; `status` 'empty' quando total === 0 ([UC-PORTAL-010] 2a). */
  loadList(query: AitListQuery = this.queryState()): Promise<void> {
    const effective = withoutEmpty(query);
    this.queryState.set(effective);
    this.statusState.set('loading');
    this.errorState.set(null);
    void this.runList(effective, ++this.listSequence);
    return Promise.resolve();
  }

  /** Altera vehicle/status/page e recarrega (page volta a 1 quando o filtro muda). */
  setQuery(patch: Partial<AitListQuery>): Promise<void> {
    const filterChanged = 'vehicle' in patch || 'status' in patch;
    const next: AitListQuery = {
      ...this.queryState(),
      ...patch,
      ...(filterChanged && patch.page === undefined
        ? { page: FIRST_PAGE }
        : {}),
    };
    return this.loadList(next);
  }

  /** GET points-summary — independente da lista (falha de um não derruba o outro). */
  loadPointsSummary(): Promise<void> {
    this.pointsStatusState.set('loading');
    this.pointsErrorState.set(null);
    void this.runPointsSummary();
    return Promise.resolve();
  }

  /**
   * GET aits/{id} e, com o detalhe em mãos, GET aits/{id}/points — a falha dos pontos não muda
   * `aitStatus` (só deixa `aitPoints` null); sem detalhe, os pontos não são lidos.
   */
  loadAit(aitId: string): Promise<void> {
    this.aitStatusState.set('loading');
    this.aitErrorState.set(null);
    this.aitPointsState.set(null);
    void this.runAit(aitId, ++this.aitSequence);
    return Promise.resolve();
  }

  private async runList(query: AitListQuery, sequence: number): Promise<void> {
    try {
      const page = await this.client.listAits(query);
      if (sequence !== this.listSequence) return;
      this.pageState.set(page);
      this.statusState.set(page.total === 0 ? 'empty' : 'ready');
    } catch (error: unknown) {
      if (sequence !== this.listSequence) return;
      const presentation = presentError(error);
      this.errorState.set(presentation);
      this.statusState.set(readStatusFor(presentation));
    }
  }

  private async runPointsSummary(): Promise<void> {
    try {
      this.pointsState.set(await this.client.getPointsSummary());
      this.pointsStatusState.set('ready');
    } catch (error: unknown) {
      const presentation = presentError(error);
      this.pointsErrorState.set(presentation);
      this.pointsStatusState.set(readStatusFor(presentation));
    }
  }

  private async runAit(aitId: string, sequence: number): Promise<void> {
    let detail: AitDetail;
    try {
      detail = await this.client.getAit(aitId);
    } catch (error: unknown) {
      if (sequence !== this.aitSequence) return;
      const presentation = presentError(error, {
        entitlement: { kind: 'ait', id: aitId },
      });
      this.aitErrorState.set(presentation);
      this.aitStatusState.set(readStatusFor(presentation));
      return;
    }
    if (sequence !== this.aitSequence) return;
    this.aitState.set(detail);
    this.aitStatusState.set('ready');
    try {
      const points = await this.client.getAitPoints(aitId);
      if (sequence === this.aitSequence) this.aitPointsState.set(points);
    } catch {
      if (sequence === this.aitSequence) this.aitPointsState.set(null);
    }
  }
}
