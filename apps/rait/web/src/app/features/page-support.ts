// Apoio comum às páginas L2 (contrato CTG-0002b §6 "regras comuns"; guia §3.3; M8): fila de
// confirmação com efeito jurídico (uma ação pendente por vez, apresentada por um único
// `<stynx-confirm-dialog>` por página — sempre renderizado, aberto enquanto há ação pendente —,
// com a frase `rait.screens.<slug>.confirm.<x>` da ficha §6), corpo provisório dos comandos e
// composição de status de leitura. Fica em `features/` porque só as páginas o usam (a fronteira
// desta CTG não toca `shared/**`/`core/**`).
import { signal, type Signal } from '@angular/core';
import type { ReadStatus } from '../data/facades/read-store';

export interface PendingAction {
  /** Identificador da ação na tela (`data-action`). */
  readonly action: string;
  /** `rait.screens.<slug>.confirm.<x>` — frase do efeito jurídico da ficha §6. */
  readonly confirmKey: string;
  /** `rait.screens.<slug>.cmd.<x>` — rótulo do botão de confirmação. */
  readonly labelKey: string;
  /** Chamada à facade (`facade.<comando>(…)`), só após a confirmação. */
  readonly run: () => Promise<unknown>;
}

export interface ConfirmQueue {
  /** Ação apresentada no diálogo (a última pedida). */
  readonly pending: Signal<PendingAction | null>;
  /** Diálogo aberto? (`dismiss` fecha sem descartar a ação; `request` reabre com outra). */
  readonly open: Signal<boolean>;
  /** Abre o diálogo com a ação; substitui a pendente. */
  request(action: PendingAction): void;
  /** Fecha sem executar. */
  dismiss(): void;
  /** Fecha e executa a ação pendente (uma única vez). */
  confirm(): Promise<void>;
}

export function createConfirmQueue(): ConfirmQueue {
  const pending = signal<PendingAction | null>(null);
  const open = signal(false);
  return {
    pending: pending.asReadonly(),
    open: open.asReadonly(),
    request(action: PendingAction): void {
      pending.set(action);
      open.set(true);
    },
    dismiss(): void {
      open.set(false);
    },
    async confirm(): Promise<void> {
      const action = pending();
      pending.set(null);
      open.set(false);
      if (action !== null) await action.run();
    },
  };
}

/**
 * Corpo provisório de comando (M8): as facades tipam os comandos com os DTOs CRUD gerados até o
 * contrato `.commands` de R-0007 CTG-0004 trocar o tipo (§3.5). A página fornece somente os
 * campos do formulário (§9); os campos de servidor (ids, carimbos, hashes, ator) não existem no
 * cliente e NÃO são inventados — hoje o cliente lança `RaitCommandUnavailableError` antes de
 * qualquer requisição. Único ponto de asserção de tipo das páginas.
 */
export function provisionalBody<T>(fields: Partial<T>): T {
  return fields as T;
}

/** Título dos diálogos de confirmação (semente). */
export const CONFIRM_TITLE_KEY = 'rait.common.confirm';
export const LOADING_KEY = 'rait.states.loading';
export const EMPTY_KEY = 'rait.states.empty';

/**
 * Status apresentado por uma aba/página que depende de mais de um slot: o primeiro slot que não
 * está pronto manda (carregando/erro do caso antes da lista da aba); todos prontos → `'ready'`;
 * o último decide `'empty'`.
 */
export function combineStatus(...statuses: readonly ReadStatus[]): ReadStatus {
  for (const status of statuses) {
    if (status !== 'ready' && status !== 'empty' && status !== 'idle') {
      return status;
    }
  }
  return statuses[statuses.length - 1] ?? 'idle';
}

/** `loading`/`empty` já apresentados por um componente da página (`QueueTable`): só erros. */
export function errorsOnly(status: ReadStatus): ReadStatus {
  return status === 'loading' || status === 'empty' ? 'idle' : status;
}
