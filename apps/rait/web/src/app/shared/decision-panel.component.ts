// DecisionPanel (contrato CTG-0002b §5.11; UC-RAIT-016; fichas 012/026; spec §9 Decisão da
// autoridade): duas colunas — esquerda `<rait-dossier-viewer>` + minuta mais recente (somente
// leitura); direita `<rait-deadline-chip kind="legal">` de T-DEC quando há `deadline`;
// `decision` ≠ null → somente leitura (`'rait.decision.' + decision_kind`, `decided_at`,
// `signature_ref` em `<code>`, estado por `stateLabelKey`); `decision` null → `<form>` com radios
// `acolhida`/`indeferida`, fundamento (`groundsLabelKey`) e botões assinar / devolver com orientação /
// declarar impedimento sob as chaves de `RAIT_COMMAND_RULES` (M4). Submissão de `decide` só com
// `kind` e `grounds` (forma; `DECISION_GROUNDS_REQUIRED` é do servidor); a assinatura PAdES é do
// `SignatureDialog`; o impedimento abre o `ImpedimentDialog` na página.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import {
  permissionKeyOf,
  type RaitAdmissibility,
  type RaitCase,
  type RaitDeadline,
  type RaitDecision,
  type RaitDecisionKind,
  type RaitDocument,
  type RaitDraft,
} from '../data/models';
import { DeadlineChipComponent } from './deadline-chip.component';
import { DossierViewerComponent } from './dossier-viewer.component';

export type AuthorityDecisionKind = Extract<
  RaitDecisionKind,
  'acolhida' | 'indeferida'
>;

export interface DecisionDraft {
  readonly kind: AuthorityDecisionKind;
  readonly grounds: string;
}

export const AUTHORITY_DECISION_KINDS: readonly AuthorityDecisionKind[] = [
  'acolhida',
  'indeferida',
];

const DECISION_KEY_PREFIX = 'rait.decision.';
const SIGN_KEY = 'rait.action.sign';
const RETURN_DRAFT_KEY = 'rait.action.return-draft';
const IMPEDE_KEY = 'rait.action.impede';
const GROUNDS_KEY = 'rait.common.grounds';
/** Legenda do dispositivo (acolhida | indeferida). */
const RULING_KEY = 'rait.common.ruling';
const SIGN_PERMISSION = permissionKeyOf('rait-decision:sign');
const RETURN_DRAFT_PERMISSION = permissionKeyOf('rait-decision:return-draft');
const IMPEDIMENT_PERMISSION = permissionKeyOf('rait-impediment:declare');
let nextId = 0;

