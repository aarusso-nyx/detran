// Registro das ações da prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §6, D-11): cada
// método de comando dos adapters registra a string M8 (= `RaitCommandUnavailableError.command`)
// ANTES de delegar ao cliente real, que lança. Só em memória (zera a cada documento); a faixa
// mostra a última entrada como "não funcional na prévia". `at` vem de `RaitClock` (na prévia,
// `PreviewClock`, constante).
import { Injectable, inject, signal, type Signal } from '@angular/core';
import { RaitClock } from '../data/clock';

export interface PreviewActionEntry {
  readonly command: string;
  readonly at: number;
}

@Injectable({ providedIn: 'root' })
export class PreviewActionLog {
  private readonly clock = inject(RaitClock);
  private readonly entriesState = signal<readonly PreviewActionEntry[]>([]);

  readonly entries: Signal<readonly PreviewActionEntry[]> =
    this.entriesState.asReadonly();

  record(command: string): void {
    const entry: PreviewActionEntry = { command, at: this.clock.now() };
    this.entriesState.update((entries) => [...entries, entry]);
  }
}
