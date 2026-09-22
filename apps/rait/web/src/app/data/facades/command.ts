// Executor de comandos das facades (contrato CTG-0002b §4.1): `run(command, exec)` marca
// `submitting`, executa, e devolve `CommandOutcome` — NUNCA rejeita: a falha é classificada por
// `classifyError` (para `RaitCommandUnavailableError`, M8: `kind 'unavailable'` + `command`) e
// fica em `error()` para a página apresentar (§4.4). Nesta CTG todo comando é M8.
import { computed, signal, type Signal } from '@angular/core';
import { classifyError, type ClassifiedError } from '../../core/error-boundary';
import type { CommandResult, RaitCommand } from '../models/commands';

export type CommandStatus = 'idle' | 'submitting' | 'done' | 'error';

export type CommandOutcome<T> =
  | { readonly ok: true; readonly body: T; readonly etag: string | null }
  | { readonly ok: false; readonly error: ClassifiedError };

export interface CommandRunner {
  /** Último comando da facade. */
  readonly status: Signal<CommandStatus>;
  readonly error: Signal<ClassifiedError | null>;
  run<T>(
    command: RaitCommand,
    exec: () => Promise<CommandResult<T>>,
  ): Promise<CommandOutcome<T>>;
  clearError(): void;
}

export function createCommandRunner(): CommandRunner {
  const status = signal<CommandStatus>('idle');
  const error = signal<ClassifiedError | null>(null);
  return {
    status: computed(() => status()),
    error: computed(() => error()),
    async run<T>(
      _command: RaitCommand,
      exec: () => Promise<CommandResult<T>>,
    ): Promise<CommandOutcome<T>> {
      status.set('submitting');
      error.set(null);
      try {
        const result = await exec();
        status.set('done');
        return { ok: true, body: result.body, etag: result.etag };
      } catch (cause: unknown) {
        const classified = classifyError(cause);
        error.set(classified);
        status.set('error');
        return { ok: false, error: classified };
      }
    },
    clearError(): void {
      error.set(null);
      if (status() === 'error') status.set('idle');
    },
  };
}
