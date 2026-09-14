// Motor de prazos: ciclo de vida de um timer (rait-deadline-engine.md §3),
// contagem da §2 e varredura da §5, sobre as portas `Clock`, `Calendar`,
// `TimerCatalog` e `TimerStore` (CTG-0001 §5). Sem rota, sem job, sem banco e
// sem `Date.now()`.
import { randomUUID } from 'node:crypto';

import { DeadlineError } from './errors.js';
import {
  addCalendarDays,
  addCalendarMonths,
  addCalendarYears,
} from './local-date.js';
import type {
  ArmInput,
  Calendar,
  Clock,
  Deadline,
  DeadlineEngine,
  DeadlineEvents,
  ExpiryEffect,
  ExpiryKind,
  LocalDate,
  SuspensionAct,
  SweepReport,
  TimelinessInput,
  TimelinessResult,
  TimerCatalog,
  TimerCode,
  TimerDefinition,
  TimerRescheduledData,
  TimerStore,
} from './types.js';

/**
 * Piso legal da data-limite impressa de NA/NP: 30 dias corridos da expedição /
 * ciência (`inf.infraction_timer_ref.start_mark` de T-DEF e T-NP-VENC, "piso 30
 * dias"; CTB arts. 281-A e 282 §4º; RN-RAIT-101, RN-RAIT-102).
 */
const NOTICE_MINIMUM_DAYS = 30;

/** Lote padrão da varredura (rait-deadline-engine.md §5). */
const SWEEP_LIMIT = 500;

/**
 * Timers de extinção: a suspensão por ato é vedada sobre eles
 * (rait-deadline-engine.md §2, "Suspensão"; CTG-0001 §4 e §5 nota 5).
 */
const SUSPENSION_FORBIDDEN: ReadonlySet<TimerCode> = new Set([
  'T-DEC',
  'T-JUL-24M',
  'T-PAR-3A',
  'T-PRESC-5A',
]);

/**
 * Timers prorrogáveis (CTG-0001 §5.2, emenda janela 2): só `T-DIL` — nenhum
 * dos outros 17 códigos declara prorrogação em `inf.infraction_timer_ref`.
 */
const EXTENDABLE: ReadonlySet<TimerCode> = new Set(['T-DIL']);

export interface DeadlineEngineDeps {
  clock: Clock;
  calendar: Calendar;
  catalog: TimerCatalog;
  store: TimerStore;
  /**
   * Porta de publicação de `DeadlineEvent` (CTG-0001 §5.2, emenda janela 2):
   * obrigatória — a biblioteca nunca engole erro de publicação.
   */
  events: DeadlineEvents;
  /**
   * Fuso do tenant para `clock.today()` (`auth.tenants.timezone`,
   * rait-deadline-engine.md §5). Omitido, o relógio injetado responde com o seu
   * próprio fuso (é o caso de `FixedClock`).
   */
  tenantTz?: string;
}

function internal(message: string, context: Record<string, unknown>) {
  return new DeadlineError('RAIT.INTERNAL', { status: 500, context, message });
}

/** `expiry_kind` efetivo: `a_confirmar` vence como alerta (H.46, OD-301/304). */
function effectiveExpiryKind(definition: TimerDefinition): ExpiryKind {
  return definition.status === 'a_confirmar' ? 'alerta' : definition.expiryKind;
}

function isObservableEffect(kind: ExpiryKind): kind is ExpiryEffect {
  return (
    kind === 'transicao' ||
    kind === 'alerta' ||
    kind === 'marco' ||
    kind === 'regra'
  );
}

class Engine implements DeadlineEngine {
  private readonly clock: Clock;
  private readonly calendar: Calendar;
  private readonly catalog: TimerCatalog;
  private readonly store: TimerStore;
  private readonly events: DeadlineEvents;
  private readonly tenantTz: string;

  constructor(deps: DeadlineEngineDeps) {
    this.clock = deps.clock;
    this.calendar = deps.calendar;
    this.catalog = deps.catalog;
    this.store = deps.store;
    this.events = deps.events;
    this.tenantTz = deps.tenantTz ?? '';
  }

