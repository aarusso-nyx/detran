// NotificacoesFacade (contrato CTG-0003c §3.2; T-12, preferências, T-09): a caixa do cidadão
// (`GET inbox`, ordem do servidor — nunca reordenada nem filtrada por prazo; a ciência ficta de
// cada item é exibida TAL COMO VEIO, [DIVERGE-4]), a ciência (`POST inbox/{id}/read`), as
// preferências (`PUT preferences` com `If-Match` sem origem nesta rodada → 428 e 422 apresentados
// como "indisponível", OD-P87/OD-P38) e a adesão ao SNE (`GET/POST/DELETE sne/enrollment`). O tempo
// real (`RealtimeService.on('inbox.item')` e `tick`) só dispara releituras — a falha do tempo real
// nunca derruba a lista. Erros só pelo `ErrorBoundary`; nenhum relógio nem armazenamento local aqui.
//
// Semântica: as leituras resolvem quando a resposta chegou aos signals (número de sequência
// descarta respostas fora de ordem); os comandos resolvem com a resposta e só então despacham a
// releitura. `CommandStatus` é o do par 2, reexportado (§3.1).
import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { merge } from 'rxjs';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import {
  RealtimeService,
  type RealtimeStatus,
} from '../../core/realtime.service';
import { PortalClient } from '../../data/portal.client';
import type {
  InboxItem,
  InboxListPage,
  InboxListQuery,
  InboxReadResult,
  PreferencesUpdateBody,
  PreferencesUpdated,
  SneCancelled,
  SneEnrolled,
  SneEnrollment,
  SneEnrollmentCancelBody,
  SneEnrollmentCreateBody,
} from '../../data/portal-read.models';
import { readStatusFor, type ReadStatus } from '../../data/read-status';
import type { CommandStatus } from '../processos/processos.facade';

export type { CommandStatus } from '../processos/processos.facade';

const FIRST_PAGE = 1;
const SNE_ROUTE = '/sne';
const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
const INBOX_ITEM_KIND = 'inbox_item';
/** §2.3/§3.2: 428 e 422 de `PUT preferences` são "indisponível", nunca "recarregue". */
const PREFERENCES_UNAVAILABLE_CODES: ReadonlySet<string> = new Set([
  'PORTAL.SERVICE_UNAVAILABLE',
  'PORTAL.IF_MATCH_REQUIRED',
]);
/** §3.2 (e): estado incompatível → releitura da adesão + banner. */
const SNE_RELOAD_CODES: ReadonlySet<string> = new Set([
  'PORTAL.SNE_ALREADY_ENROLLED',
  'PORTAL.SNE_NOT_ENROLLED',
]);

/** 201/200 de adesão/cancelamento têm a mesma forma de `GET sne/enrollment` (canal como string no gerado). */
function asEnrollment(body: SneEnrolled | SneCancelled): SneEnrollment {
  return body as unknown as SneEnrollment;
}

