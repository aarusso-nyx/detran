// ProcessosFacade (contrato CTG-0003b §3.3; T-06/T-07/T-08/T-10/T-11): leituras e os dois comandos
// da trilha de processos, por navegação (provida na página, sem cache local). A ordenação por
// urgência usa SÓ o `nextAction.dueOn` recebido — ISO `YYYY-MM-DD` comparado como string,
// crescente, sem prazo por último, desempate por `updatedAt` decrescente; nunca `Date` (spec §1;
// [RN-RAIT-005]). O `ETag` de `GET requests/{id}` (ou `etagOf(version)`) é o `If-Match` do
// `withdraw` (§2.2). Delegações reais respondem `422 SERVICE_UNAVAILABLE` → `commandStatus
// 'unavailable'` com o motivo, nunca um resultado simulado (M15). Erros só pelo `ErrorBoundary`.
//
// Semântica das leituras (`loadList`, `setQuery`, `loadDetail`, `loadDecision`): a promessa resolve
// assim que a leitura é DESPACHADA; o resultado chega pelos signals, que as páginas observam
// (especificação executável C-3b-16/23/24). Os comandos (`withdraw`, `respondDiligence`) resolvem
// com a resposta e só então despacham a releitura do detalhe.
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import { etagOf } from '../../data/portal-command.models';
import type { DiligenceResponded } from '../../data/portal-command.models';
import {
  PortalClient,
  type DiligenceResponseBody,
  type RequestWithdrawBody,
  type RequestWithdrawn,
} from '../../data/portal.client';
import type {
  Decision,
  Diligence,
  RequestDetail,
  RequestListPage,
  RequestListQuery,
  RequestState,
  RequestSummary,
} from '../../data/portal-read.models';
import { readStatusFor, type ReadStatus } from '../../data/read-status';

export type RequestSort = 'urgencia' | 'atualizacao';

export type CommandStatus =
  'idle' | 'submitting' | 'done' | 'error' | 'unavailable' | 'offline';

/** Os 13 estados de WF-PORTAL-001, na ordem do fluxo (filtro de T-06). */
export const REQUEST_STATES: readonly RequestState[] = [
  'IDENTIFICADO',
  'SERVICO_SELECIONADO',
  'ELEGIBILIDADE_VERIFICADA',
  'INELEGIVEL',
  'PEDIDO_EM_COMPOSICAO',
  'AGUARDANDO_NIVEL_ASSINATURA',
  'AGUARDANDO_PAGAMENTO',
  'PROTOCOLADO',
  'EM_ANDAMENTO_NO_ORGAO',
  'RESULTADO_DISPONIVEL',
  'AVALIACAO_OFERECIDA',
  'CONCLUIDO',
  'DESISTIDO',
];

const FIRST_PAGE = 1;
const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
const DECISION_KIND = 'decision';
const PROCESS_ROUTE_PREFIX = '/processos/';
const AIT_ROUTE_PREFIX = '/autos/';

/** Próximo passo → rota do app (contrato §3.3); qualquer outra chave → sem botão. */
const NEXT_STEP_ROUTES: Readonly<
  Record<
    string,
    (requestId: string, request: RequestDetail['request']) => string | null
  >
> = {
  recurso_jari: (requestId) => `${PROCESS_ROUTE_PREFIX}${requestId}/jari/nova`,
  recurso_cetran: (requestId) =>
    `${PROCESS_ROUTE_PREFIX}${requestId}/cetran/nova`,
  pagamento: (_requestId, request) =>
    request.targetKind === 'ait' && request.targetId
      ? `${AIT_ROUTE_PREFIX}${request.targetId}/pagamento`
      : null,
};

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** `updatedAt` decrescente (ISO comparado como texto; ausente por último). */
function byUpdatedAtDesc(a: RequestSummary, b: RequestSummary): number {
  return compareText(b.updatedAt ?? '', a.updatedAt ?? '');
}

/** `nextAction.dueOn` crescente; sem prazo por último; desempate por `updatedAt` decrescente. */
function byUrgency(a: RequestSummary, b: RequestSummary): number {
  const dueA = a.nextAction?.dueOn ?? null;
  const dueB = b.nextAction?.dueOn ?? null;
  if (dueA !== null && dueB !== null) {
    const order = compareText(dueA, dueB);
    return order !== 0 ? order : byUpdatedAtDesc(a, b);
  }
  if (dueA !== null) return -1;
  if (dueB !== null) return 1;
  return byUpdatedAtDesc(a, b);
}

