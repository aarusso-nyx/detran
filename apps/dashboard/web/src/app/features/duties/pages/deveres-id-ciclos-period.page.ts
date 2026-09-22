// D-09 Ciclo do dever (IU-DASH-D-09; CTG-0002.md §9). L0 — sobe a L2 quando `duties.client.ts`
// (gerado de BP-DASH-MONITOR-001) existir. Os cinco controles de transição existem por
// permissão, independentemente do estado: o pré-estado é do servidor
// (`DASH.DUTY_STATE_INVALID`). A evidência segue OD-D16-011 (protocolo, captura OU hash).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { DashCanDirective } from '../../../core/can.directive';
import { createCommandNotice } from '../../../core/command-notice';
import { DashErrorBannerComponent } from '../../../core/error-banner.component';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { DeepLinkButtonComponent } from '../../../shared/deep-link-button.component';
import { DutyCycleStepperComponent } from '../../../shared/duty-cycle-stepper.component';
import { EvidenceAttachComponent } from '../../../shared/evidence-attach.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import type { DutyCycleView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

type DutyCycleState = Exclude<
  ScreenState<DutyCycleView>,
  { kind: 'blocked_by_decision' }
>;

const CYCLE_COMMANDS = [
  'dashboard:duty-cycle:start',
  'dashboard:duty-cycle:prepare',
  'dashboard:duty-cycle:submit',
  'dashboard:duty-cycle:prove',
  'dashboard:duty-cycle:archive',
] as const;

@Component({
  selector: 'dash-deveres-id-ciclos-period-page',
  imports: [
    ScreenFrameComponent,
    DashCanDirective,
    DashErrorBannerComponent,
    DeepLinkButtonComponent,
    DutyCycleStepperComponent,
    EvidenceAttachComponent,
    FreshnessSealComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'deveres-id-ciclos-period'"
      [block]="'B'"
      [state]="state()"
    >
      @if (cycle(); as cycle) {
        <dash-duty-cycle-stepper [cycle]="cycle" />
        <dash-freshness-seal [freshness]="null" [block]="'B'">
          <span data-field="period">{{ cycle.period }}</span>
        </dash-freshness-seal>
        <dash-evidence-attach (evidence)="prove()" />
        <!-- L0: o app de origem do dever só é conhecido com R-0011. -->
        <dash-deep-link-button [app]="null" [href]="''" />
        <button
          *dashCan="'dashboard:duty-cycle:start'"
          type="button"
          data-command="dashboard:duty-cycle:start"
          (click)="notice.unavailable('dashboard:duty-cycle:start')"
        >
          {{ 'dashboard.forms.avancar_ciclo.submit' | stynxTranslate }}
        </button>
        <button
          *dashCan="'dashboard:duty-cycle:prepare'"
          type="button"
          data-command="dashboard:duty-cycle:prepare"
          (click)="notice.unavailable('dashboard:duty-cycle:prepare')"
        >
          {{ 'dashboard.forms.avancar_ciclo.submit' | stynxTranslate }}
        </button>
        <button
          *dashCan="'dashboard:duty-cycle:submit'"
          type="button"
          data-command="dashboard:duty-cycle:submit"
          (click)="notice.unavailable('dashboard:duty-cycle:submit')"
        >
          {{ 'dashboard.forms.avancar_ciclo.submit' | stynxTranslate }}
        </button>
        <button
          *dashCan="'dashboard:duty-cycle:prove'"
          type="button"
          data-command="dashboard:duty-cycle:prove"
          (click)="notice.unavailable('dashboard:duty-cycle:prove')"
        >
          {{ 'dashboard.forms.avancar_ciclo.submit' | stynxTranslate }}
        </button>
        <button
          *dashCan="'dashboard:duty-cycle:archive'"
          type="button"
          data-command="dashboard:duty-cycle:archive"
          (click)="notice.unavailable('dashboard:duty-cycle:archive')"
        >
          {{ 'dashboard.forms.avancar_ciclo.submit' | stynxTranslate }}
        </button>
        @if (notice.error(); as error) {
          <dash-error-banner [error]="error" />
        }
      }
    </dash-screen-frame>
  `,
})
export class DutyCyclePageComponent {
  /** Parâmetros de rota (`withComponentInputBinding`). */
  readonly id = input('');
  readonly period = input('');

  readonly state = mutableAccessor<DutyCycleState>(UNAVAILABLE_IN_VERSION);
  protected readonly notice = createCommandNotice();

  protected readonly CYCLE_COMMANDS = CYCLE_COMMANDS;

  protected readonly cycle = computed<DutyCycleView | null>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : null;
  });

  /** A evidência anexada alimenta `duty-cycle:prove` (em L2; aqui só o aviso). */
  protected prove(): void {
    this.notice.unavailable('dashboard:duty-cycle:prove');
  }
}
