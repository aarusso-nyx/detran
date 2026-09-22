// OpinionEditor (contrato CTG-0002b §5.13; UC-RAIT-004 AC-3; spec §9 Parecer/voto; ficha 031):
// `<textarea summary>`, `<textarea analysis>`, `<select vote>` (`RAIT_OPINION_VOTES` →
// `'rait.decision.' + token`); rótulos da tela chamadora (`fieldLabelKeys`); voto obrigatório
// (forma); `item.opinion_registered_at` ≠ null → somente leitura + `rait.common.registeredAt`;
// `rait.action.register` emitido como `submit` (a página aplica `inf:rait-opinion:register`).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import {
  RAIT_OPINION_VOTES,
  type RaitAgendaItem,
  type RaitOpinionVote,
} from '../data/models';

export interface OpinionContent {
  readonly summary: string;
  readonly analysis: string;
  readonly vote: RaitOpinionVote | null;
}

export interface OpinionFieldLabelKeys {
  readonly summary: string;
  readonly analysis: string;
  readonly vote: string;
}

export const EMPTY_OPINION: OpinionContent = {
  summary: '',
  analysis: '',
  vote: null,
};

const DECISION_KEY_PREFIX = 'rait.decision.';
const REGISTERED_AT_KEY = 'rait.common.registeredAt';
const SUBMIT_KEY = 'rait.action.register';
let nextId = 0;

@Component({
  selector: 'rait-opinion-editor',
  imports: [StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-opinion-editor',
    '[attr.data-item-id]': 'item()?.id ?? null',
    '[attr.data-registered]': 'registered()',
  },
  template: `
    @if (registeredAt(); as registeredAt) {
      <p class="rait-opinion-editor__registered">
        <span>{{ registeredAtKey | stynxTranslate }}</span>
        <time [attr.datetime]="registeredAt">{{
          registeredAt | stynxIntlDate
        }}</time>
      </p>
    }
    <form (submit)="onSubmit($event)" novalidate>
      <div class="rait-opinion-editor__field">
        <label [for]="ids.summary">{{
          fieldLabelKeys().summary | stynxTranslate
        }}</label>
        <textarea
          [id]="ids.summary"
          name="summary"
          [value]="opinion().summary"
          [disabled]="readOnly()"
          (input)="setField('summary', $event)"
        ></textarea>
      </div>
      <div class="rait-opinion-editor__field">
        <label [for]="ids.analysis">{{
          fieldLabelKeys().analysis | stynxTranslate
        }}</label>
        <textarea
          [id]="ids.analysis"
          name="analysis"
          [value]="opinion().analysis"
          [disabled]="readOnly()"
          (input)="setField('analysis', $event)"
        ></textarea>
      </div>
      <div class="rait-opinion-editor__field">
        <label [for]="ids.vote">{{
          fieldLabelKeys().vote | stynxTranslate
        }}</label>
        <select
          [id]="ids.vote"
          name="vote"
          [disabled]="readOnly()"
          (change)="setVote($event)"
        >
          @for (vote of votes; track vote) {
            <option [value]="vote" [selected]="opinion().vote === vote">
              {{ decisionKeyPrefix + vote | stynxTranslate }}
            </option>
          }
        </select>
      </div>
      <button
        type="submit"
        [disabled]="readOnly() || !complete()"
        (click)="onSubmit($event)"
      >
        {{ submitKey | stynxTranslate }}
      </button>
    </form>
  `,
})
export class OpinionEditorComponent {
  readonly item = input<RaitAgendaItem | null>(null);
  readonly disabled = input(false);
  readonly fieldLabelKeys = input.required<OpinionFieldLabelKeys>();
  readonly opinion = model<OpinionContent>(EMPTY_OPINION);
  // Nome fixado pelo contrato CTG-0002b §5.13 (`output submit`); o `submit` nativo do <form>
  // interno é contido (`stopPropagation`) para não chegar ao mesmo binding da página.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly submit = output<OpinionContent>();

  readonly votes = RAIT_OPINION_VOTES;
  readonly decisionKeyPrefix = DECISION_KEY_PREFIX;
  readonly registeredAtKey = REGISTERED_AT_KEY;
  readonly submitKey = SUBMIT_KEY;

  private readonly instance = (nextId += 1);
  readonly ids = {
    summary: `rait-opinion-editor-${this.instance}-summary`,
    analysis: `rait-opinion-editor-${this.instance}-analysis`,
    vote: `rait-opinion-editor-${this.instance}-vote`,
  };

  readonly registeredAt = computed(
    () => this.item()?.opinion_registered_at ?? null,
  );
  readonly registered = computed(() => this.registeredAt() !== null);
  readonly readOnly = computed(() => this.disabled() || this.registered());
  readonly complete = computed(() => {
    const value = this.opinion();
    return (
      value.summary.trim().length > 0 &&
      value.analysis.trim().length > 0 &&
      value.vote !== null
    );
  });

  setField(field: 'summary' | 'analysis', event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    this.opinion.update((current) => ({ ...current, [field]: text }));
  }

  setVote(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.opinion.update((current) => ({
      ...current,
      vote: (RAIT_OPINION_VOTES as readonly string[]).includes(value)
        ? (value as RaitOpinionVote)
        : null,
    }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.readOnly() || !this.complete()) return;
    this.submit.emit(this.opinion());
  }
}