function withoutEmpty(query: RequestListQuery): RequestListQuery {
  const next: Record<string, string | number | undefined> = { ...query };
  for (const key of Object.keys(next)) {
    const value = next[key];
    if (value === undefined || value === '') delete next[key];
  }
  return next as RequestListQuery;
}

@Injectable()
export class ProcessosFacade {
  private readonly client = inject(PortalClient);

  // T-06
  private readonly statusState = signal<ReadStatus>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly queryState = signal<RequestListQuery>({});
  private readonly pageState = signal<RequestListPage | null>(null);
  private readonly sortState = signal<RequestSort>('urgencia');
  // T-07, T-08, T-10, T-11
  private readonly detailStatusState = signal<ReadStatus>('idle');
  private readonly detailState = signal<RequestDetail | null>(null);
  private readonly detailErrorState = signal<ErrorPresentation | null>(null);
  private readonly etagState = signal<string | null>(null);
  private readonly detailRequestIdState = signal<string | null>(null);
  private readonly decisionStatusState = signal<ReadStatus>('idle');
  private readonly decisionState = signal<Decision | null>(null);
  private readonly decisionErrorState = signal<ErrorPresentation | null>(null);
  private readonly commandStatusState = signal<CommandStatus>('idle');
  private readonly commandErrorState = signal<ErrorPresentation | null>(null);
  private listSequence = 0;
  private detailSequence = 0;
  private decisionSequence = 0;

  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly query = this.queryState.asReadonly();
  readonly page = this.pageState.asReadonly();
  /** Padrão 'urgencia' (T06 §4; [UC-PORTAL-005] 2a). */
  readonly sort = this.sortState.asReadonly();
  readonly items = computed<readonly RequestSummary[]>(
    () =>
      (this.pageState()?.items as readonly RequestSummary[] | undefined) ?? [],
  );
  /** Ordenação SÓ pelo `dueOn` recebido (ou `updatedAt`), nunca `Date`. */
  readonly sorted = computed<readonly RequestSummary[]>(() => {
    const items = this.items().slice();
    return items.sort(
      this.sortState() === 'urgencia' ? byUrgency : byUpdatedAtDesc,
    );
  });

  readonly detailStatus = this.detailStatusState.asReadonly();
  readonly detail = this.detailState.asReadonly();
  readonly detailError = this.detailErrorState.asReadonly();
  /** §2.2 — `If-Match` do withdraw. */
  readonly etag = this.etagState.asReadonly();
  readonly decisionStatus = this.decisionStatusState.asReadonly();
  readonly decision = this.decisionState.asReadonly();
  readonly decisionError = this.decisionErrorState.asReadonly();
  readonly commandStatus = this.commandStatusState.asReadonly();
  readonly commandError = this.commandErrorState.asReadonly();

  loadList(query: RequestListQuery = this.queryState()): Promise<void> {
    const effective = withoutEmpty(query);
    this.queryState.set(effective);
    this.statusState.set('loading');
    this.errorState.set(null);
    void this.runList(effective, ++this.listSequence);
    return Promise.resolve();
  }

  /** Reordena localmente o que já foi lido; nenhuma requisição nova. */
  setSort(sort: RequestSort): void {
    this.sortState.set(sort);
  }

  /** Altera state/kind/period/page e recarrega (page volta a 1 quando o filtro muda). */
  setQuery(patch: Partial<RequestListQuery>): Promise<void> {
    const filterChanged =
      'state' in patch || 'kind' in patch || 'period' in patch;
    const next: RequestListQuery = {
      ...this.queryState(),
      ...patch,
      ...(filterChanged && patch.page === undefined
        ? { page: FIRST_PAGE }
        : {}),
    };
    return this.loadList(next);
  }

  /** GET requests/{id}; guarda `etag ?? etagOf(request.version)` (§2.2). */
  loadDetail(requestId: string): Promise<void> {
    this.detailRequestIdState.set(requestId);
    this.detailStatusState.set('loading');
    this.detailErrorState.set(null);
    void this.runDetail(requestId, ++this.detailSequence);
    return Promise.resolve();
  }

  /** GET requests/{id}/decision; 404 `kind: 'decision'` → estado `empty` de T-10 (§2.4). */
  loadDecision(requestId: string): Promise<void> {
    this.decisionStatusState.set('loading');
    this.decisionErrorState.set(null);
    void this.runDecision(requestId, ++this.decisionSequence);
    return Promise.resolve();
  }

