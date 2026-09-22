import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { TeatI18n } from './i18n.service.js';

export const MOBILE_ERROR_KEYS = {
  NORMATIVE_PACKAGE_MISSING: 'teat.errors.normative_package_missing',
} as const;

interface DiagnosticEntry {
  readonly code: string;
  readonly status?: number;
  readonly context: Readonly<Record<string, string>>;
  readonly source: 'route' | 'action';
  readonly occurredAt: string;
}

const forbiddenContextKey = /secret|payload|token|credential/i;

@Component({
  selector: 'teat-field-shell',
  standalone: true,
  template: `
    <ng-content />
    @if (errorMessage(); as message) {
      <p role="alert" aria-live="assertive">{{ message }}</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldShellComponent {
  private readonly entries: DiagnosticEntry[] = [];
  private readonly i18n = inject(TeatI18n);
  readonly errorMessage = signal<string | undefined>(undefined);

  capture(error: unknown, source: 'route' | 'action'): DiagnosticEntry {
    const candidate =
      typeof error === 'object' && error !== null
        ? (error as Record<string, unknown>)
        : undefined;
    const code =
      typeof candidate?.['code'] === 'string'
        ? candidate['code']
        : 'TEAT.INTERNAL';
    const rawContext =
      typeof candidate?.['context'] === 'object' &&
      candidate['context'] !== null
        ? (candidate['context'] as Record<string, unknown>)
        : {};
    const context = Object.fromEntries(
      Object.entries(rawContext).filter(
        ([key, value]) =>
          !forbiddenContextKey.test(key) && typeof value === 'string',
      ),
    ) as Record<string, string>;
    const status = candidate?.['status'];
    const entry: DiagnosticEntry = {
      code,
      ...(typeof status === 'number' ? { status } : {}),
      context: { ...context, source },
      source,
      occurredAt: new Date().toISOString(),
    };
    this.entries.push(entry);
    const key = `teat.errors.${code.replace(/^TEAT\./, '').toLowerCase()}`;
    try {
      this.errorMessage.set(this.i18n.translate(key));
    } catch {
      this.errorMessage.set(this.i18n.translate('teat.errors.internal'));
    }
    return entry;
  }

  diagnostics(): readonly DiagnosticEntry[] {
    return [...this.entries];
  }
}
