// QueueFacade (contrato CTG-0002b §4.2/§4.3; M9): módulos fila e painel. `filaDefesa` = casos
// ADMITIDO da defesa prévia (ficha 004, F-DP-2) na ordem recebida ([RN-RAIT-141]);
// `filaRelator` = atribuições ativas do pool do órgão (ficha 005 — "member=me" sem fonte de
// identidade → sem filtro por membro, OD-R12-021) + `casosDaFila` (join por `case_id`,
// `getRaitCase` por id, cache do slot); `retomar` = diligências com desfecho (ficha 003) + join
// caso; `painel` = contagens de registros carregados (cap 500) — nenhum "vencendo em N dias"
// (motor de prazos, [RN-RAIT-005]; OD-R12-031). Joins leem no máximo a primeira página do
// cliente (≤ 50, guia §3.1) até OD-R12-018 trazer consulta no servidor. SSE: `case.changed` e
// `clock.flag-changed` → todas as listas; `assignment.changed` → `filaDefesa`, `filaRelator`,
// `retomar`, `painel`. Comando: `claimNext` (M8).
import { Injectable, computed, inject, signal } from '@angular/core';
import type { RaitStreamEvent } from '../../core/sse.service';
import { CaseClient } from '../api/case.client';
import { WorklistClient } from '../api/worklist.client';
import { RaitClock } from '../clock';
import type {
  CommandBody,
  ListPage,
  ListQuery,
  RaitAssignment,
  RaitCase,
  RaitInquiry,
  RaitJudgingBody,
} from '../models';
import type { ShiftSummary } from './bundles';
import { createCommandRunner, type CommandOutcome } from './command';
import { createListFacade } from './list.facade';
import { createReadStore } from './read-store';
import { bindStream, refreshIfLoaded } from './stream';

/** Ficha 004: fila da defesa prévia = casos ADMITIDO da instância `defesa_previa`. */
const DEFENSE_QUEUE_FILTER: Readonly<Record<string, string>> = {
  state: 'ADMITIDO',
  instance: 'defesa_previa',
};
const ADMITTED_STATE = 'ADMITIDO';
const INQUIRY_STATE = 'DILIGENCIA';
const ACTIVE = 'true';
const SHIFT_SUMMARY_KEY = 'shift-summary';

function mergeFilter(
  query: ListQuery,
  filtro: Readonly<Record<string, string>>,
): ListQuery {
  return { ...query, filtro: { ...filtro, ...(query.filtro ?? {}) } };
}

@Injectable({ providedIn: 'root' })
export class QueueFacade {
  private readonly cases = inject(CaseClient);
  private readonly worklist = inject(WorklistClient);
  private readonly clock = inject(RaitClock);

  readonly filaDefesa = createListFacade<RaitCase>(
    (query) => this.cases.listRaitCase(query),
    this.clock,
  );
  readonly filaRelator = createListFacade<RaitAssignment>(
    (query) => this.loadRapporteurPage(query),
    this.clock,
  );
  readonly retomar = createListFacade<RaitInquiry>(
    (query) => this.loadResumePage(query),
    this.clock,
  );
  readonly painel = createReadStore<ShiftSummary>(this.clock);
  readonly command = createCommandRunner();

  private readonly caseCache = signal<ReadonlyMap<string, RaitCase>>(new Map());
  /** Casos das atribuições/diligências carregadas (join por `case_id`, cache por id). */
  readonly casosDaFila = computed(() => this.caseCache());

  private rapporteurBody: RaitJudgingBody | null = null;

  constructor() {
    bindStream({
      types: ['case.changed', 'assignment.changed', 'clock.flag-changed'],
      onEvent: (event) => this.onStreamEvent(event),
      slots: [this.filaDefesa, this.filaRelator, this.retomar, this.painel],
    });
  }

  // --- leituras (§4.3) -------------------------------------------------------------------

  loadDefenseQueue(query: ListQuery = {}): Promise<void> {
    return this.filaDefesa.load(mergeFilter(query, DEFENSE_QUEUE_FILTER));
  }

