import type { Transaction } from '@stynx-nyx/data';
import { DetranError } from '@detran/shared';

export type RaitCaseTransitionInput = {
  readonly tenantId: string;
  readonly caseId: string;
  readonly actorId: string;
  readonly expectedFrom:
    'DISTRIBUIDO' | 'PRONTO_P_DECISAO' | 'PAUTADO' | 'JULGADO_SESSAO';
  readonly idempotencyKey: string;
};

/**
 * Public, transaction-owned case boundary for worklist and session commands.
 * The caller owns the transaction and its HTTP record; this port owns only the
 * case lock, state/version/event and contractual outbox record.
 */
export class RaitCaseTransitionPort {
  async acceptBatchItem(
    tx: Transaction,
    input: RaitCaseTransitionInput,
  ): Promise<void> {
    await this.transition(tx, input, 'EM_INSTRUCAO', 'rait.case.assigned');
  }

  async scheduleForSession(
    tx: Transaction,
    input: RaitCaseTransitionInput,
  ): Promise<void> {
    await this.transition(tx, input, 'PAUTADO', 'rait.case.scheduled');
  }

  async returnToDecisionQueue(
    tx: Transaction,
    input: RaitCaseTransitionInput,
  ): Promise<void> {
    await this.transition(tx, input, 'PRONTO_P_DECISAO', 'rait.case.returned');
  }

  async proclaimSessionDecision(
    tx: Transaction,
    input: RaitCaseTransitionInput,
  ): Promise<void> {
    await this.transition(
      tx,
      input,
      'JULGADO_SESSAO',
      'rait.case.session-decision.proclaimed',
    );
  }

  async publishSessionDecision(
    tx: Transaction,
    input: RaitCaseTransitionInput,
  ): Promise<void> {
    await this.transition(
      tx,
      input,
      'COMUNICADO',
      'rait.case.session-decision.published',
    );
  }

  private async transition(
    tx: Transaction,
    input: RaitCaseTransitionInput,
    to:
      | 'EM_INSTRUCAO'
      | 'PRONTO_P_DECISAO'
      | 'PAUTADO'
      | 'JULGADO_SESSAO'
      | 'COMUNICADO',
    topic: string,
  ): Promise<void> {
    const locked = await tx.query<{
      readonly id: string;
      readonly state: string;
      readonly version: number;
    }>(
      'select id, state, version from inf.rait_case where tenant_id = $1 and id = $2 for update',
      [input.tenantId, input.caseId],
    );
    const item = locked.rows[0];
    if (!item) this.fail('RAIT.TENANT_MISMATCH', 404, { caseId: input.caseId });
    if (item.state !== input.expectedFrom)
      this.fail('RAIT.CASE_STATE_INVALID', 409, {
        caseId: input.caseId,
        currentState: item.state,
        allowedStates: [input.expectedFrom],
      });
    const updated = await tx.query<{
      readonly id: string;
      readonly version: number;
    }>(
      'update inf.rait_case set state = $1, version = version + 1, last_movement_at = clock_timestamp(), updated_at = clock_timestamp() where tenant_id = $2 and id = $3 returning id, version',
      [to, input.tenantId, input.caseId],
    );
    if (!updated.rows[0])
      this.fail('RAIT.TENANT_MISMATCH', 404, { caseId: input.caseId });
    await tx.query(
      'insert into inf.rait_case_event (tenant_id, case_id, event_type, from_state, to_state, occurred_at, actor_id, payload) values ($1,$2,$3,$4,$5,clock_timestamp(),$6,$7)',
      [
        input.tenantId,
        input.caseId,
        topic,
        input.expectedFrom,
        to,
        input.actorId,
        JSON.stringify({ from: input.expectedFrom, to }),
      ],
    );
    await tx.query(
      "insert into integration.outbox (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status) values ($1,$2,'inf.rait_case',$3,$4,$5,'pending')",
      [
        input.tenantId,
        topic,
        input.caseId,
        JSON.stringify({ caseId: input.caseId, to }),
        `${input.idempotencyKey}:${topic}:${input.caseId}`,
      ],
    );
  }

  private fail(
    code: string,
    status: number,
    context: Record<string, unknown>,
  ): never {
    throw new DetranError(code, {
      status,
      message: 'A transição de caso não pode ser executada.',
      messageKey: `rait.errors.${code.replace(/^RAIT\./u, '').toLowerCase()}`,
      context,
    });
  }
}