  /** `diligences().find(d => d.diligenceId === diligenceId) ?? null`. */
  diligence(diligenceId: string): Diligence | null {
    return (
      this.detailState()?.diligences?.find(
        (candidate) => candidate.diligenceId === diligenceId,
      ) ?? null
    );
  }

  /** POST …/withdraw com If-Match = etag(); 200 → detail recarregado; devolve o corpo ou null. */
  async withdraw(
    requestId: string,
    body: RequestWithdrawBody,
  ): Promise<RequestWithdrawn | null> {
    this.commandStatusState.set('submitting');
    this.commandErrorState.set(null);
    try {
      const result = await this.client.withdrawRequest(
        requestId,
        body,
        this.etagState(),
      );
      this.etagState.set(result.etag ?? etagOf(result.body.version));
      this.commandStatusState.set('done');
      void this.loadDetail(requestId);
      return result.body;
    } catch (error: unknown) {
      this.failCommand(error, requestId);
      return null;
    }
  }

  /** POST …/diligences/{did}/responses; 2xx (OD-P59) → detail recarregado. */
  async respondDiligence(
    requestId: string,
    diligenceId: string,
    body: DiligenceResponseBody,
  ): Promise<DiligenceResponded | null> {
    this.commandStatusState.set('submitting');
    this.commandErrorState.set(null);
    try {
      const result = await this.client.respondDiligence(
        requestId,
        diligenceId,
        body,
      );
      this.commandStatusState.set('done');
      void this.loadDetail(requestId);
      return result.body;
    } catch (error: unknown) {
      this.failCommand(error, requestId);
      return null;
    }
  }

  /** Rota do app para `decision.nextStep` (T-10) ou `actions.nextInstanceServiceKey` (T-07). */
  nextStepRoute(serviceKey: string | null): string | null {
    if (serviceKey === null) return null;
    const detail = this.detailState();
    const requestId =
      this.detailRequestIdState() ?? detail?.request?.requestId ?? null;
    if (!detail || requestId === null) return null;
    const route = NEXT_STEP_ROUTES[serviceKey];
    return route ? route(requestId, detail.request) : null;
  }

  private async runList(
    query: RequestListQuery,
    sequence: number,
  ): Promise<void> {
    try {
      const page = await this.client.listRequests(query);
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

  private async runDetail(requestId: string, sequence: number): Promise<void> {
    try {
      const result = await this.client.getRequest(requestId);
      if (sequence !== this.detailSequence) return;
      const version = result.body?.request?.version;
      this.detailState.set(result.body);
      this.etagState.set(
        result.etag ?? (typeof version === 'number' ? etagOf(version) : null),
      );
      this.detailStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.detailSequence) return;
      const presentation = presentError(error, {
        entitlement: { kind: 'request', id: requestId },
      });
      this.detailErrorState.set(presentation);
      this.detailStatusState.set(readStatusFor(presentation));
    }
  }

  private async runDecision(
    requestId: string,
    sequence: number,
  ): Promise<void> {
    try {
      const decision = await this.client.getDecision(requestId);
      if (sequence !== this.decisionSequence) return;
      this.decisionState.set(decision);
      this.decisionStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.decisionSequence) return;
      const presentation = presentError(error, {
        entitlement: { kind: 'request', id: requestId },
      });
      if (
        presentation.code === NOT_FOUND_CODE &&
        presentation.context['kind'] === DECISION_KIND
      ) {
        // Ainda sem decisão publicada: estado vazio de T-10, não falta de vínculo.
        this.decisionState.set(null);
        this.decisionErrorState.set(null);
        this.decisionStatusState.set('empty');
        return;
      }
      this.decisionErrorState.set(presentation);
      this.decisionStatusState.set(readStatusFor(presentation));
    }
  }

  private failCommand(error: unknown, requestId: string): void {
    const presentation = presentError(error, {
      entitlement: { kind: 'request', id: requestId },
    });
    this.commandErrorState.set(presentation);
    if (presentation.code === SERVICE_UNAVAILABLE_CODE) {
      this.commandStatusState.set('unavailable');
      return;
    }
    const status = readStatusFor(presentation);
    this.commandStatusState.set(status === 'offline' ? 'offline' : 'error');
  }
}
