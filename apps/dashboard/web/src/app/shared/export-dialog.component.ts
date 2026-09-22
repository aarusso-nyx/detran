// ExportDialog (CTG-0002.md §8 item 14; [RN-DASH-172] regra 3): toda exportação sai com
// classificação e camada à vista. O diálogo só rotula as condições — quem decide é o servidor
// (`EXPORT_VOLUME_APPROVAL_REQUIRED` 202, `EXPORT_FORMAT_NOT_OPEN`, `EXPORT_N3_FORBIDDEN`).
// Não aplica supressão, não gera arquivo e não importa `forms/`.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { StynxTranslatePipe } from '@detran/ui';
import { ClassificationBadgeComponent } from './classification-badge.component';
import { tokenKey } from '../core/i18n-token-key';
import {
  PURPOSE_TOKENS,
  type Classification,
  type DashboardLayer,
  type ExportRequest,
  type PurposeToken,
} from './models';

const SCOPE_KEY = 'dashboard.forms.exportar.scope';
const FILTERS_KEY = 'dashboard.forms.exportar.filters';
const FORMAT_KEY = 'dashboard.forms.exportar.format';
const PURPOSE_KEY = 'dashboard.forms.exportar.purpose';
const ROWS_KEY = 'dashboard.forms.exportar.rows';
const VOLUME_KEY = 'dashboard.forms.exportar.volume_justification';
const SUBMIT_KEY = 'dashboard.forms.exportar.submit';
const GATE_KEY = 'dashboard.forms.exportar.gate';
const EXPORT_KEY = 'dashboard.common.action.export';
const CANCEL_KEY = 'dashboard.common.action.cancel';
const FORMAT_NOT_OPEN_KEY = 'dashboard.errors.export_format_not_open';
const CLASSIFICATION_MISSING_KEY = 'dashboard.errors.classification_missing';
const TITLE_ID = 'dash-export-dialog-title';