  /** `occurredAt` de `clock.now()` em ISO-8601 (CTG-0001 §5.2 nota 5). */
  private async publishRescheduled(
    deadline: Deadline,
    data: TimerRescheduledData,
  ): Promise<void> {
    await this.events.publish({
      type: 'inf.timer.rescheduled',
      domainEvent: 'TIMER_REPROGRAMADO',
      occurredAt: this.clock.now().toISOString(),
      tenantId: deadline.tenantId,
      aggregate: { kind: 'clock', id: deadline.id },
      data,
    });
  }

  /** Soma `days` dias úteis ao marco (o dia do marco não conta). */
  private async addBusinessDays(
    startOn: LocalDate,
    days: number,
    tenantId: string,
  ): Promise<LocalDate> {
    let cursor = startOn;
    for (let counted = 0; counted < days; counted += 1) {
      cursor = await this.calendar.nextBusinessDay(cursor, tenantId);
    }
    return cursor;
  }

  /** `due_on = próximo dia útil >= raw_due_on` (nunca antecipa). */
  private async roundForward(
    rawDueOn: LocalDate,
    tenantId: string,
  ): Promise<LocalDate> {
    return (await this.calendar.isBusinessDay(rawDueOn, tenantId))
      ? rawDueOn
      : this.calendar.nextBusinessDay(rawDueOn, tenantId);
  }

  private async rawDueFor(
    definition: TimerDefinition,
    startOn: LocalDate,
    duration: number,
    tenantId: string,
  ): Promise<LocalDate> {
    switch (definition.durationUnit) {
      case 'dias_corridos':
        return addCalendarDays(startOn, duration);
      // SLA-30 é meta operacional contada em dias úteis
      // (`start_mark`: "protocolo (defesa) / entrada na JARI (dias úteis)").
      case 'dias_uteis':
      case 'meta':
        return this.addBusinessDays(startOn, duration, tenantId);
      case 'meses':
        return addCalendarMonths(startOn, duration);
      case 'anos':
        return addCalendarYears(startOn, duration);
      default:
        throw internal('Unidade de prazo sem regra de contagem.', {
          timerCode: definition.code,
          durationUnit: definition.durationUnit,
        });
    }
  }

  async computeDue(
    code: TimerCode,
    startOn: LocalDate,
    tenantId: string,
    printedDeadline?: LocalDate,
  ): Promise<{ rawDueOn: LocalDate; dueOn: LocalDate }> {
    const definition = this.catalog.get(code);
    // Data impressa (T-DEF, T-NP-VENC): o vencimento é a data da NA/NP e o
    // motor nunca a substitui por cálculo próprio (CTG-0001 §5 nota 4).
    if (definition.durationUnit === 'data_impressa') {
      if (!printedDeadline) {
        throw internal('Timer de data impressa exige printedDeadline.', {
          timerCode: code,
        });
      }
      return { rawDueOn: printedDeadline, dueOn: printedDeadline };
    }
    if (definition.durationValue === null) {
      throw internal('Timer sem duração em inf.infraction_timer_ref.', {
        timerCode: code,
      });
    }
    const rawDueOn = await this.rawDueFor(
      definition,
      startOn,
      definition.durationValue,
      tenantId,
    );
    return { rawDueOn, dueOn: await this.roundForward(rawDueOn, tenantId) };
  }

  async arm(input: ArmInput): Promise<Deadline> {
    const definition = this.catalog.get(input.code);
    if (definition.durationUnit === 'data_impressa') {
      this.assertPrintedDeadline(input);
    }
    // Idempotência por (owner_id, código, started_on) — é
    // `ux_inf_infraction_timer_arm` (rait-deadline-engine.md §3).
    const existing = await this.store.findByArm(
      input.tenantId,
      input.ownerId,
      input.code,
      input.startOn,
    );
    if (existing) return existing;

    const { rawDueOn, dueOn } = await this.computeDue(
      input.code,
      input.startOn,
      input.tenantId,
      input.printedDeadline,
    );
    return this.store.insert({
      id: randomUUID(),
      tenantId: input.tenantId,
      ownerKind: input.ownerKind,
      ownerId: input.ownerId,
      code: input.code,
      instance: input.instance ?? null,
      startBasis: input.startBasis,
      startedOn: input.startOn,
      rawDueOn,
      dueOn,
      ceilingOn: null,
      businessDays: definition.durationUnit === 'dias_uteis',
      status: 'armado',
      satisfiedAt: null,
      expiredAt: null,
      cancelReason: null,
      suspendedByActId: null,
      suspendedDays: 0,
      extensionCount: 0,
      extensionReason: null,
      legalBasis: input.legalBasis,
    });
  }