@Component({
  selector: 'rait-decision-panel',
  imports: [
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DossierViewerComponent,
    DeadlineChipComponent,
    StynxHasPermissionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-decision-panel',
    '[attr.data-case-id]': 'case().id',
    '[attr.data-token]': 'decision()?.decision_kind ?? null',
  },
  template: `
    <div class="rait-decision-panel__columns">
      <section class="rait-decision-panel__dossier">
        <rait-dossier-viewer [documents]="documents()" />
        @if (draft(); as draft) {
          <div
            class="rait-decision-panel__draft"
            [attr.data-version]="draft.version"
          >
            <code>{{ draft.content_hash }}</code>
          </div>
        }
      </section>
      <section class="rait-decision-panel__decision">
        @if (deadline(); as deadline) {
          <rait-deadline-chip
            [timerCode]="deadline.timer_code"
            [dueOn]="deadline.due_on"
            [legalBasis]="deadline.legal_basis"
            kind="legal"
          />
        }
        @if (decision(); as decision) {
          <div
            class="rait-decision-panel__signed"
            [attr.data-token]="decision.decision_kind"
          >
            @if (stateLabelKey(); as stateKey) {
              <p class="rait-decision-panel__state">
                {{ stateKey | stynxTranslate }}
              </p>
            }
            <p>
              {{ decisionKeyPrefix + decision.decision_kind | stynxTranslate }}
            </p>
            <time [attr.datetime]="decision.decided_at">{{
              decision.decided_at | stynxIntlDate
            }}</time>
            @if (decision.signature_ref; as signatureRef) {
              <code>{{ signatureRef }}</code>
            }
          </div>
        } @else {
          <form (submit)="onDecide($event)" novalidate>
            <fieldset [disabled]="disabled()">
              <legend [id]="ids.kindLegend">
                {{ rulingKey | stynxTranslate }}
              </legend>
              @for (option of kinds; track option) {
                <label>
                  <input
                    type="radio"
                    [name]="ids.kindName"
                    [value]="option"
                    [checked]="kind() === option"
                    (change)="setKind(option)"
                  />
                  {{ decisionKeyPrefix + option | stynxTranslate }}
                </label>
              }
            </fieldset>
            <label [for]="ids.grounds">{{
              groundsLabelKey() | stynxTranslate
            }}</label>
            <textarea
              [id]="ids.grounds"
              name="grounds"
              [value]="grounds()"
              [disabled]="disabled()"
              (input)="setGrounds($event)"
            ></textarea>
            <div class="rait-decision-panel__actions">
              <button
                *stynxHasPermission="signPermission"
                type="submit"
                data-action="sign"
                [disabled]="disabled() || !complete()"
                (click)="onDecide($event)"
              >
                {{ signKey | stynxTranslate }}
              </button>
              <button
                *stynxHasPermission="returnDraftPermission"
                type="button"
                data-action="return-draft"
                [disabled]="disabled()"
                (click)="toggleGuidance()"
              >
                {{ returnDraftKey | stynxTranslate }}
              </button>
              <button
                *stynxHasPermission="impedimentPermission"
                type="button"
                data-action="impede"
                [disabled]="disabled()"
                (click)="declareImpediment.emit()"
              >
                {{ impedeKey | stynxTranslate }}
              </button>
            </div>
            @if (guidanceOpen()) {
              <div class="rait-decision-panel__guidance">
                <label [for]="ids.guidance">{{
                  returnDraftKey | stynxTranslate
                }}</label>
                <textarea
                  [id]="ids.guidance"
                  name="guidance"
                  [value]="guidance()"
                  (input)="setGuidance($event)"
                ></textarea>
                <button
                  type="button"
                  data-action="return-draft-confirm"
                  [disabled]="guidance().trim().length === 0"
                  (click)="onReturnDraft()"
                >
                  {{ returnDraftKey | stynxTranslate }}
                </button>
              </div>
            }
          </form>
        }
      </section>
    </div>
  `,
})
export class DecisionPanelComponent {
  readonly case = input.required<RaitCase>();
  readonly draft = input<RaitDraft | null>(null);
  readonly documents = input<readonly RaitDocument[]>([]);
  readonly admissibility = input<readonly RaitAdmissibility[]>([]);
  /** T-DEC. */
  readonly deadline = input<RaitDeadline | null>(null);
  readonly decision = input<RaitDecision | null>(null);
  readonly disabled = input(false);
  /** `rait.screens.assinatura-caseId.state.already_signed` (da tela chamadora). */
  readonly stateLabelKey = input<string | null>(null);
  readonly groundsLabelKey = input<string>(GROUNDS_KEY);
  readonly decide = output<DecisionDraft>();
  readonly returnDraft = output<{ guidance: string }>();
  readonly declareImpediment = output<void>();

  readonly kinds = AUTHORITY_DECISION_KINDS;
  readonly decisionKeyPrefix = DECISION_KEY_PREFIX;
  readonly signKey = SIGN_KEY;
  readonly returnDraftKey = RETURN_DRAFT_KEY;
  readonly impedeKey = IMPEDE_KEY;
  readonly rulingKey = RULING_KEY;
  readonly signPermission = SIGN_PERMISSION;
  readonly returnDraftPermission = RETURN_DRAFT_PERMISSION;
  readonly impedimentPermission = IMPEDIMENT_PERMISSION;

  private readonly instance = (nextId += 1);
  readonly ids = {
    kindName: `rait-decision-panel-${this.instance}-kind`,
    kindLegend: `rait-decision-panel-${this.instance}-kind-legend`,
    grounds: `rait-decision-panel-${this.instance}-grounds`,
    guidance: `rait-decision-panel-${this.instance}-guidance`,
  };

  readonly kind = signal<AuthorityDecisionKind | null>(null);
  readonly grounds = signal('');
  readonly guidance = signal('');
  readonly guidanceOpen = signal(false);

  readonly complete = computed(
    () => this.kind() !== null && this.grounds().trim().length > 0,
  );

  setKind(kind: AuthorityDecisionKind): void {
    this.kind.set(kind);
  }

  setGrounds(event: Event): void {
    this.grounds.set((event.target as HTMLTextAreaElement).value);
  }

  setGuidance(event: Event): void {
    this.guidance.set((event.target as HTMLTextAreaElement).value);
  }

  toggleGuidance(): void {
    this.guidanceOpen.update((open) => !open);
  }

  onDecide(event: Event): void {
    event.preventDefault();
    const kind = this.kind();
    if (kind === null || !this.complete() || this.disabled()) return;
    this.decide.emit({ kind, grounds: this.grounds().trim() });
  }

  onReturnDraft(): void {
    const guidance = this.guidance().trim();
    if (guidance.length === 0) return;
    this.returnDraft.emit({ guidance });
  }
}
