// frontend-preview-mode.md §6: memory-only notice; commands never replay success fixtures.
import { Injectable, inject, signal } from '@angular/core';
import { PortalClock } from '../core/clock';
export interface PreviewActionEntry {
  readonly command: string;
  readonly at: number;
}
@Injectable({ providedIn: 'root' })
export class PreviewActionLog {
  private readonly clock = inject(PortalClock);
  private readonly value = signal<readonly PreviewActionEntry[]>([]);
  readonly entries = this.value.asReadonly();
  record(command: string): void {
    this.value.update((entries) => [
      ...entries,
      { command, at: this.clock.now().getTime() },
    ]);
  }
}
