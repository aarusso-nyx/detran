// ProtocolFacade (contrato CTG-0002b §4.2/§4.3; M9): módulo protocolo. `intake` = casos
// PROTOCOLADO (ficha 019); `pendencias` = pendências abertas (`outcome` nulo) + join caso (ficha
// 021); `remessas` = casos AGUARDANDO_REMESSA_JARI + prazos `T-REM10` por caso (ficha 022;
// `remessasPrazo`); `redirecionamentos` (ficha 023); `desistenciaCaso` = caso alvo do termo por
// protocolo (ficha 024). Joins leem a primeira página do cliente (≤ 50; OD-R12-018). SSE:
// `case.changed` → todas. Comandos M8 até R-0007 CTG-0004.
import { Injectable, computed, inject, signal } from '@angular/core';
import { CaseClient } from '../api/case.client';
import { RaitClock } from '../clock';
import type {
  CommandBody,
  CreateRaitCaseDto,
  CreateRaitRedirectDto,
  ListPage,
  ListQuery,
  RaitCase,
  RaitDeadline,
  RaitPendingContent,
  RaitPendingContentOutcome,
  RaitRedirect,
} from '../models';
import { createCommandRunner, type CommandOutcome } from './command';
import { createListFacade } from './list.facade';
import { createReadStore } from './read-store';
import { bindStream, refreshIfLoaded } from './stream';

const INTAKE_STATE = 'PROTOCOLADO';
const REMITTANCE_STATE = 'AGUARDANDO_REMESSA_JARI';
const REMITTANCE_TIMER_CODE = 'T-REM10';

function mergeFilter(
  query: ListQuery,
  filtro: Readonly<Record<string, string>>,
): ListQuery {
  return { ...query, filtro: { ...filtro, ...(query.filtro ?? {}) } };
}

@Injectable({ providedIn: 'root' })
export class ProtocolFacade {
  private readonly cases = inject(CaseClient);
  private readonly clock = inject(RaitClock);

  readonly intake = createListFacade<RaitCase>(
    (query) => this.cases.listRaitCase(query),
    this.clock,
  );
  readonly pendencias = createListFacade<RaitPendingContent>(
    (query) => this.loadPendingPage(query),
    this.clock,
  );
  readonly remessas = createListFacade<RaitCase>(
    (query) => this.loadRemittancesPage(query),
    this.clock,
  );
  readonly redirecionamentos = createListFacade<RaitRedirect>(
    (query) => this.cases.listRaitRedirect(query),
    this.clock,
  );
  /** Caso alvo do termo de desistência; `empty` quando o protocolo não existe (ficha 024). */
  readonly desistenciaCaso = createReadStore<RaitCase | null>(this.clock);
  readonly command = createCommandRunner();

  private readonly pendingCases = signal<ReadonlyMap<string, RaitCase>>(
    new Map(),
  );
  private readonly remittanceDeadlines = signal<
    ReadonlyMap<string, RaitDeadline>
  >(new Map());
  /** Casos das pendências carregadas (join por `case_id`). */
  readonly pendenciasCaso = computed(() => this.pendingCases());
  /** Prazo `T-REM10` por `case_id` das remessas (só o que o servidor calculou). */
  readonly remessasPrazo = computed(() => this.remittanceDeadlines());

  constructor() {
    bindStream({
      types: ['case.changed'],
      onEvent: () => this.invalidateAll(),
      slots: [
        this.intake,
        this.pendencias,
        this.remessas,
        this.redirecionamentos,
        this.desistenciaCaso,
      ],
    });
  }

  // --- leituras (§4.3) -------------------------------------------------------------------

  loadIntake(query: ListQuery = {}): Promise<void> {
    return this.intake.load(mergeFilter(query, { state: INTAKE_STATE }));
  }

  loadPending(query: ListQuery = {}): Promise<void> {
    return this.pendencias.load(query);
  }

  loadRemittances(query: ListQuery = {}): Promise<void> {
    return this.remessas.load(mergeFilter(query, { state: REMITTANCE_STATE }));
  }