@Injectable()
export class NotificacoesFacade {
  private readonly client = inject(PortalClient);
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);

  // T-12
  private readonly statusState = signal<ReadStatus>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly queryState = signal<InboxListQuery>({});
  private readonly pageState = signal<InboxListPage | null>(null);
  private readonly readStatusState = signal<CommandStatus>('idle');
  private readonly readErrorState = signal<ErrorPresentation | null>(null);
  // preferências
  private readonly preferencesStatusState = signal<CommandStatus>('idle');
  private readonly preferencesErrorState = signal<ErrorPresentation | null>(
    null,
  );
  private readonly ifMatchState = signal<string | null>(null);
  // T-09
  private readonly enrollmentStatusState = signal<ReadStatus>('idle');
  private readonly enrollmentState = signal<SneEnrollment | null>(null);
  private readonly enrollmentErrorState = signal<ErrorPresentation | null>(
    null,
  );
  private readonly sneCommandStatusState = signal<CommandStatus>('idle');
  private readonly sneCommandErrorState = signal<ErrorPresentation | null>(
    null,
  );
  private listSequence = 0;
  private enrollmentSequence = 0;

  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly query = this.queryState.asReadonly();
  readonly page = this.pageState.asReadonly();
  /** `page()?.items ?? []` (asserção); ordem do servidor. */
  readonly items = computed<readonly InboxItem[]>(
    () => (this.pageState()?.items as readonly InboxItem[] | undefined) ?? [],
  );
  /** SÓ da página lida — o servidor não dá "total não lidas" ([DIVERGE-25]). */
  readonly unreadCount = computed(
    () => this.items().filter((item) => item.readOn === null).length,
  );
  /** `RealtimeService.status()`. */
  readonly realtime = computed<RealtimeStatus>(() =>
    this.realtimeService.status(),
  );
  readonly realtimeError = computed(() => this.realtimeService.lastError());
  readonly readStatus = this.readStatusState.asReadonly();
  readonly readError = this.readErrorState.asReadonly();
  readonly preferencesStatus = this.preferencesStatusState.asReadonly();
  readonly preferencesError = this.preferencesErrorState.asReadonly();
  /** Sempre `null` nesta rodada (OD-P87). */
  readonly ifMatch = this.ifMatchState.asReadonly();
  readonly enrollmentStatus = this.enrollmentStatusState.asReadonly();
  readonly enrollment = this.enrollmentState.asReadonly();
  readonly enrollmentError = this.enrollmentErrorState.asReadonly();
  readonly sneCommandStatus = this.sneCommandStatusState.asReadonly();
  readonly sneCommandError = this.sneCommandErrorState.asReadonly();

  constructor() {
    // SSE `inbox.item` e `tick` do polling → releitura da caixa (§3.2 d). A assinatura conta
    // como consumidor do tempo real; encerra com a página.
    const subscription = merge(
      this.realtimeService.on('inbox.item'),
      this.realtimeService.tick,
    ).subscribe(() => {
      if (this.statusState() !== 'idle') void this.loadList();
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  /** GET inbox; `empty` quando `total === 0`. */
  async loadList(query: InboxListQuery = this.queryState()): Promise<void> {
    this.queryState.set(query);
    this.statusState.set('loading');
    this.errorState.set(null);
    const sequence = ++this.listSequence;
    try {
      const page = await this.client.listInbox(query);
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

  /** `page` volta a 1 quando `kind`/`read` mudam. */
  setQuery(patch: Partial<InboxListQuery>): Promise<void> {
    const filterChanged = 'kind' in patch || 'read' in patch;
    const next: InboxListQuery = {
      ...this.queryState(),
      ...patch,
      ...(filterChanged && patch.page === undefined
        ? { page: FIRST_PAGE }
        : {}),
    };
    for (const key of Object.keys(next) as (keyof InboxListQuery)[]) {
      if (next[key] === undefined) delete next[key];
    }
    return this.loadList(next);
  }

  /** POST inbox/{id}/read; 200 → item substituído localmente e `loadList()` despachado. */
  async markRead(inboxItemId: string): Promise<InboxReadResult | null> {
    this.readStatusState.set('submitting');
    this.readErrorState.set(null);
    try {
      const result = await this.client.markInboxRead(inboxItemId);
      const page = this.pageState();
      if (page) {
        this.pageState.set({
          ...page,
          items: page.items.map((item) =>
            item.id === inboxItemId
              ? { ...item, readOn: result.body.readOn }
              : item,
          ),
        });
      }
      this.readStatusState.set('done');
      void this.loadList();
      return result.body;
    } catch (error: unknown) {
      const presentation = presentError(error);
      this.readErrorState.set(presentation);
      this.readStatusState.set(commandStatusOf(presentation));
      // Item desapareceu da caixa: a lista é relida (§6 T-12).
      if (
        presentation.code === NOT_FOUND_CODE &&
        presentation.context['kind'] === INBOX_ITEM_KIND
      ) {
        void this.loadList();
      }
      return null;
    }
  }

  /** PUT preferences com `If-Match = ifMatch()`; 428 e 422 SERVICE_UNAVAILABLE → 'unavailable'. */
  async savePreferences(
    body: PreferencesUpdateBody,
  ): Promise<PreferencesUpdated | null> {
    this.preferencesStatusState.set('submitting');
    this.preferencesErrorState.set(null);
    try {
      const result = await this.client.updatePreferences(
        body,
        this.ifMatchState(),
      );
      if (result.etag !== null) this.ifMatchState.set(result.etag);
      this.preferencesStatusState.set('done');
      return result.body;
    } catch (error: unknown) {
      const presentation = presentError(error);
      this.preferencesErrorState.set(presentation);
      this.preferencesStatusState.set(
        presentation.code !== null &&
          PREFERENCES_UNAVAILABLE_CODES.has(presentation.code)
          ? 'unavailable'
          : commandStatusOf(presentation),
      );
      return null;
    }
  }

  /** GET sne/enrollment (200 sempre; `enrolled=false` sem linha). */
  async loadEnrollment(): Promise<void> {
    this.enrollmentStatusState.set('loading');
    this.enrollmentErrorState.set(null);
    const sequence = ++this.enrollmentSequence;
    try {
      const enrollment = await this.client.getSneEnrollment();
      if (sequence !== this.enrollmentSequence) return;
      this.enrollmentState.set(enrollment);
      this.enrollmentStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.enrollmentSequence) return;
      const presentation = presentError(error, { resumeRoute: SNE_ROUTE });
      this.enrollmentErrorState.set(presentation);
      this.enrollmentStatusState.set(readStatusFor(presentation));
    }
  }

  /** POST sne/enrollment; 201 → adesão atualizada; 403 ASSURANCE_INSUFFICIENT → `elevation` com retomar=/sne. */
  async enroll(body: SneEnrollmentCreateBody): Promise<SneEnrolled | null> {
    this.sneCommandStatusState.set('submitting');
    this.sneCommandErrorState.set(null);
    try {
      const result = await this.client.enrollSne(body);
      this.enrollmentState.set(asEnrollment(result.body));
      this.enrollmentStatusState.set('ready');
      this.sneCommandStatusState.set('done');
      return result.body;
    } catch (error: unknown) {
      this.failSne(error);
      return null;
    }
  }

  /** DELETE sne/enrollment; 200 → adesão atualizada (`enrolled=false`, `cancelledAt`). */
  async cancel(body?: SneEnrollmentCancelBody): Promise<SneCancelled | null> {
    this.sneCommandStatusState.set('submitting');
    this.sneCommandErrorState.set(null);
    try {
      const result = await this.client.cancelSne(body);
      this.enrollmentState.set(asEnrollment(result.body));
      this.enrollmentStatusState.set('ready');
      this.sneCommandStatusState.set('done');
      return result.body;
    } catch (error: unknown) {
      this.failSne(error);
      return null;
    }
  }

  private failSne(error: unknown): void {
    const presentation = presentError(error, { resumeRoute: SNE_ROUTE });
    this.sneCommandErrorState.set(presentation);
    this.sneCommandStatusState.set(commandStatusOf(presentation));
    if (presentation.code !== null && SNE_RELOAD_CODES.has(presentation.code)) {
      void this.loadEnrollment();
    }
  }
}

/** `CommandStatus` de uma apresentação (§3.1): `unavailable` | `offline` | `error`. */
export function commandStatusOf(
  presentation: ErrorPresentation,
): CommandStatus {
  const status = readStatusFor(presentation);
  if (status === 'unavailable') return 'unavailable';
  if (status === 'offline') return 'offline';
  return 'error';
}
