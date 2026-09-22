// Ligação facade × `SseService` (contrato CTG-0002b §4.2; M9/M10): cada facade assina, na
// construção, `events$` (só os tipos da sua linha da tabela §4.2), `tick$` e `resync$`;
// `tick$`/`resync$` → `refresh()` de todo slot com `key` não nula. A facade garante que o fluxo
// está aberto (`connect()` é idempotente e só é chamado quando o serviço está `idle`, para não
// sobrepor o escopo `{ caseId, sessionId }` que uma página L2 tenha pedido). As assinaturas
// morrem com o injetor (`DestroyRef`).
import { DestroyRef, inject } from '@angular/core';
import {
  SseService,
  type RaitStreamEvent,
  type RaitStreamType,
} from '../../core/sse.service';
import type { ReadSlot } from './read-store';

export interface Refreshable {
  refresh(): Promise<void>;
}

export type RefreshableSlot<T = unknown> = ReadSlot<T> & Refreshable;

export interface StreamBinding {
  /** Tipos de evento da linha da facade na tabela §4.2. */
  readonly types: readonly RaitStreamType[];
  readonly onEvent: (event: RaitStreamEvent) => void;
  /** Slots a recarregar em `tick$`/`resync$` quando carregados. */
  readonly slots: readonly RefreshableSlot[];
}

/** Recarrega o slot se ele tem chave (foi carregado). */
export function refreshIfLoaded(slot: RefreshableSlot): void {
  if (slot.key() !== null) void slot.refresh();
}

/** A chamar no construtor da facade (contexto de injeção). */
export function bindStream(binding: StreamBinding): SseService {
  const sse = inject(SseService);
  const destroyRef = inject(DestroyRef);
  const types = new Set<RaitStreamType>(binding.types);
  const refreshAll = (): void => binding.slots.forEach(refreshIfLoaded);
  const subscriptions = [
    sse.events$.subscribe((event) => {
      if (types.has(event.type)) binding.onEvent(event);
    }),
    sse.tick$.subscribe(refreshAll),
    sse.resync$.subscribe(refreshAll),
  ];
  destroyRef.onDestroy(() => subscriptions.forEach((s) => s.unsubscribe()));
  if (sse.status() === 'idle') sse.connect();
  return sse;
}

/** `event.data.caseId` quando presente; senão `aggregate.id` de um agregado `case`. */
export function caseIdOf(event: RaitStreamEvent): string | null {
  const data = event.data as { caseId?: unknown };
  if (typeof data.caseId === 'string') return data.caseId;
  return event.aggregate.kind === 'case' ? event.aggregate.id : null;
}

export function sessionIdOf(event: RaitStreamEvent): string | null {
  const data = event.data as { sessionId?: unknown };
  return typeof data.sessionId === 'string' ? data.sessionId : null;
}

export function batchIdOf(event: RaitStreamEvent): string | null {
  const data = event.data as { batchId?: unknown };
  return typeof data.batchId === 'string' ? data.batchId : null;
}