  loadRapporteurQueue(
    orgao: RaitJudgingBody,
    query: ListQuery = {},
  ): Promise<void> {
    this.rapporteurBody = orgao;
    return this.filaRelator.load(mergeFilter(query, { instance: orgao }));
  }

  loadResumeTray(): Promise<void> {
    return this.retomar.load();
  }

  loadShiftSummary(): Promise<void> {
    return this.painel.load(SHIFT_SUMMARY_KEY, () => this.readShiftSummary());
  }

  /** `listRaitPool filtro { instance }` → `pool_id` → `listRaitAssignment filtro { pool_id, active }`. */
  private async loadRapporteurPage(
    query: ListQuery,
  ): Promise<ListPage<RaitAssignment>> {
    const { instance, ...filtro } = query.filtro ?? {};
    const orgao = instance ?? this.rapporteurBody ?? '';
    const pools = await this.worklist.listRaitPool({
      filtro: { instance: orgao },
    });
    const pool = pools.items[0] ?? null;
    const page = await this.worklist.listRaitAssignment({
      ...query,
      filtro: {
        ...filtro,
        active: ACTIVE,
        ...(pool ? { pool_id: pool.id } : {}),
      },
    });
    if (pool === null) return { ...page, items: [], total: 0 };
    await this.cacheCases(page.items.map((item) => item.case_id));
    return page;
  }

  /** Ficha 003: diligências com desfecho (respondida × expirada) + join caso. */
  private async loadResumePage(
    query: ListQuery,
  ): Promise<ListPage<RaitInquiry>> {
    const page = await this.cases.listRaitInquiry(query);
    const items = page.items.filter(
      (item) => item.outcome !== null && item.outcome !== undefined,
    );
    await this.cacheCases(items.map((item) => item.case_id));
    return { ...page, items, total: items.length };
  }

  /** Ficha 002: contagens dos registros carregados (cap 500); sequencial para que cada leitura
   * tenha uma única requisição pendente por URL. */
  private async readShiftSummary(): Promise<ShiftSummary> {
    const queued = await this.cases.listRaitCase({
      filtro: { state: ADMITTED_STATE },
    });
    const inInquiry = await this.cases.listRaitCase({
      filtro: { state: INQUIRY_STATE },
    });
    const inquiries = await this.cases.listRaitInquiry();
    const alerts = await this.worklist.listRaitClockAlert();
    return {
      queued: queued.total,
      inInquiry: inInquiry.total,
      resumable: inquiries.items.filter(
        (item) => item.outcome !== null && item.outcome !== undefined,
      ).length,
      openAlerts: alerts.items.filter(
        (item) =>
          item.acknowledged_at === null || item.acknowledged_at === undefined,
      ).length,
    };
  }

  private async cacheCases(ids: readonly string[]): Promise<void> {
    const current = this.caseCache();
    const missing = [...new Set(ids)].filter((id) => !current.has(id));
    if (missing.length === 0) return;
    const fetched = await Promise.all(
      missing.map((id) => this.cases.getRaitCase(id)),
    );
    const next = new Map(this.caseCache());
    for (const item of fetched) next.set(item.id, item);
    this.caseCache.set(next);
  }

  // --- SSE (§4.2) --------------------------------------------------------------------------

  /** Tabela §4.2: os três tipos invalidam as quatro leituras (a ordem do servidor pode mudar);
   * `case.changed`/`clock.flag-changed` também descartam o cache de casos do join. */
  private onStreamEvent(event: RaitStreamEvent): void {
    if (event.type !== 'assignment.changed') this.caseCache.set(new Map());
    for (const slot of [
      this.filaDefesa,
      this.filaRelator,
      this.retomar,
      this.painel,
    ]) {
      if (slot.key() === null) continue;
      slot.invalidate();
      refreshIfLoaded(slot);
    }
  }

  // --- comandos (§3.5; M8) -----------------------------------------------------------------

  claimNext(
    poolId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitAssignment>> {
    return this.command.run('rait-case:claim-next', () =>
      this.worklist.claimNext(
        poolId,
        body,
        this.worklist.etagOf('pools', poolId),
      ),
    );
  }
}
