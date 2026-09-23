import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ErrorHandler,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TeatI18n } from './i18n.service.js';

export const MOBILE_ERROR_KEYS = {
  NORMATIVE_PACKAGE_MISSING: 'teat.errors.normative_package_missing',
} as const;

export interface DiagnosticEntry {
  readonly code: string;
  readonly status?: number;
  readonly context: Readonly<Record<string, string>>;
  readonly source: 'route' | 'action';
  readonly occurredAt: string;
}

const forbiddenContextKey = /secret|payload|token|credential/i;

@Injectable({ providedIn: 'root' })
export class TeatErrorBoundaryState {
  private readonly entries: DiagnosticEntry[] = [];
  readonly current = signal<DiagnosticEntry | undefined>(undefined);
  readonly warning = signal<string | undefined>(undefined);

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
    this.current.set(entry);
    return entry;
  }

  clear(): void {
    this.current.set(undefined);
    this.warning.set(undefined);
  }

  recordWarning(code: string): DiagnosticEntry {
    const existing = this.entries.find(
      (entry) => entry.code === code && entry.source === 'route',
    );
    if (existing !== undefined) {
      this.warning.set(code);
      return existing;
    }
    const entry: DiagnosticEntry = {
      code,
      context: { source: 'route' },
      source: 'route',
      occurredAt: new Date().toISOString(),
    };
    this.entries.push(entry);
    this.warning.set(code);
    return entry;
  }

  diagnostics(): readonly DiagnosticEntry[] {
    return [...this.entries];
  }
}

@Injectable({ providedIn: 'root' })
export class TeatErrorHandler implements ErrorHandler {
  private readonly state = inject(TeatErrorBoundaryState);

  handleError(error: unknown): void {
    this.state.capture(error, 'action');
  }
}

@Component({
  selector: 'teat-field-shell',
  standalone: true,
  template: `
    <ng-content />
    @if (errorMessage(); as message) {
      <p role="alert" aria-live="assertive">{{ message }}</p>
    }
    @if (unavailableMessage(); as message) {
      <p role="alert" aria-live="polite">{{ message }}</p>
    }
    @if (warningMessage(); as message) {
      <p role="status" aria-live="polite">{{ message }}</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldShellComponent {
  private readonly i18n = inject(TeatI18n);
  private readonly boundary = inject(TeatErrorBoundaryState);
  private readonly router = inject(Router);
  readonly errorMessage = computed(() => {
    const current = this.boundary.current();
    if (current === undefined) return undefined;
    const key = `teat.errors.${current.code.replace(/^TEAT\./, '').toLowerCase()}`;
    try {
      return this.i18n.translate(key);
    } catch {
      return this.i18n.translate('teat.errors.internal');
    }
  });
  readonly unavailableMessage = signal<string | undefined>(undefined);
  readonly warningMessage = computed(() =>
    this.boundary.warning() === undefined
      ? undefined
      : this.i18n.translate('teat.readiness.warning'),
  );

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe(({ urlAfterRedirects }) => {
        const path = urlAfterRedirects.replace(/^\//, '');
        this.unavailableMessage.set(
          path === 'ait-speed-measurement' || path.startsWith('crash-')
            ? this.i18n.translate('teat.errors.internal')
            : undefined,
        );
      });
  }

  capture(error: unknown, source: 'route' | 'action'): DiagnosticEntry {
    return this.boundary.capture(error, source);
  }

  diagnostics(): readonly DiagnosticEntry[] {
    return this.boundary.diagnostics();
  }
}
