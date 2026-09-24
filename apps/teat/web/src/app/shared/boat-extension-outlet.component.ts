import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';

@Component({
  selector: 'teat-boat-extension-outlet',
  standalone: true,
  template: `
    <main>
      <h1>{{ translate(titleKey) }}</h1>
      <p role="status">source_pending · BOAT</p>
      <button type="button" (click)="acknowledge()">
        {{ translate('teat.navigation.previous') }}
      </button>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoatExtensionOutletComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(StynxI18nService, { optional: true });
  readonly statusKey = signal('teat.a11y.loading');
  readonly titleKey = String(
    this.route.snapshot.data['titleKey'] ?? 'teat.navigation.error',
  );

  translate(key: string): string {
    return this.i18n?.translate(key) || key;
  }

  acknowledge(): void {
    this.statusKey.set('teat.a11y.actionSucceeded');
  }
}
