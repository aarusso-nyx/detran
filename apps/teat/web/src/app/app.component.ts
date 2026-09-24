import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';

import { ErrorOutletComponent } from './core/error-boundary/error-outlet.component.js';
import { SseService } from './core/sse.service.js';
import { TEAT_WEB_HOMOLOGATION_EVENTS } from './shared/homologation-events.port.js';
import { TEAT_WEB_HOMOLOGATION } from './shared/homologation-http.interceptor.js';
import { TEAT_WEB_ROLES } from './core/roles.js';
import { TEAT_WEB_HOMOLOGATION_PERSONA } from './shared/homologation-persona.port.js';
import {
  TEAT_WEB_HOMOLOGATION_SCENARIO,
  type TeatWebHomologationDataState,
} from './shared/homologation-scenario.port.js';

@Component({
  selector: 'teat-root',
  imports: [RouterOutlet, ErrorOutletComponent],
  template: `
    <teat-error-outlet>
      @if (homologation) {
        <p data-profile="homologation" role="note">{{ homologationLabel }}</p>
        @if (persona) {
          <label data-homologation-persona>
            {{ personaLabel }}
            <select [value]="persona.role()" (change)="selectPersona($event)">
              @for (role of personaRoles; track role) {
                <option [value]="role">{{ personaName(role) }}</option>
              }
            </select>
          </label>
        }
        @if (scenario) {
          <label>
            {{ scenarioLabel }}
            <select
              data-homologation-data-state
              [value]="scenario.mode()"
              (change)="selectScenario($event)"
            >
              @for (mode of scenarioModes; track mode) {
                <option [value]="mode">{{ scenarioName(mode) }}</option>
              }
            </select>
          </label>
          <button
            type="button"
            data-homologation-refresh
            (click)="refreshScenario()"
          >
            {{ refreshLabel }}
          </button>
        }
        @if (events) {
          <button
            type="button"
            data-homologation-sse-outage
            (click)="simulateSseOutage()"
          >
            {{ outageLabel }}
          </button>
        }
        @if (sse.homologationFallbackActive()) {
          <p data-homologation-fallback role="status">{{ fallbackLabel }}</p>
        }
      }
      <router-outlet />
    </teat-error-outlet>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly i18n = inject(StynxI18nService);
  readonly homologation =
    inject(TEAT_WEB_HOMOLOGATION, { optional: true }) === true;
  readonly persona = inject(TEAT_WEB_HOMOLOGATION_PERSONA, { optional: true });
  readonly scenario = inject(TEAT_WEB_HOMOLOGATION_SCENARIO, {
    optional: true,
  });
  readonly events = inject(TEAT_WEB_HOMOLOGATION_EVENTS, { optional: true });
  readonly sse = inject(SseService);
  readonly personaRoles = TEAT_WEB_ROLES;
  readonly scenarioModes = ['data', 'empty', 'error'] as const;
  readonly homologationLabel = this.homologation
    ? this.i18n.translate('teat.shell.homologation')
    : '';
  readonly personaLabel = this.homologation
    ? this.i18n.translate('teat.shell.homologationPersona')
    : '';
  readonly scenarioLabel = this.homologation
    ? this.i18n.translate('teat.shell.homologationScenario')
    : '';
  readonly refreshLabel = this.homologation
    ? this.i18n.translate('teat.shell.homologationRefresh')
    : '';
  readonly outageLabel = this.homologation
    ? this.i18n.translate('teat.shell.homologationSseOutage')
    : '';
  readonly fallbackLabel = this.homologation
    ? this.i18n.translate('teat.shell.homologationFallback')
    : '';

  personaName(role: string): string {
    return this.i18n.translate(
      `teat.shell.persona.${role === 'AUDITOR' ? 'auditor' : role}`,
    );
  }

  selectPersona(event: Event): void {
    this.persona?.setRole((event.target as HTMLSelectElement).value);
    void this.router.navigateByUrl('/ux/web/login');
  }

  scenarioName(mode: string): string {
    return this.i18n.translate(`teat.shell.homologationScenario.${mode}`);
  }

  selectScenario(event: Event): void {
    const mode = (event.target as HTMLSelectElement).value;
    if (mode === 'data' || mode === 'empty' || mode === 'error') {
      this.scenario?.setMode(mode satisfies TeatWebHomologationDataState);
    }
  }

  refreshScenario(): void {
    this.scenario?.refresh();
  }

  simulateSseOutage(): void {
    this.events?.simulateOutage?.();
  }
}
