// D-02 Detalhe do alerta (IU-DASH-D-02; CTG-0002.md §9). L0 — sobe a L2 quando
// `triage.client.ts` (gerado de BP-DASH-MONITOR-001) existir. Os controles existem por
// permissão (`*dashCan`, chave literal de DASHBOARD_RULES) e, em L0, só informam que o comando
// está indisponível nesta versão: nenhuma requisição sai do browser. Em trilha de extinção não
// há "encerrar" — só "ver apuração de incidente" (`DASH.ALERT_EXTINCTION_NOT_CLOSABLE`).
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
import { AlertCardComponent } from '../../../shared/alert-card.component';
import { AlertLifecycleComponent } from '../../../shared/alert-lifecycle.component';
import { LayerGateComponent } from '../../../shared/layer-gate.component';
import type {
  AlertLifecycleView,
  AlertView,
  DashboardBlock,
} from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

interface AlertDetailData {
  readonly alert: AlertView;
  readonly lifecycle: AlertLifecycleView;
}

/** A ficha §5 não prevê "vazio" (há sempre um alerta) nem "bloqueado por decisão". */
type AlertDetailState = Exclude<
  ScreenState<AlertDetailData>,
  { kind: 'empty' } | { kind: 'blocked_by_decision' }
>;

const ACK_COMMAND = 'dashboard:alert:ack';
const CLOSE_COMMAND = 'dashboard:alert:close';
const INCIDENT_COMMAND = 'dashboard:incident:read';

@Component({
  selector: 'dash-alertas-id-page',
  imports: [
    ScreenFrameComponent,
    AlertCardComponent,
    AlertLifecycleComponent,
    LayerGateComponent,
    DashCanDirective,
    DashErrorBannerComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'alertas-id'"
      [block]="block()"
      [state]="state()"
    >
      @if (data(); as data) {
        <dash-alert-card
          [alert]="data.alert"
          [purposeDeclared]="purposeDeclared()"
          (openObject)="gateOpen(true)"
        />
        <dash-alert-lifecycle [lifecycle]="data.lifecycle" />
        <dash-layer-gate
          [open]="gateOpen()"
          (declared)="purposeDeclared(true); gateOpen(false)"
          (cancelled)="gateOpen(false)"
        />
        <button
          *dashCan="ACK_COMMAND"
          type="button"
          data-command="dashboard:alert:ack"
          (click)="notice.unavailable(ACK_COMMAND)"
        >
          {{ 'dashboard.forms.ack_alerta.submit' | stynxTranslate }}
          <span>{{
            'dashboard.common.fixed.manual_acknowledgement' | stynxTranslate
          }}</span>
        </button>
        @if (data.alert.track === 'irregularidade') {
          <button
            *dashCan="CLOSE_COMMAND"
            type="button"
            data-command="dashboard:alert:close"
            [disabled]="!verified()"
            (click)="notice.unavailable(CLOSE_COMMAND)"
          >
            {{ 'dashboard.forms.encerrar_alerta.submit' | stynxTranslate }}
          </button>
          @if (!verified()) {
            <p>
              {{
                'dashboard.errors.alert_close_without_verification'
                  | stynxTranslate
              }}
            </p>
          }
        } @else {
          <!--
            Leitura da apuracao de incidente: caminho de saida da trilha de extincao, sempre
            visivel (a autorizacao da leitura e do servidor). Nao e ato de negocio: em
            extincao nao existe "encerrar".
          -->
          <button
            type="button"
            data-command="dashboard:incident:read"
            (click)="notice.unavailable(INCIDENT_COMMAND)"
          >
            {{ 'dashboard.common.fixed.see_incident_inquiry' | stynxTranslate }}
          </button>
        }
        @if (notice.error(); as error) {
          <dash-error-banner [error]="error" />
        }
      }
    </dash-screen-frame>
  `,
})
export class AlertDetailPageComponent {
  /** Parâmetro de rota (`withComponentInputBinding`). */
  readonly id = input('');

  readonly state = mutableAccessor<AlertDetailState>(UNAVAILABLE_IN_VERSION);
  /** A página declara a finalidade pelo `LayerGate` (em L2 vira o cabeçalho `X-Purpose`). */
  readonly purposeDeclared = mutableAccessor(false);
  readonly gateOpen = mutableAccessor(false);
  protected readonly notice = createCommandNotice();

  protected readonly ACK_COMMAND = ACK_COMMAND;
  protected readonly CLOSE_COMMAND = CLOSE_COMMAND;
  protected readonly INCIDENT_COMMAND = INCIDENT_COMMAND;

  protected readonly data = computed<AlertDetailData | null>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : null;
  });

  protected readonly block = computed<DashboardBlock>(
    () => this.data()?.alert.block ?? 'A',
  );

  protected readonly verified = computed(
    () => this.data()?.alert.state === 'VERIFICADO',
  );
}
