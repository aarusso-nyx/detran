// AdmissibilityChecklist (contrato CTG-0002b §5.8; [RN-RAIT-001]; [RN-RAIT-122]; ficha 008; spec
// §9 Triagem): 4 linhas na ordem fixa de `RAIT_ADMISSIBILITY_CRITERIA`; rótulos vêm da tela
// chamadora (`fieldLabelKeys`, Portal §5 "…LabelKey"). `tempestividade` é SOMENTE LEITURA
// (veredito/fundamento/`evaluated_at` do registro do servidor; ausente → `rait.common.pendingSource`)
// — nunca decidida no cliente ([RN-RAIT-005]). Os demais: radios sim/não + fundamento; "não" exige
// fundamento (forma mínima). `data-complete` = os três vereditos preenchidos.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import {
  RAIT_ADMISSIBILITY_CRITERIA,
  type RaitAdmissibility,
  type RaitAdmissibilityCriterion,
} from '../data/models';

export type EditableCriterion = Exclude<
  RaitAdmissibilityCriterion,
  'tempestividade'
>;

export interface AdmissibilityVerdict {
  readonly verdict: boolean | null;
  readonly reason: string;
}

export type AdmissibilityVerdicts = Readonly<
  Record<EditableCriterion, AdmissibilityVerdict>
>;

export const EMPTY_VERDICTS: AdmissibilityVerdicts = {
  legitimidade: { verdict: null, reason: '' },
  assinatura: { verdict: null, reason: '' },
  pedido_compativel: { verdict: null, reason: '' },
};

const READ_ONLY_CRITERION: RaitAdmissibilityCriterion = 'tempestividade';
const YES_KEY = 'rait.common.yes';
const NO_KEY = 'rait.common.no';
const PENDING_SOURCE_KEY = 'rait.common.pendingSource';
const REASON_KEY = 'rait.common.basis';
let nextId = 0;

@Component({
  selector: 'rait-admissibility-checklist',
  imports: [StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-admissibility-checklist',
    '[attr.data-complete]': 'complete()',
  },
  template: `
    <ol class="rait-admissibility-checklist__rows">
      @for (criterion of criteria; track criterion) {
        <li [attr.data-criterion]="criterion">
          @if (criterion === readOnlyCriterion) {
            <span
              class="rait-admissibility-checklist__label"
              [id]="labelId(criterion)"
              >{{ fieldLabelKeys()[criterion] | stynxTranslate }}</span
            >
            @if (recordedFor(criterion); as record) {
              <span
                class="rait-admissibility-checklist__verdict"
                [attr.data-verdict]="record.verdict"
                >{{ (record.verdict ? yesKey : noKey) | stynxTranslate }}</span
              >
              @if (record.reason) {
                <span class="rait-admissibility-checklist__reason">{{
                  record.reason
                }}</span>
              }
              <time [attr.datetime]="record.evaluated_at">{{
                record.evaluated_at | stynxIntlDate
              }}</time>
            } @else {
              <span class="rait-admissibility-checklist__pending">{{
                pendingSourceKey | stynxTranslate
              }}</span>
            }
          } @else {
            <fieldset [disabled]="disabled()">
              <legend>
                {{ fieldLabelKeys()[criterion] | stynxTranslate }}
              </legend>
              <label>
                <input
                  type="radio"
                  [name]="radioName(criterion)"
                  value="true"
                  [checked]="verdictOf(criterion) === true"
                  (change)="setVerdict(criterion, true)"
                />
                {{ yesKey | stynxTranslate }}
              </label>
              <label>
                <input
                  type="radio"
                  [name]="radioName(criterion)"
                  value="false"
                  [checked]="verdictOf(criterion) === false"
                  (change)="setVerdict(criterion, false)"
                />
                {{ noKey | stynxTranslate }}
              </label>
              <label [for]="reasonId(criterion)">{{
                reasonKey | stynxTranslate
              }}</label>
              <textarea
                [id]="reasonId(criterion)"
                [name]="criterion + '_reason'"
                [value]="reasonOf(criterion)"
                [attr.aria-invalid]="reasonMissing(criterion) ? 'true' : null"
                (input)="setReason(criterion, $event)"
              ></textarea>
            </fieldset>
          }
        </li>
      }
    </ol>
  `,
})
export class AdmissibilityChecklistComponent {
  /** Registros do servidor (o de `tempestividade` é o único exibido como veredito). */
  readonly recorded = input<readonly RaitAdmissibility[]>([]);
  readonly disabled = input(false);
  /** Rótulos da tela chamadora (ficha 008 `field.*`). */
  readonly fieldLabelKeys =
    input.required<Readonly<Record<RaitAdmissibilityCriterion, string>>>();
  readonly verdicts = model<AdmissibilityVerdicts>(EMPTY_VERDICTS);

  readonly criteria = RAIT_ADMISSIBILITY_CRITERIA;
  readonly readOnlyCriterion = READ_ONLY_CRITERION;
  readonly yesKey = YES_KEY;
  readonly noKey = NO_KEY;
  readonly pendingSourceKey = PENDING_SOURCE_KEY;
  readonly reasonKey = REASON_KEY;
  private readonly instance = (nextId += 1);

  /** Os três vereditos preenchidos e "não" com fundamento (forma mínima). */
  readonly complete = computed(() => {
    const verdicts = this.verdicts();
    return (Object.keys(EMPTY_VERDICTS) as EditableCriterion[]).every(
      (criterion) => {
        const entry = verdicts[criterion];
        return (
          entry.verdict !== null &&
          (entry.verdict || entry.reason.trim().length > 0)
        );
      },
    );
  });

  recordedFor(criterion: RaitAdmissibilityCriterion): RaitAdmissibility | null {
    return this.recorded().find((item) => item.criterion === criterion) ?? null;
  }

  labelId(criterion: RaitAdmissibilityCriterion): string {
    return `rait-admissibility-${this.instance}-${criterion}-label`;
  }

  reasonId(criterion: RaitAdmissibilityCriterion): string {
    return `rait-admissibility-${this.instance}-${criterion}-reason`;
  }

  radioName(criterion: RaitAdmissibilityCriterion): string {
    return `rait-admissibility-${this.instance}-${criterion}`;
  }

  verdictOf(criterion: RaitAdmissibilityCriterion): boolean | null {
    return this.isEditable(criterion)
      ? this.verdicts()[criterion].verdict
      : null;
  }

  reasonOf(criterion: RaitAdmissibilityCriterion): string {
    return this.isEditable(criterion) ? this.verdicts()[criterion].reason : '';
  }

  reasonMissing(criterion: RaitAdmissibilityCriterion): boolean {
    if (!this.isEditable(criterion)) return false;
    const entry = this.verdicts()[criterion];
    return entry.verdict === false && entry.reason.trim().length === 0;
  }

  setVerdict(criterion: RaitAdmissibilityCriterion, verdict: boolean): void {
    if (!this.isEditable(criterion)) return;
    this.verdicts.update((current) => ({
      ...current,
      [criterion]: { ...current[criterion], verdict },
    }));
  }

  setReason(criterion: RaitAdmissibilityCriterion, event: Event): void {
    if (!this.isEditable(criterion)) return;
    const reason = (event.target as HTMLTextAreaElement).value;
    this.verdicts.update((current) => ({
      ...current,
      [criterion]: { ...current[criterion], reason },
    }));
  }

  private isEditable(
    criterion: RaitAdmissibilityCriterion,
  ): criterion is EditableCriterion {
    return criterion !== READ_ONLY_CRITERION;
  }
}
