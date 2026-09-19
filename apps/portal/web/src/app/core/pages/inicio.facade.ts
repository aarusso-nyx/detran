// InicioFacade (contrato CTG-0003c §3.10; spec §4 "/inicio: resolver me, notificações não lidas,
// autos com ação"; [UC-PORTAL-019] 3a; OD-P99): três leituras em paralelo — `GET inbox?read=false`,
// `GET aits` e `GET requests` — cada uma com o seu estado (a falha de uma não derruba as outras)
// e o ponto de retomada do `ResumeService` ("Falta 1 passo"). A união de pendências usa SÓ os
// critérios que os contratos expõem (`actions[].available`, `nextAction.by === 'citizen'`,
// `kind === 'acao_necessaria'`/`readOn === null`, `ResumePoint`) e é ordenada SÓ pelo `dueOn`
// recebido (texto ISO; sem prazo por último) — nenhum "N dias", nenhum limite inventado.
import { Injectable, computed, inject, signal } from '@angular/core';
import { PortalClient } from '../../data/portal.client';
import type {
  AitSummary,
  InboxItem,
  RequestSummary,
} from '../../data/portal-read.models';
import { readStatusFor, type ReadStatus } from '../../data/read-status';
import { presentError, type ErrorPresentation } from '../error-boundary';
import { ResumeService, type ResumePoint } from '../resume.service';
import { SessionFacade } from '../session.facade';

export interface PendingAction {
  readonly kind: 'ait' | 'request' | 'inbox' | 'resume';
  readonly id: string;
  /** `/autos/<aitId>` | `/processos/<requestId>` | `/notificacoes` | `ResumePoint.route`. */
  readonly route: string;
  /** `portal.requests.nextAction.<STATE>` | `portal.notifications.kind.acao_necessaria` | `portal.shell.inicio.resume`. */
  readonly labelKey: string;
  /** `deadlines[].dueOn` | `nextAction.dueOn` | `deadline.dueOn` — do servidor. */
  readonly dueOn: string | null;
  readonly ownedBy: 'citizen' | 'agency' | null;
}

const AIT_ROUTE_PREFIX = '/autos/';
const PROCESS_ROUTE_PREFIX = '/processos/';
const INBOX_ROUTE = '/notificacoes';
const UNREAD_LABEL_KEY = 'portal.notifications.kind.acao_necessaria';
const RESUME_LABEL_KEY = 'portal.shell.inicio.resume';
const RESUME_ID = 'resume';
const NEXT_ACTION_KEY_PREFIX = `portal.requests.nextAction.`;

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** `dueOn` crescente como texto; sem prazo por último (como `ProcessosFacade.byUrgency`). */
function byDueOn(a: PendingAction, b: PendingAction): number {
  if (a.dueOn !== null && b.dueOn !== null)
    return compareText(a.dueOn, b.dueOn);
  if (a.dueOn !== null) return -1;
  if (b.dueOn !== null) return 1;
  return 0;
}

/** `portal.requests.nextAction.<STATE>` quando o servidor envia essa chave; senão a do estado. */
function nextActionLabelKey(request: RequestSummary): string {
  const label = request.nextAction?.label;
  if (typeof label === 'string' && label.startsWith(NEXT_ACTION_KEY_PREFIX)) {
    return label;
  }
  return `${NEXT_ACTION_KEY_PREFIX}${request.situation}`;
}

@Injectable()
export class InicioFacade {
  private readonly client = inject(PortalClient);
  private readonly session = inject(SessionFacade);
  private readonly resumeService = inject(ResumeService);

  private readonly aitsStatusState = signal<ReadStatus>('idle');
  private readonly requestsStatusState = signal<ReadStatus>('idle');
  private readonly inboxStatusState = signal<ReadStatus>('idle');
  private readonly aitsErrorState = signal<ErrorPresentation | null>(null);
  private readonly requestsErrorState = signal<ErrorPresentation | null>(null);
  private readonly inboxErrorState = signal<ErrorPresentation | null>(null);
  private readonly unreadState = signal<readonly InboxItem[]>([]);
  private readonly aitsState = signal<readonly AitSummary[]>([]);
  private readonly requestsState = signal<readonly RequestSummary[]>([]);
  private readonly resumePointState = signal<ResumePoint | null>(null);
  private sequence = 0;