  /** Piso de 30 dias corridos da data-limite impressa (CTG-0001 §4). */
  private assertPrintedDeadline(input: ArmInput): void {
    if (!input.printedDeadline) {
      throw internal('Timer de data impressa exige printedDeadline.', {
        timerCode: input.code,
      });
    }
    const minimum = addCalendarDays(input.startOn, NOTICE_MINIMUM_DAYS);
    if (input.printedDeadline < minimum) {
      throw new DeadlineError('RAIT.INFRACTION_NOTICE_DEADLINE_SHORT', {
        status: 422,
        context: { printedDeadline: input.printedDeadline, minimum },
        message:
          'A data-limite impressa é menor que o piso de 30 dias da ciência.',
      });
    }
  }

  private async open(id: string): Promise<Deadline> {
    const deadline = await this.store.findById(id);
    if (!deadline) {
      throw internal('Timer inexistente.', { deadlineId: id });
    }
    return deadline;
  }

  /**
   * `satisfazer(id, evento)`: o timer sai da varredura e nunca é apagado. O
   * motivo vive no envelope do evento, não em coluna de `inf.infraction_timer`
   * (CTG-0001 §1.2).
   */
  async satisfy(id: string, _reason: string): Promise<void> {
    const deadline = await this.open(id);
    if (deadline.status !== 'armado') return;
    await this.store.update({
      ...deadline,
      status: 'satisfeito',
      satisfiedAt: this.clock.now(),
    });
  }

  async cancel(id: string, reason: string): Promise<void> {
    const deadline = await this.open(id);
    if (deadline.status !== 'armado') return;
    await this.store.update({
      ...deadline,
      status: 'cancelado',
      cancelReason: reason,
    });
  }

  async reschedule(id: string, act: SuspensionAct): Promise<Deadline> {
    const deadline = await this.open(id);
    if (SUSPENSION_FORBIDDEN.has(deadline.code)) {
      throw new DeadlineError('RAIT.SUSPENSION_LEGAL_TIMER', {
        status: 422,
        context: { timerCode: deadline.code },
        message: 'A suspensão é vedada sobre prazos de extinção.',
      });
    }
    if (deadline.status !== 'armado') {
      throw internal('Só um timer armado pode ser reprogramado.', {
        deadlineId: id,
        status: deadline.status,
      });
    }
    const definition = this.catalog.get(deadline.code);
    const suspendedDays = deadline.suspendedDays + act.days;
    // Reprograma somando os dias suspensos na mesma unidade do timer
    // (rait-deadline-engine.md §2; CTG-0001 §5 nota 5). Em timer de data
    // impressa a data da NA/NP permanece como `raw_due_on`.
    const rawDueOn =
      definition.durationUnit === 'data_impressa'
        ? deadline.rawDueOn
        : await this.rawDueFor(
            definition,
            deadline.startedOn,
            (definition.durationValue ?? 0) + suspendedDays,
            deadline.tenantId,
          );
    const base =
      definition.durationUnit === 'data_impressa'
        ? addCalendarDays(rawDueOn, suspendedDays)
        : rawDueOn;
    const oldDueOn = deadline.dueOn;
    const updated = await this.store.update({
      ...deadline,
      rawDueOn,
      dueOn: await this.roundForward(base, deadline.tenantId),
      suspendedDays,
      suspendedByActId: act.id,
    });
    await this.publishRescheduled(updated, {
      ownerId: updated.ownerId,
      timerCode: updated.code,
      oldDueOn,
      newDueOn: updated.dueOn,
      suspensionActId: act.id,
      reason: 'suspensao',
    });
    return updated;
  }

