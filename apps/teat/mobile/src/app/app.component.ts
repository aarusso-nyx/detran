import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  BodycamIndicator,
  TEAT_BODYCAM_STATE,
} from './core/bodycam-indicator.component.js';
import { FieldShellComponent } from './core/field-shell.component.js';
import { TeatI18n } from './core/i18n.service.js';
import { TEAT_HOMOLOGATION_AIT } from './shared/homologation-ait.port.js';
import { HomologationAitWorkflowComponent } from './shared/homologation-ait-workflow.component.js';
import { HomologationTransitionPanelComponent } from './shared/homologation-transition-panel.component.js';
import {
  TEAT_MOBILE_HOMOLOGATION_PERSONA,
  TEAT_MOBILE_HOMOLOGATION_ROLES,
} from './shared/homologation-persona.port.js';

@Component({
  selector: 'teat-root',
  standalone: true,
  imports: [
    FieldShellComponent,
    BodycamIndicator,
    RouterOutlet,
    HomologationAitWorkflowComponent,
    HomologationTransitionPanelComponent,
  ],
  template: `
    <teat-field-shell>
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
      }
      <teat-bodycam-indicator [state]="bodycamState()" />
      <router-outlet />
      @if (homologation) {
        <teat-homologation-ait-workflow />
        <teat-homologation-transition-panel />
      }
    </teat-field-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly i18n = inject(TeatI18n);
  readonly bodycamState = inject(TEAT_BODYCAM_STATE).state;
  readonly homologation =
    inject(TEAT_HOMOLOGATION_AIT, { optional: true }) !== null;
  readonly persona = inject(TEAT_MOBILE_HOMOLOGATION_PERSONA, {
    optional: true,
  });
  readonly personaRoles = TEAT_MOBILE_HOMOLOGATION_ROLES;
  readonly personaLabel = this.i18n.translate('teat.shell.homologationPersona');
  readonly homologationLabel = this.i18n.translate('teat.shell.homologation');

  personaName(role: string): string {
    return this.i18n.translate(`teat.shell.persona.${role}`);
  }

  selectPersona(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.persona?.setRole(value);
    void this.router.navigateByUrl('/auth-login');
  }
}