  readonly account = computed(() => this.session.account());
  readonly aitsStatus = this.aitsStatusState.asReadonly();
  readonly requestsStatus = this.requestsStatusState.asReadonly();
  readonly inboxStatus = this.inboxStatusState.asReadonly();
  /** Agregado: `loading` enquanto alguma leitura corre; `ready` quando as três terminaram. */
  readonly status = computed<ReadStatus>(() => {
    const statuses = [
      this.aitsStatusState(),
      this.requestsStatusState(),
      this.inboxStatusState(),
    ];
    if (statuses.every((status) => status === 'idle')) return 'idle';
    if (statuses.some((status) => status === 'loading')) return 'loading';
    return 'ready';
  });
  /** Uma apresentação por falha distinta (código + chave): três fontes offline → um só aviso. */
  readonly errors = computed<readonly ErrorPresentation[]>(() => {
    const seen = new Set<string>();
    return [
      this.inboxErrorState(),
      this.aitsErrorState(),
      this.requestsErrorState(),
    ].filter((error): error is ErrorPresentation => {
      if (error === null) return false;
      const key = `${error.code ?? ''}:${error.messageKey}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });
  /** `GET inbox?read=false` (primeira página; pageSize do servidor). */
  readonly unread = this.unreadState.asReadonly();
  /** `GET aits`: itens com algum `actions[].available === true`. */
  readonly aitsWithAction = computed<readonly AitSummary[]>(() =>
    this.aitsState().filter((ait) =>
      (ait.actions ?? []).some((action) => action.available === true),
    ),
  );
  /** `GET requests`: `nextAction.by === 'citizen'`. */
  readonly pendingRequests = computed<readonly RequestSummary[]>(() =>
    this.requestsState().filter(
      (request) => request.nextAction?.by === 'citizen',
    ),
  );
  /** `ResumeService.peek()` — "Falta 1 passo" ([UC-PORTAL-019] 3a). */
  readonly resumePoint = this.resumePointState.asReadonly();
  /** União ordenada SÓ pelo `dueOn` recebido; sem prazo por último. */
  readonly pending = computed<readonly PendingAction[]>(() => {
    const actions: PendingAction[] = [
      ...this.aitsWithAction().map((ait): PendingAction => {
        const deadline = ait.deadlines?.[0] ?? null;
        return {
          kind: 'ait',
          id: ait.aitId ?? '',
          route: `${AIT_ROUTE_PREFIX}${ait.aitId ?? ''}`,
          labelKey: UNREAD_LABEL_KEY,
          dueOn: deadline?.dueOn ?? null,
          ownedBy: deadline?.ownedBy ?? null,
        };
      }),
      ...this.pendingRequests().map((request): PendingAction => ({
        kind: 'request',
        id: request.requestId ?? '',
        route: `${PROCESS_ROUTE_PREFIX}${request.requestId ?? ''}`,
        labelKey: nextActionLabelKey(request),
        dueOn: request.nextAction?.dueOn ?? null,
        ownedBy: 'citizen',
      })),
      ...this.unreadState().map((item): PendingAction => ({
        kind: 'inbox',
        id: item.id,
        route: INBOX_ROUTE,
        labelKey: UNREAD_LABEL_KEY,
        dueOn: item.deadline?.dueOn ?? null,
        ownedBy: item.deadline?.ownedBy ?? null,
      })),
    ];
    const resume = this.resumePointState();
    if (resume) {
      actions.push({
        kind: 'resume',
        id: RESUME_ID,
        route: resume.route,
        labelKey: RESUME_LABEL_KEY,
        dueOn: null,
        ownedBy: 'citizen',
      });
    }
    return actions.sort(byDueOn);
  });

  /** As três leituras em paralelo; resolve quando todas terminaram (cada uma com o seu estado). */
  async load(): Promise<void> {
    const sequence = ++this.sequence;
    this.resumePointState.set(this.resumeService.peek());
    this.inboxStatusState.set('loading');
    this.aitsStatusState.set('loading');
    this.requestsStatusState.set('loading');
    this.inboxErrorState.set(null);
    this.aitsErrorState.set(null);
    this.requestsErrorState.set(null);
    await Promise.all([
      this.loadInbox(sequence),
      this.loadAits(sequence),
      this.loadRequests(sequence),
    ]);
  }

  private async loadInbox(sequence: number): Promise<void> {
    try {
      const page = await this.client.listInbox({ read: 'false' });
      if (sequence !== this.sequence) return;
      this.unreadState.set(
        ((page.items as readonly InboxItem[] | undefined) ?? []).filter(
          (item) => item.readOn === null,
        ),
      );
      this.inboxStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.sequence) return;
      const presentation = presentError(error);
      this.inboxErrorState.set(presentation);
      this.inboxStatusState.set(readStatusFor(presentation));
    }
  }

  private async loadAits(sequence: number): Promise<void> {
    try {
      const page = await this.client.listAits();
      if (sequence !== this.sequence) return;
      this.aitsState.set(
        (page.items as unknown as readonly AitSummary[] | undefined) ?? [],
      );
      this.aitsStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.sequence) return;
      const presentation = presentError(error);
      this.aitsErrorState.set(presentation);
      this.aitsStatusState.set(readStatusFor(presentation));
    }
  }

  private async loadRequests(sequence: number): Promise<void> {
    try {
      const page = await this.client.listRequests();
      if (sequence !== this.sequence) return;
      this.requestsState.set(
        (page.items as readonly RequestSummary[] | undefined) ?? [],
      );
      this.requestsStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.sequence) return;
      const presentation = presentError(error);
      this.requestsErrorState.set(presentation);
      this.requestsStatusState.set(readStatusFor(presentation));
    }
  }
}
