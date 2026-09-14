// Porta `TimerStore` em memória (ADR-0016 §2: sem acesso a banco nesta rodada;
// a persistência em `inf.infraction_timer` é de R-0007). A unicidade de
// `(tenant_id, owner_id, code, started_on)` espelha
// `ux_inf_infraction_timer_arm`.
import type { Deadline, LocalDate, TimerCode, TimerStore } from './types.js';

const OPEN: Deadline['status'] = 'armado';

export class InMemoryTimerStore implements TimerStore {
  private readonly rows = new Map<string, Deadline>();

  async insert(deadline: Deadline): Promise<Deadline> {
    this.rows.set(deadline.id, { ...deadline });
    return { ...deadline };
  }

  async findById(id: string): Promise<Deadline | null> {
    const row = this.rows.get(id);
    return row ? { ...row } : null;
  }

  async findOpen(
    tenantId: string,
    ownerId: string,
    code: TimerCode,
  ): Promise<Deadline | null> {
    for (const row of this.rows.values()) {
      if (
        row.tenantId === tenantId &&
        row.ownerId === ownerId &&
        row.code === code &&
        row.status === OPEN
      ) {
        return { ...row };
      }
    }
    return null;
  }

  async findByArm(
    tenantId: string,
    ownerId: string,
    code: TimerCode,
    startedOn: LocalDate,
  ): Promise<Deadline | null> {
    for (const row of this.rows.values()) {
      if (
        row.tenantId === tenantId &&
        row.ownerId === ownerId &&
        row.code === code &&
        row.startedOn === startedOn
      ) {
        return { ...row };
      }
    }
    return null;
  }

  /** Predicado da varredura: `status='armado'` e `due_on <= onOrBefore`. */
  async listDue(
    tenantId: string,
    onOrBefore: LocalDate,
    limit: number,
  ): Promise<Deadline[]> {
    return [...this.rows.values()]
      .filter(
        (row) =>
          row.tenantId === tenantId &&
          row.status === OPEN &&
          row.dueOn <= onOrBefore,
      )
      .sort((left, right) =>
        left.dueOn === right.dueOn
          ? left.id.localeCompare(right.id)
          : left.dueOn.localeCompare(right.dueOn),
      )
      .slice(0, limit)
      .map((row) => ({ ...row }));
  }

  async update(deadline: Deadline): Promise<Deadline> {
    this.rows.set(deadline.id, { ...deadline });
    return { ...deadline };
  }
}
