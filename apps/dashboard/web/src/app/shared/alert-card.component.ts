// AlertCard (CTG-0002.md §8 item 3; [RN-DASH-135] anatomia mínima; §2 invariantes 3 e 4):
// indicador, severidade, base legal, dono, tempo restante selado, relógio governante, próximo
// marco, estado, classificação e o caminho de volta ao app de origem. O identificador do objeto
// (N2) só aparece com finalidade declarada (C-01-09) — sem ela, um botão pede o LayerGate à
// página. Em trilha de extinção não existe "encerrar": só "ver apuração de incidente".
// Rótulos de campo (dono, tempo restante, próximo marco, objeto) ficam em `data-field` até
// OD-D16-012 — nenhuma chave nova é inventada.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import { ClassificationBadgeComponent } from './classification-badge.component';
import { ClockGovernorBadgeComponent } from './clock-governor-badge.component';
import { DeepLinkButtonComponent } from './deep-link-button.component';
import { FreshnessSealComponent } from './freshness-seal.component';
import { LegalBasisTagComponent } from './legal-basis-tag.component';
import { SeverityChipComponent } from './severity-chip.component';
import type { AlertView } from './models';

const LAYER_N2_KEY = 'dashboard.layers.n2';
const SEE_INCIDENT_KEY = 'dashboard.common.fixed.see_incident_inquiry';
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

@Component({
  selector: 'dash-alert-card',
  imports: [
    ClassificationBadgeComponent,
    ClockGovernorBadgeComponent,
    DeepLinkButtonComponent,
    FreshnessSealComponent,
    LegalBasisTagComponent,
    SeverityChipComponent,
    StynxTranslatePipe,
    StynxIntlDatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-track]': 'trackAttr()' },
  template: `
    <article [attr.aria-labelledby]="headingId()">
      <h3 [attr.id]="headingId()">{{ indicatorKey() | stynxTranslate }}</h3>
      <dash-severity-chip [severity]="alert().severity" />
      <dash-legal-basis-tag [legalBasis]="alert().legalBasis" />
      <span data-field="owner">{{ alert().owner }}</span>
      <dash-freshness-seal
        [freshness]="alert().freshness"
        [block]="alert().block"
      >
        <span data-field="remaining">{{ alert().remaining }}</span>
      </dash-freshness-seal>
      @if (alert().clock; as clock) {
        <dash-clock-governor-badge [clock]="clock" />
      }
      @if (alert().nextMilestoneAt; as at) {
        <time data-field="next_milestone" [attr.datetime]="at">{{
          at | stynxIntlDate: DATE_FORMAT
        }}</time>
      }
      <span data-field="state">{{ stateKey() | stynxTranslate }}</span>
      <dash-classification-badge [classification]="alert().classification" />
      @if (object(); as object) {
        <span data-field="object">{{ object.reference }}</span>
      } @else if (alert().object) {
        <button type="button" (click)="openObject.emit()">
          {{ LAYER_N2_KEY | stynxTranslate }}
        </button>
      }
      @if (alert().originRef; as href) {
        <dash-deep-link-button [app]="alert().app" [href]="href" />
      }
      @if (extinction()) {
        <span data-field="incident">{{
          SEE_INCIDENT_KEY | stynxTranslate
        }}</span>
      }
    </article>
  `,
})
export class AlertCardComponent {
  readonly alert = input.required<AlertView>();
  /** A página decide: o objeto N2 só aparece depois do `LayerGate`. */
  readonly purposeDeclared = input(false);

  readonly openObject = output<void>();

  protected readonly LAYER_N2_KEY = LAYER_N2_KEY;
  protected readonly SEE_INCIDENT_KEY = SEE_INCIDENT_KEY;
  protected readonly DATE_FORMAT = DATE_FORMAT;

  protected readonly headingId = computed(
    () => `dash-alert-${this.alert().id}`,
  );
  protected readonly indicatorKey = computed(() =>
    tokenKey('indicators', this.alert().indicatorCode),
  );
  protected readonly stateKey = computed(() =>
    tokenKey('alert_states', this.alert().state),
  );
  protected readonly extinction = computed(
    () => this.alert().track === 'extincao',
  );
  protected readonly trackAttr = computed(() =>
    this.extinction() ? 'extincao' : null,
  );
  protected readonly object = computed(() =>
    this.purposeDeclared() ? this.alert().object : null,
  );
}
