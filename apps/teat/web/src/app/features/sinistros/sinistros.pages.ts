import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';

export class SinistroPage {
  protected readonly i18n = inject(StynxI18nService, { optional: true });
  readonly titleKey: string = '';

  translate(key: string): string {
    return this.i18n?.translate(key) || key;
  }
}

@Component({
  selector: 'teat-sinistros-list-page',
  standalone: true,
  template: `<main>
    <h1>{{ translate(titleKey) }}</h1>
    <p role="status">{{ translate('teat.readiness.bootstrap') }}</p>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashesListPage extends SinistroPage {
  override readonly titleKey = 'boat.screens.crash_list.title';
}

@Component({
  selector: 'teat-sinistro-detail-page',
  standalone: true,
  template: `<main>
    <h1>{{ translate(titleKey) }}</h1>
    <p role="status">{{ translate('teat.readiness.bootstrap') }}</p>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashDetailPage extends SinistroPage {
  override readonly titleKey = 'boat.screens.crash_detail.title';
}

@Component({
  selector: 'teat-sinistro-complement-page',
  standalone: true,
  template: `<main>
    <h1>{{ translate(titleKey) }}</h1>
    <p role="status">{{ translate('teat.readiness.bootstrap') }}</p>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashComplementPage extends SinistroPage {
  override readonly titleKey = 'boat.screens.crash_complement.title';
}

@Component({
  selector: 'teat-sinistro-renaest-page',
  standalone: true,
  template: `<main>
    <h1>{{ translate(titleKey) }}</h1>
    <p role="status">{{ translate('teat.readiness.bootstrap') }}</p>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenaestIntegrationPage extends SinistroPage {
  override readonly titleKey = 'boat.screens.crash_renaest.title';
}

@Component({
  selector: 'teat-sinistro-subject-request-page',
  standalone: true,
  template: `<main>
    <h1>{{ translate(titleKey) }}</h1>
    <p role="status">{{ translate('teat.readiness.bootstrap') }}</p>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubjectRequestPage extends SinistroPage {
  override readonly titleKey = 'boat.screens.crash_subject_request.title';
}
