// CTG-0002 §4.8 (R-0008, TASK-0005) — porta "a entidade já foi aplicada no
// servidor?", consumida por CTG-0003 (evidência) e definida aqui porque é do
// núcleo `ops`.
import type { Transaction } from '@stynx-nyx/data';

export interface AppliedEntityPort {
  /** `'ait'`, `'administrative-measure'`, … */
  readonly entityType: string;
  isApplied(entityId: string, tx: Transaction): Promise<boolean>;
}

export const APPLIED_ENTITY_PORTS: unique symbol = Symbol(
  'APPLIED_ENTITY_PORTS',
);