@Component({
  selector: 'dash-export-dialog',
  imports: [
    ClassificationBadgeComponent,
    ReactiveFormsModule,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <dialog
        open
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="TITLE_ID"
        (keydown.escape)="cancelled.emit()"
      >
        <h2 [attr.id]="TITLE_ID">{{ EXPORT_KEY | stynxTranslate }}</h2>
        <dash-classification-badge [classification]="classification()" />
        <p data-field="layer">{{ layerKey() | stynxTranslate }}</p>
        <form [formGroup]="form" (ngSubmit)="request()">
          <p>
            <label for="dash-export-scope">{{
              SCOPE_KEY | stynxTranslate
            }}</label>
            <output id="dash-export-scope" data-field="scope">{{
              scope()
            }}</output>
          </p>
          <p>
            <label for="dash-export-filters">{{
              FILTERS_KEY | stynxTranslate
            }}</label>
            <output id="dash-export-filters" data-field="filters">{{
              filterSummary()
            }}</output>
          </p>
          <p>
            <label for="dash-export-rows">{{
              ROWS_KEY | stynxTranslate
            }}</label>
            <output id="dash-export-rows" data-field="rows">{{
              rows()
            }}</output>
          </p>
          <p>
            <label for="dash-export-format">{{
              FORMAT_KEY | stynxTranslate
            }}</label>
            <select
              id="dash-export-format"
              name="format"
              formControlName="format"
              [attr.disabled]="formats().length === 0 ? 'disabled' : null"
            >
              <option value=""></option>
              @for (format of formats(); track format) {
                <option [value]="format">{{ format }}</option>
              }
            </select>
          </p>
          @if (formats().length === 0) {
            <p>{{ FORMAT_NOT_OPEN_KEY | stynxTranslate }}</p>
          }
          <p>
            <label for="dash-export-purpose">{{
              PURPOSE_KEY | stynxTranslate
            }}</label>
            <select
              id="dash-export-purpose"
              name="purpose"
              formControlName="purpose"
              [attr.required]="purposeRequired() ? 'required' : null"
            >
              <option value=""></option>
              @for (token of PURPOSE_TOKENS; track token) {
                <option [value]="token">
                  {{ purposeKey(token) | stynxTranslate }}
                </option>
              }
            </select>
          </p>
          <p>
            <label for="dash-export-volume">{{
              VOLUME_KEY | stynxTranslate
            }}</label>
            <input
              id="dash-export-volume"
              name="volumeJustification"
              type="text"
              formControlName="volumeJustification"
              [attr.required]="volumeRequired() ? 'required' : null"
            />
          </p>
          @if (classification() === null) {
            <p>{{ CLASSIFICATION_MISSING_KEY | stynxTranslate }}</p>
          }
          <p>{{ GATE_KEY | stynxTranslate }}</p>
          <button type="submit" [disabled]="blocked()">
            {{ SUBMIT_KEY | stynxTranslate }}
          </button>
          <button type="button" (click)="cancelled.emit()">
            {{ CANCEL_KEY | stynxTranslate }}
          </button>
        </form>
      </dialog>
    }
  `,
})
export class ExportDialogComponent {
  readonly open = input.required<boolean>();
  readonly classification = input.required<Classification | null>();
  readonly layer = input.required<DashboardLayer>();
  readonly scope = input.required<string>();
  readonly filters = input.required<Readonly<Record<string, string>>>();
  readonly rows = input.required<number | null>();
  /** Limiar de aprovação nominal do catálogo de parâmetros (OD-D09); vem do backend, `null` em L0. */
  readonly approvalRows = input.required<number | null>();
  /** Lista de formatos abertos de R-0011 (`source_pending`); `[]` em L0. */
  readonly formats = input.required<readonly string[]>();

  readonly requested = output<ExportRequest>();
  readonly cancelled = output<void>();

  protected readonly SCOPE_KEY = SCOPE_KEY;
  protected readonly FILTERS_KEY = FILTERS_KEY;
  protected readonly FORMAT_KEY = FORMAT_KEY;
  protected readonly PURPOSE_KEY = PURPOSE_KEY;
  protected readonly ROWS_KEY = ROWS_KEY;
  protected readonly VOLUME_KEY = VOLUME_KEY;
  protected readonly SUBMIT_KEY = SUBMIT_KEY;
  protected readonly GATE_KEY = GATE_KEY;
  protected readonly EXPORT_KEY = EXPORT_KEY;
  protected readonly CANCEL_KEY = CANCEL_KEY;
  protected readonly FORMAT_NOT_OPEN_KEY = FORMAT_NOT_OPEN_KEY;
  protected readonly CLASSIFICATION_MISSING_KEY = CLASSIFICATION_MISSING_KEY;
  protected readonly TITLE_ID = TITLE_ID;
  protected readonly PURPOSE_TOKENS = PURPOSE_TOKENS;

  protected readonly form = new FormGroup({
    format: new FormControl('', { nonNullable: true }),
    purpose: new FormControl('', { nonNullable: true }),
    volumeJustification: new FormControl('', { nonNullable: true }),
  });

  private readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  protected readonly layerKey = computed(() =>
    tokenKey('layers', this.layer()),
  );

  protected readonly filterSummary = computed(() =>
    Object.entries(this.filters())
      .map(([key, value]) => `${key}=${value}`)
      .join(' '),
  );

  /** Camada N2 só exporta com finalidade declarada. */
  protected readonly purposeRequired = computed(() => this.layer() === 'N2');

  /** Acima do limite nominal, o pedido precisa de justificativa (o servidor aprova). */
  protected readonly volumeRequired = computed(() => {
    const approvalRows = this.approvalRows();
    const rows = this.rows();
    return approvalRows !== null && rows !== null && rows > approvalRows;
  });

  protected readonly blocked = computed(() => {
    const value = this.value();
    if (this.classification() === null) return true;
    if (this.formats().length === 0) return true;
    if (!value.format) return true;
    if (this.purposeRequired() && !value.purpose) return true;
    return this.volumeRequired() && !value.volumeJustification;
  });

  /** Vocabulário de finalidade é um só (OD-D16-008): as chaves da semente são as de N2. */
  protected purposeKey(token: PurposeToken): string {
    return `dashboard.forms.finalidade_n2.purpose_${token}`;
  }

  protected request(): void {
    if (this.blocked()) return;
    const value = this.form.getRawValue();
    const rows = this.rows() ?? 0;
    const purpose = value.purpose as PurposeToken | '';
    this.requested.emit({
      scope: this.scope(),
      filters: this.filters(),
      format: value.format,
      rows,
      ...(purpose ? { purpose } : {}),
      ...(value.volumeJustification
        ? { volumeJustification: value.volumeJustification }
        : {}),
    });
  }
}
