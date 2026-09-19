// EvaluationForm (contrato CTG-0003c §5.7; [RN-PORTAL-110]; [UC-PORTAL-017]): as cinco dimensões
// de `EvaluationCreateDto.scores` com rótulo textual e controle `scores.<dim>`, comentário
// opcional, o aviso de publicação (`portal.evaluations.publicIndicator`) ANTES do envio e na
// confirmação — `result.publicNotice` só é traduzido se for exatamente essa chave; qualquer outra
// não vira texto. A escala das notas é `source_pending` (OD-P65): `scale` null → `<input
// type="number" step="1">` sem min/max (o servidor valida); lista → rádios por dimensão. Avaliar
// nunca é condição de nada: "pular" volta; comentário não vazio oferece abrir uma manifestação.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { PortalFieldErrorsDirective } from '../core/field-errors.directive';
import type {
  EvaluationCreateBody,
  EvaluationCreated,
} from '../data/portal-read.models';
import type { CommandStatus } from '../features/processos/processos.facade';

/** `EvaluationCreateDto.scores` (5). */
export const EVALUATION_DIMENSIONS = [
  'satisfaction',
  'quality',
  'deadline',
  'clarity',
  'channel',
] as const;

export type EvaluationDimension = (typeof EVALUATION_DIMENSIONS)[number];

/** A única chave admitida como texto de confirmação (§5.7). */
const PUBLIC_INDICATOR_KEY = 'portal.evaluations.publicIndicator';

const DIMENSION_LABEL_KEY: Readonly<Record<EvaluationDimension, string>> = {
  satisfaction: 'portal.forms.avaliacao.satisfacao',
  quality: 'portal.forms.avaliacao.qualidade',
  deadline: 'portal.forms.avaliacao.prazo_cumprido',
  clarity: 'portal.forms.avaliacao.clareza',
  channel: 'portal.forms.avaliacao.canal',
};

type Scores = Readonly<Record<EvaluationDimension, number | null>>;

const EMPTY_SCORES: Scores = {
  satisfaction: null,
  quality: null,
  deadline: null,
  clarity: null,
  channel: null,
};

