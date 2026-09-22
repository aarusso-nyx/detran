// Aviso de comando indisponível em L0 (CTG-0002.md §9): o controle existe (a permissão é
// verdadeira), mas não há cliente gerado — o clique nunca vira requisição; vira um
// `ClassifiedError` de `unavailable_in_version` exibido pelo banner da própria página.
// O `detectChanges()` é a atualização síncrona do aviso no app sem zone.js (o clique não
// agenda ciclo próprio): nada de estado global, nada de requisição.
import { ChangeDetectorRef, inject } from '@angular/core';
import {
  classifyError,
  DashboardCommandUnavailableError,
  type ClassifiedError,
} from './error-boundary';
import { mutableAccessor, type MutableAccessor } from '../shared/screen-state';

export interface CommandNotice {
  readonly error: MutableAccessor<ClassifiedError | null>;
  unavailable(command: string): void;
}

export function createCommandNotice(): CommandNotice {
  const changeDetector = inject(ChangeDetectorRef);
  const error = mutableAccessor<ClassifiedError | null>(null);
  return {
    error,
    unavailable(command: string): void {
      error(classifyError(new DashboardCommandUnavailableError(command)));
      changeDetector.detectChanges();
    },
  };
}
