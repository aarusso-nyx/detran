// Guarda de transição do agregado da infração: código puro, sem rota, sem banco
// e sem relógio (work/rounds/R-0006/contracts/CTG-0001.md §3.1 e §4; decisão M8
// do plano de R-0006). `resolveTransition` casa a linha de
// `inf.infraction_transition_ref`; `assertTransition` aplica a matriz de erro da
// §4 na ordem de precedência declarada.
import { RaitError } from '../errors.js';
import {
  INFRACTION_CLOSED_TRIGGERS,
  INFRACTION_TERMINAL_STATES,
  INFRACTION_TRANSITION_QUALIFIERS,
  INFRACTION_TRANSITIONS,
} from './infraction.transitions.js';
import type {
  InfractionTransition,
  InfractionTriggerKind,
} from './infraction.transitions.js';

const CLOSED_STATE = 'INSTANCIA_ENCERRADA';

export interface InfractionStateSnapshot {
  state: string;
  substate: string | null;
}

export interface InfractionTrigger {
  kind: InfractionTriggerKind;
  /** Token canônico do evento, timer ou ato (sem o qualificador). */
  code: string;
  /** Discriminante entre linhas de mesmo `(from, trigger)` (§6.1). */
  qualifier?: string;
}

/**
 * Gatilhos modelados por uma linha: o token principal de `trigger_code` e os
 * alternativos que a mesma linha lista ("RAIT_DECISAO_PUBLICADA(nao_conhecido) |
 * ENCERRADO_DESISTENCIA"), sem os qualificadores entre parênteses (§3).
 */
function modelledCodes(triggerCode: string): string[] {
  const withoutQualifiers = triggerCode.replace(/\([^)]*\)/g, ' ');
  return [...withoutQualifiers.matchAll(/[A-Z0-9][A-Z0-9_-]{2,}/g)].map(
    (match) => match[0],
  );
}

function matches(
  row: InfractionTransition,
  current: InfractionStateSnapshot,
  trigger: InfractionTrigger,
): boolean {
  // Nulo na linha de referência = "qualquer" (§3.1).
  if (row.fromState !== null && row.fromState !== current.state) return false;
  if (row.fromSubstate !== null && row.fromSubstate !== current.substate) {
    return false;
  }
  if (row.triggerKind !== trigger.kind) return false;
  return modelledCodes(row.triggerCode).includes(trigger.code);
}

function qualifiersOf(row: InfractionTransition): readonly string[] {
  return INFRACTION_TRANSITION_QUALIFIERS[row.id] ?? [];
}

/**
 * Devolve a linha `vigente` que casa `(state, substate, gatilho, qualifier)`, ou
 * `null`. Nunca devolve linha com `status !== 'vigente'`: 27 e 38 vencem como
 * alerta no motor de prazos e 41 é irrecebível (§3.2).
 */
export function resolveTransition(
  current: InfractionStateSnapshot,
  trigger: InfractionTrigger,
): InfractionTransition | null {
  const candidates = INFRACTION_TRANSITIONS.filter(
    (row) => row.status === 'vigente' && matches(row, current, trigger),
  );
  if (candidates.length === 0) return null;
  if (trigger.qualifier !== undefined) {
    return (
      candidates.find((row) =>
        qualifiersOf(row).includes(trigger.qualifier as string),
      ) ?? null
    );
  }
  return candidates.find((row) => qualifiersOf(row).length === 0) ?? null;
}

/**
 * Mesma resolução, com a matriz de erro da §4 na precedência: terminal →
 * encerrada sem revisão → estado inválido.
 */
export function assertTransition(
  current: InfractionStateSnapshot,
  trigger: InfractionTrigger,
): InfractionTransition {
  if (
    current.state !== CLOSED_STATE &&
    INFRACTION_TERMINAL_STATES.includes(current.state)
  ) {
    throw new RaitError('RAIT.INFRACTION_TERMINAL', {
      status: 409,
      context: { infractionState: current.state },
      message: 'A infração está em estado terminal e não admite novos atos.',
    });
  }
  if (
    current.state === CLOSED_STATE &&
    !INFRACTION_CLOSED_TRIGGERS.includes(trigger.code)
  ) {
    throw new RaitError('RAIT.INFRACTION_CLOSED_NO_REVISION', {
      status: 409,
      context: { infractionState: current.state },
      message:
        'Não há canal de revisão após o encerramento da instância: só pagamento e cobrança.',
    });
  }
  const resolved = resolveTransition(current, trigger);
  if (!resolved) {
    throw new RaitError('RAIT.INFRACTION_STATE_INVALID', {
      status: 409,
      context: {
        currentState: current.state,
        currentSubstate: current.substate,
        trigger: trigger.code,
      },
      message: 'A infração não está em um estado que admita este gatilho.',
    });
  }
  return resolved;
}