@Component({
  selector: 'portal-evaluation-form',
  imports: [RouterLink, StynxTranslatePipe, PortalFieldErrorsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-subject-kind]': 'subjectKind()',
    '[attr.data-subject-id]': 'subjectId()',
    '[attr.data-status]': 'status()',
  },
  template: `
    <p data-public-indicator>{{ publicIndicatorKey | stynxTranslate }}</p>

    <form
      class="portal-evaluation-form"
      [portalFieldErrors]="fields()"
      (submit)="onSubmit($event)"
    >
      @for (dimension of dimensions; track dimension) {
        @if (scale(); as scale) {
          <fieldset [attr.data-dimension]="dimension">
            <legend>{{ labelKey(dimension) | stynxTranslate }}</legend>
            @for (value of scale; track value) {
              <label>
                <input
                  type="radio"
                  [name]="controlName(dimension)"
                  [value]="value"
                  [checked]="scores()[dimension] === value"
                  [disabled]="busy()"
                  (change)="setScore(dimension, value)"
                />
                <span>{{ value }}</span>
              </label>
            }
          </fieldset>
        } @else {
          <label [attr.data-dimension]="dimension">
            <span>{{ labelKey(dimension) | stynxTranslate }}</span>
            <input
              type="number"
              inputmode="numeric"
              step="1"
              [name]="controlName(dimension)"
              [value]="scores()[dimension] ?? ''"
              [disabled]="busy()"
              (input)="onScoreInput(dimension, $event)"
            />
          </label>
        }
        <p [id]="errorId(dimension)" data-field-error>
          @if (fields().includes(controlName(dimension))) {
            {{ 'portal.errors.validation_failed' | stynxTranslate }}
          }
        </p>
      }

      <label>
        <span>{{ 'portal.forms.avaliacao.comentario' | stynxTranslate }}</span>
        <textarea
          name="comment"
          rows="4"
          [value]="comment()"
          [disabled]="busy()"
          (input)="onCommentInput($event)"
        ></textarea>
      </label>

      @if (comment().trim().length > 0) {
        <p>
          <button
            type="button"
            data-open-manifestation
            (click)="manifestationRequested.emit()"
          >
            {{ 'portal.screens.t26.cmd.abrir_manifestacao' | stynxTranslate }}
          </button>
        </p>
      }

      <div class="portal-evaluation-actions" role="group">
        <button
          type="submit"
          class="portal-primary"
          data-submit
          [disabled]="busy()"
        >
          {{ 'portal.screens.t26.cmd.enviar' | stynxTranslate }}
        </button>
        @if (skipRoute(); as route) {
          <a [routerLink]="route" [attr.routerLink]="route" data-skip>{{
            'portal.forms.avaliacao.pular' | stynxTranslate
          }}</a>
        }
      </div>
    </form>

    @if (result(); as result) {
      <section role="status" data-result [attr.data-state]="result.state">
        @if (result.publicNotice === publicIndicatorKey) {
          <p data-public-notice>{{ publicIndicatorKey | stynxTranslate }}</p>
        }
      </section>
    }
  `,
})
export class EvaluationFormComponent {
  readonly subjectKind = input.required<'request' | 'manifestation'>();
  readonly subjectId = input.required<string>();
  /** Escala das notas: `source_pending` (OD-P65). `null` → numérico sem min/max. */
  readonly scale = input<readonly number[] | null>(null);
  readonly status = input<CommandStatus>('idle');
  readonly fields = input<readonly string[]>([]);
  readonly result = input<EvaluationCreated | null>(null);
  /** Rota de "pular" (volta à tela de origem); `null` → sem link. */
  readonly skipRoute = input<string | null>(null);
  readonly submitted = output<EvaluationCreateBody>();
  /** [UC-PORTAL-017] 2a → `/ouvidoria/nova`. */
  readonly manifestationRequested = output<void>();

  readonly dimensions = EVALUATION_DIMENSIONS;
  readonly publicIndicatorKey = PUBLIC_INDICATOR_KEY;
  readonly scores = signal<Scores>(EMPTY_SCORES);
  readonly comment = signal('');
  readonly busy = computed(() => this.status() === 'submitting');

  labelKey(dimension: EvaluationDimension): string {
    return DIMENSION_LABEL_KEY[dimension];
  }

  controlName(dimension: EvaluationDimension): string {
    return `scores.${dimension}`;
  }

  errorId(dimension: EvaluationDimension): string {
    return `${this.controlName(dimension)}-error`;
  }

  setScore(dimension: EvaluationDimension, value: number | null): void {
    this.scores.set({ ...this.scores(), [dimension]: value });
  }

  onScoreInput(dimension: EvaluationDimension, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = raw.trim().length > 0 ? Number(raw) : Number.NaN;
    this.setScore(dimension, Number.isFinite(parsed) ? parsed : null);
  }

  onCommentInput(event: Event): void {
    this.comment.set((event.target as HTMLTextAreaElement).value);
  }

  /** `{ subjectKind, subjectId, scores, comment? }` — validação (`AvaliacaoSchema`) só no servidor. */
  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.busy()) return;
    const scores = this.scores();
    const comment = this.comment().trim();
    this.submitted.emit({
      subjectKind: this.subjectKind(),
      subjectId: this.subjectId(),
      scores: {
        satisfaction: scores.satisfaction ?? Number.NaN,
        quality: scores.quality ?? Number.NaN,
        deadline: scores.deadline ?? Number.NaN,
        clarity: scores.clarity ?? Number.NaN,
        channel: scores.channel ?? Number.NaN,
      },
      ...(comment.length > 0 ? { comment } : {}),
    });
  }
}
