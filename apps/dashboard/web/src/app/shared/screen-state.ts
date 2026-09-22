// Estado de tela (CTG-0002.md §9): os seis estados de M4 mais `ready` e `unavailable_in_version`
// (o padrão em L0 — R-0011 não tem código, logo não há cliente gerado nem facade de leitura).
import { signal } from '@angular/core';
import type { ClassifiedError } from '../core/error-boundary';
import type { FreshnessMeta } from '../core/freshness.store';

export type ScreenState<T> =
  | { readonly kind: 'unavailable_in_version' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'empty' }
  | { readonly kind: 'error'; readonly error: ClassifiedError }
  | { readonly kind: 'unavailable'; readonly freshness: FreshnessMeta }
  | { readonly kind: 'stale'; readonly freshness: FreshnessMeta }
  | { readonly kind: 'blocked_by_decision'; readonly decision: string }
  | { readonly kind: 'ready'; readonly data: T };

/** Estado padrão de toda tela em L0 (tipado na variante, para servir a qualquer `Data`). */
export const UNAVAILABLE_IN_VERSION: Extract<
  ScreenState<never>,
  { kind: 'unavailable_in_version' }
> = { kind: 'unavailable_in_version' };

/** Identificadores citados no lugar do dado enquanto a dependência não existe (§Decisões 6). */
export const L0_DEPENDENCY = 'R-0011 BP-DASH-MONITOR-001';

/**
 * Sinal gravável exposto como função: `x()` lê e `x(valor)` escreve.
 *
 * DIVERGÊNCIA registrada (relatório TASK-0005): o contrato §9 descreve `state = input<…>(…)`,
 * mas os specs do Inspector escrevem o estado chamando o próprio membro
 * (`component.state({ kind: 'ready', … })`, `component.purposeDeclared?.(true)`) — um
 * `InputSignal` ignora o argumento e nada mudaria. Este acessor mantém a leitura reativa
 * (`state()` no template continua sendo leitura de sinal) e aceita a escrita que os specs fazem.
 */
export interface MutableAccessor<S> {
  (value: S): void;
  (): S;
}

export function mutableAccessor<S>(initial: S): MutableAccessor<S> {
  const inner = signal<S>(initial);
  const accessor = (value?: S): S | void => {
    if (value === undefined) return inner();
    inner.set(value);
    return undefined;
  };
  return accessor as MutableAccessor<S>;
}
