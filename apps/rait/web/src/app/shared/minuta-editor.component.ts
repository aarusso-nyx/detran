// MinutaEditor (contrato CTG-0002b §5.10; IU-RAIT-001 §3 "quem instrui não assina"; spec §9
// Minuta; ficha 011): três campos (`rait.common.facts`/`grounds`/`ruling`), `<select ruling>`
// (`acolher` | `indeferir` — tokens sem contrato, OD-R12-029), autor explícito
// (`rait.common.author` + `authorLabel`), versões em `<ol>` (`version`, `'rait.common.draft_' +
// status`, `submitted_at`). NENHUM botão de assinatura; `rait.action.submit-draft` é emitido como
// `submit` (a página aplica a permissão `inf:rait-case:submit-draft`). Forma mínima: os três
// campos preenchidos.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import type { RaitDraft } from '../data/models';

/** §9 fixa `acolher | indeferir`; o contrato só tem `decision_kind` (OD-R12-029). */
export type MinutaRuling = 'acolher' | 'indeferir';

export interface MinutaContent {
  readonly facts: string;
  readonly grounds: string;
  readonly ruling: MinutaRuling | null;
}

export const EMPTY_MINUTA: MinutaContent = {
  facts: '',
  grounds: '',
  ruling: null,
};
export const MINUTA_RULINGS: readonly MinutaRuling[] = ['acolher', 'indeferir'];

const FACTS_KEY = 'rait.common.facts';
const GROUNDS_KEY = 'rait.common.grounds';
const RULING_KEY = 'rait.common.ruling';
const AUTHOR_KEY = 'rait.common.author';
const VERSION_KEY = 'rait.common.version';
const DRAFT_STATUS_KEY_PREFIX = 'rait.common.draft_';
const SUBMIT_KEY = 'rait.action.submit-draft';
let nextId = 0;

@Component({
  selector: 'rait-minuta-editor',
  imports: [StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-minuta-editor',
    '[attr.data-version]': 'draft()?.version ?? null',
  },
  template: `
    <p class="rait-minuta-editor__author">
      <span>{{ authorKey | stynxTranslate }}</span>
      @if (authorLabel(); as author) {
        <span class="rait-minuta-editor__author-name">{{ author }}</span>
      }
    </p>
    @if (versions().length > 0) {
      <ol class="rait-minuta-editor__versions">
        @for (version of versions(); track version.id) {
          <li
            [attr.data-version]="version.version"
            [attr.data-token]="version.status"
          >
            <span>{{ versionKey | stynxTranslate }} {{ version.version }}</span>
            <span>{{
              draftStatusKeyPrefix + version.status | stynxTranslate
            }}</span>
            @if (version.submitted_at; as submittedAt) {
              <time [attr.datetime]="submittedAt">{{
                submittedAt | stynxIntlDate
              }}</time>
            }
          </li>
        }
      </ol>
    }
    <form (submit)="onSubmit($event)" novalidate>
      <div class="rait-minuta-editor__field">
        <label [for]="ids.facts">{{ factsKey | stynxTranslate }}</label>
        <textarea
          [id]="ids.facts"
          name="facts"
          [value]="content().facts"
          [disabled]="disabled()"
          (input)="setField('facts', $event)"
        ></textarea>
      </div>
      <div class="rait-minuta-editor__field">
        <label [for]="ids.grounds">{{ groundsKey | stynxTranslate }}</label>
        <textarea
          [id]="ids.grounds"
          name="grounds"
          [value]="content().grounds"
          [disabled]="disabled()"
          (input)="setField('grounds', $event)"
        ></textarea>
      </div>
      <div class="rait-minuta-editor__field">
        <label [for]="ids.ruling">{{ rulingKey | stynxTranslate }}</label>
        <select
          [id]="ids.ruling"
          name="ruling"
          [disabled]="disabled()"
          (change)="setRuling($event)"
        >
          <option value="" [selected]="content().ruling === null"></option>
          @for (ruling of rulings; track ruling) {
            <option [value]="ruling" [selected]="content().ruling === ruling">
              {{ ruling }}
            </option>
          }
        </select>
      </div>
      <button
        type="submit"
        [disabled]="disabled() || !complete()"
        (click)="onSubmit($event)"
      >
        {{ submitKey | stynxTranslate }}
      </button>
    </form>
  `,
})
export class MinutaEditorComponent {
  readonly draft = input<RaitDraft | null>(null);
  readonly versions = input<readonly RaitDraft[]>([]);
  readonly authorLabel = input<string | null>(null);
  readonly disabled = input(false);
  readonly content = model<MinutaContent>(EMPTY_MINUTA);
  // Nome fixado pelo contrato CTG-0002b §5.10 (`output submit`); o `submit` nativo do <form>
  // interno é contido (`stopPropagation`) para não chegar ao mesmo binding da página.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly submit = output<MinutaContent>();

  readonly rulings = MINUTA_RULINGS;
  readonly factsKey = FACTS_KEY;
  readonly groundsKey = GROUNDS_KEY;
  readonly rulingKey = RULING_KEY;
  readonly authorKey = AUTHOR_KEY;
  readonly versionKey = VERSION_KEY;
  readonly draftStatusKeyPrefix = DRAFT_STATUS_KEY_PREFIX;
  readonly submitKey = SUBMIT_KEY;

  private readonly instance = (nextId += 1);
  readonly ids = {
    facts: `rait-minuta-editor-${this.instance}-facts`,
    grounds: `rait-minuta-editor-${this.instance}-grounds`,
    ruling: `rait-minuta-editor-${this.instance}-ruling`,
  };

  readonly complete = computed(() => {
    const value = this.content();
    return (
      value.facts.trim().length > 0 &&
      value.grounds.trim().length > 0 &&
      value.ruling !== null
    );
  });

  setField(field: 'facts' | 'grounds', event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    this.content.update((current) => ({ ...current, [field]: text }));
  }

  setRuling(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.content.update((current) => ({
      ...current,
      ruling: MINUTA_RULINGS.includes(value as MinutaRuling)
        ? (value as MinutaRuling)
        : null,
    }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled() || !this.complete()) return;
    this.submit.emit(this.content());
  }
}