  /**
   * Prorrogação única de `T-DIL` (CTG-0001 §5.2, emenda janela 2). Guardas,
   * nesta ordem: código não prorrogável, timer não armado, segunda
   * prorrogação. `reason` é o motivo do chamador para auditoria (como em
   * `satisfy`/`cancel`); é retido em `extensionReason` (CTG-0001 §5.2.9) — o
   * `reason` do evento publicado é sempre `'prorrogacao'`.
   */
  async extend(id: string, reason: string): Promise<Deadline> {
    const deadline = await this.open(id);
    if (!EXTENDABLE.has(deadline.code)) {
      throw new DeadlineError('RAIT.DEADLINE_LEGAL_READONLY', {
        status: 422,
        context: { timerCode: deadline.code },
        message: 'Tentativa de editar prazo legal ou marco de ciência.',
      });
    }
    if (deadline.status !== 'armado') {
      throw internal('Só um timer armado pode ser prorrogado.', {
        deadlineId: id,
        status: deadline.status,
      });
    }
    if (deadline.extensionCount >= 1) {
      throw new DeadlineError('RAIT.INQUIRY_EXTENSION_LIMIT', {
        status: 422,
        context: {
          ownerId: deadline.ownerId,
          timerCode: deadline.code,
          extensionCount: deadline.extensionCount,
        },
        message: 'A prorrogação é única (extension_count <= 1).',
      });
    }
    const definition = this.catalog.get(deadline.code);
    // Mesma duração/unidade da definição, contada do due_on vigente (o marco
    // da soma é o vencimento, não o started_on — CTG-0001 §5.2, "mesmo prazo").
    const rawDueOn = await this.rawDueFor(
      definition,
      deadline.dueOn,
      definition.durationValue ?? 0,
      deadline.tenantId,
    );
    const oldDueOn = deadline.dueOn;
    const newDueOn = await this.roundForward(rawDueOn, deadline.tenantId);
    const updated = await this.store.update({
      ...deadline,
      rawDueOn,
      dueOn: newDueOn,
      extensionCount: deadline.extensionCount + 1,
      extensionReason: reason,
    });
    await this.publishRescheduled(updated, {
      ownerId: updated.ownerId,
      timerCode: updated.code,
      oldDueOn,
      newDueOn,
      suspensionActId: null,
      reason: 'prorrogacao',
    });
    return updated;
  }

  async timeliness(input: TimelinessInput): Promise<TimelinessResult> {
    const deadline = await this.store.findOpen(
      input.tenantId,
      input.ownerId,
      input.code,
    );
    if (!deadline) {
      throw internal('Nenhum timer aberto para comparar a tempestividade.', {
        timerCode: input.code,
        ownerId: input.ownerId,
      });
    }
    // `marco_da_peça <= due_on` do timer aberto (rait-deadline-engine.md §2).
    return {
      timely: input.pieceMarkOn <= deadline.dueOn,
      dueOn: deadline.dueOn,
      basis: deadline.legalBasis,
    };
  }

  async sweep(tenantId: string, limit = SWEEP_LIMIT): Promise<SweepReport> {
    const today = this.clock.today(this.tenantTz);
    // A comparação é por data: vence quem tem `due_on < hoje` no fuso do tenant.
    const due = await this.store.listDue(
      tenantId,
      addCalendarDays(today, -1),
      limit,
    );
    const expired: Array<SweepReport['expired'][number]> = [];
    let skipped = 0;
    for (const deadline of due) {
      const kind = effectiveExpiryKind(this.catalog.get(deadline.code));
      // `guarda` e `indicador` não vencem (rait-deadline-engine.md §3).
      if (!isObservableEffect(kind)) {
        skipped += 1;
        continue;
      }
      await this.store.update({
        ...deadline,
        status: 'vencido',
        expiredAt: this.clock.now(),
      });
      await this.events.publish({
        type: 'inf.timer.expired',
        domainEvent: 'TIMER_VENCIDO',
        occurredAt: this.clock.now().toISOString(),
        tenantId: deadline.tenantId,
        aggregate: { kind: 'clock', id: deadline.id },
        data: {
          ownerKind: deadline.ownerKind,
          ownerId: deadline.ownerId,
          timerCode: deadline.code,
          dueOn: deadline.dueOn,
          effect: kind,
        },
      });
      expired.push({
        id: deadline.id,
        code: deadline.code,
        ownerKind: deadline.ownerKind,
        ownerId: deadline.ownerId,
        dueOn: deadline.dueOn,
        effect: kind,
      });
    }
    return { tenantId, scanned: due.length, expired, skipped };
  }
}

export function createDeadlineEngine(deps: DeadlineEngineDeps): DeadlineEngine {
  return new Engine(deps);
}
