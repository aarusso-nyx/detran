import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';

import catalog from '../../i18n/teat.pt-BR.json';
import { ErrorBoundary } from './error-boundary.service.js';

@Component({
  selector: 'teat-error-outlet',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorOutletComponent {}

@Component({
  selector: 'teat-error-boundary',
  standalone: true,
  template: `
    @if (error() !== undefined) {
      <section role="alert" aria-live="assertive">
        <strong>{{ classified().code }}</strong>
        <p>{{ translate(classified().messageKey) }}</p>
      </section>
    } @else {
      <ng-content />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorBoundaryComponent {
  private readonly boundary = inject(ErrorBoundary);
  private readonly i18n = inject(StynxI18nService);
  readonly error = input<unknown>();

  classified() {
    return this.boundary.classify(this.error());
  }

  translate(key: string): string {
    const translated = this.i18n.translate(key);
    return translated === key
      ? ((catalog as Readonly<Record<string, string>>)[key] ?? key)
      : translated;
  }
}