  loadRedirects(query: ListQuery = {}): Promise<void> {
    return this.redirecionamentos.load(query);
  }

  /** Ficha 024: `listRaitCase { q: protocol }` → `protocol_number` igual (case-insensitive). */
  findCaseByProtocol(protocol: string): Promise<void> {
    const needle = protocol.trim();
    return this.desistenciaCaso.load(
      needle,
      async () => {
        const page = await this.cases.listRaitCase({ q: needle });
        return (
          page.items.find(
            (item) =>
              item.protocol_number.toLocaleLowerCase() ===
              needle.toLocaleLowerCase(),
          ) ?? null
        );
      },
      { emptyWhen: (value) => value === null },
    );
  }

  private async loadPendingPage(
    query: ListQuery,
  ): Promise<ListPage<RaitPendingContent>> {
    const page = await this.cases.listRaitPendingContent(query);
    const items = page.items.filter(
      (item) => item.outcome === null || item.outcome === undefined,
    );
    const ids = [...new Set(items.map((item) => item.case_id))];
    const fetched = await Promise.all(
      ids.map((id) => this.cases.getRaitCase(id)),
    );
    this.pendingCases.set(new Map(fetched.map((item) => [item.id, item])));
    return { ...page, items, total: items.length };
  }

  private async loadRemittancesPage(
    query: ListQuery,
  ): Promise<ListPage<RaitCase>> {
    const [page, deadlines] = await Promise.all([
      this.cases.listRaitCase(query),
      this.cases.listRaitDeadline({
        filtro: { timer_code: REMITTANCE_TIMER_CODE },
      }),
    ]);
    const byCase = new Map<string, RaitDeadline>();
    for (const deadline of deadlines.items) {
      if (!byCase.has(deadline.case_id)) byCase.set(deadline.case_id, deadline);
    }
    this.remittanceDeadlines.set(byCase);
    return page;
  }

  private invalidateAll(): void {
    for (const slot of [
      this.intake,
      this.pendencias,
      this.remessas,
      this.redirecionamentos,
    ]) {
      if (slot.key() === null) continue;
      slot.invalidate();
      refreshIfLoaded(slot);
    }
    if (this.desistenciaCaso.key() !== null) {
      this.desistenciaCaso.invalidate();
      refreshIfLoaded(this.desistenciaCaso);
    }
  }

  // --- comandos (§3.5; M8) -----------------------------------------------------------------

  protocol(body: CreateRaitCaseDto): Promise<CommandOutcome<RaitCase>> {
    return this.command.run('rait-case:protocol', () =>
      this.cases.protocol(body),
    );
  }

  resolvePendingContent(
    pendingId: string,
    body: CommandBody & { outcome: RaitPendingContentOutcome },
  ): Promise<CommandOutcome<RaitPendingContent>> {
    return this.command.run('rait-case:resolve-pending-content', () =>
      this.cases.resolvePendingContent(
        pendingId,
        body,
        this.cases.etagOf('pending-contents', pendingId),
      ),
    );
  }

  remitJari(
    caseId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitCase>> {
    return this.command.run('rait-case:remit-jari', () =>
      this.cases.remitJari(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }

  receiveJudgingBody(
    caseId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitCase>> {
    return this.command.run('rait-case:receive-judging-body', () =>
      this.cases.receiveJudgingBody(
        caseId,
        body,
        this.cases.etagOf('cases', caseId),
      ),
    );
  }

  redirect(body: CreateRaitRedirectDto): Promise<CommandOutcome<RaitRedirect>> {
    return this.command.run('rait-case:redirect', () =>
      this.cases.redirect(body),
    );
  }

  withdraw(
    caseId: string,
    body: CommandBody & { withdrawal_document_id: string },
  ): Promise<CommandOutcome<RaitCase>> {
    return this.command.run('rait-case:withdraw', () =>
      this.cases.withdraw(caseId, body, this.cases.etagOf('cases', caseId)),
    );
  }
}
