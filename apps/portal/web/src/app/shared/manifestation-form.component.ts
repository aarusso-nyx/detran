// ManifestationForm (contrato CTG-0003c §5.6; [RN-PORTAL-109]; [RN-PORTAL-122]; [UC-PORTAL-016];
// H.51): tipo (5 rádios), descrição com o hint "sem motivo determinante", sigilo, anonimato (só
// com sessão; sem sessão o envio é anônimo e a tela avisa que não haverá acompanhamento) e a
// finalidade da coleta com link à tela de dados. Recebimento irrecusável: o botão de enviar
// nunca é desabilitado por conteúdo (só durante `submitting`); `ManifestacaoSchema` só orienta —
// o corpo sobe como está e o servidor decide. Sem `AttachmentUploader` ([DIVERGE-19]:
// `attachmentIds: []`). O comprovante imediato (`receipt`) aparece em `role="status"` com protocolo,
// recebimento e o prazo do órgão (`agencyDueOn`, do servidor) e — só quando não anônima — o link
// de acompanhamento ([DIVERGE-20]).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { PortalFieldErrorsDirective } from '../core/field-errors.directive';
import type {
  ManifestationCreateBody,
  ManifestationCreated,
  ManifestationKind,
} from '../data/portal-read.models';
import type { CommandStatus } from '../features/processos/processos.facade';
import { ManifestacaoSchema } from '../forms/manifestacao.schema';
import { DeadlineCardComponent } from './deadline-card.component';

/** `ManifestationCreateDto.kind`; WF-PORTAL-004. */
export const MANIFESTATION_KINDS: readonly ManifestationKind[] = [
  'reclamacao',
  'denuncia',
  'sugestao',
  'elogio',
  'solicitacao',
];

const KIND_KEY_PREFIX = `portal.forms.manifestacao.tipo.`;
const OWN_DATA_ROUTE = '/privacidade/meus-dados';
const MANIFESTATION_ROUTE_PREFIX = '/ouvidoria/';

@Component({
  selector: 'portal-manifestation-form',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    PortalFieldErrorsDirective,
    DeadlineCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-status]': 'status()',
    '[attr.data-anonymous]': 'anonymous() ? "true" : "false"',
  },
  template: `
    <form
      class="portal-manifestation-form"
      [portalFieldErrors]="fields()"
      (submit)="onSubmit($event)"
    >
      <fieldset>
        <legend>{{ 'portal.forms.manifestacao.tipo' | stynxTranslate }}</legend>
        @for (option of kinds; track option) {
          <label>
            <input
              type="radio"
              name="kind"
              [value]="option"
              [checked]="kind() === option"
              [disabled]="busy()"
              (change)="kind.set(option)"
            />
            <span>{{ kindKey(option) | stynxTranslate }}</span>
          </label>
        }
      </fieldset>
      <p id="kind-error" data-field-error>
        @if (fields().includes('kind')) {
          {{ 'portal.errors.manifestation_kind_invalid' | stynxTranslate }}
        }
      </p>

      <label>
        <span>{{
          'portal.forms.manifestacao.descricao' | stynxTranslate
        }}</span>
        <textarea
          name="text"
          rows="6"
          [value]="text()"
          [disabled]="busy()"
          (input)="text.set(textOf($event))"
        ></textarea>
      </label>
      <p id="portal-manifestation-hint" data-hint>
        {{ 'portal.forms.manifestacao.hint' | stynxTranslate }}
      </p>
      <p id="text-error" data-field-error>
        @if (fields().includes('text')) {
          {{ 'portal.errors.validation_failed' | stynxTranslate }}
        }
      </p>

      <label>
        <input
          type="checkbox"
          name="confidential"
          [checked]="confidential()"
          [disabled]="busy()"
          (change)="confidential.set(checkedOf($event))"
        />
        <span>{{ 'portal.forms.manifestacao.sigilo' | stynxTranslate }}</span>
      </label>

      @if (sessionActive()) {
        <label>
          <input
            type="checkbox"
            name="anonymous"
            [checked]="anonymousChoice()"
            [disabled]="busy()"
            (change)="anonymousChoice.set(checkedOf($event))"
          />
          <span>{{
            'portal.forms.manifestacao.anonimo' | stynxTranslate
          }}</span>
        </label>
      }
      @if (anonymous()) {
        <p role="status" data-anonymous-notice>
          {{
            'portal.forms.manifestacao.anonimo_sem_acompanhamento'
              | stynxTranslate
          }}
        </p>
      }

      <p data-purpose>
        {{ 'portal.forms.manifestacao.finalidade' | stynxTranslate }}
        <a [routerLink]="ownDataRoute" [attr.routerLink]="ownDataRoute">{{
          'portal.screens.t24.title' | stynxTranslate
        }}</a>
      </p>

      @if (localHint(); as hint) {
        <p role="status" data-local-hint>{{ hint | stynxTranslate }}</p>
      }

      <button
        type="submit"
        class="portal-primary"
        data-submit
        [disabled]="busy()"
      >
        {{ 'portal.screens.t21.cmd.enviar' | stynxTranslate }}
      </button>
    </form>

    @if (receipt(); as receipt) {
      <section role="status" data-receipt class="portal-manifestation-receipt">
        <dl>
          <dt>{{ 'portal.common.receipt.number' | stynxTranslate }}</dt>
          <dd data-protocol>{{ receipt.protocol }}</dd>
          <dt>{{ 'portal.common.receipt.issued_at' | stynxTranslate }}</dt>
          <dd>
            <time [attr.datetime]="receipt.receivedAt">{{
              receipt.receivedAt | stynxIntlDate: dateTimeFormat
            }}</time>
          </dd>
        </dl>
        <portal-deadline-card
          [dueOn]="receipt.agencyDueOn"
          ownedBy="agency"
          labelKey="portal.screens.t22.field.prazo_orgao"
        />
        @if (!receipt.anonymous) {
          <p>
            <a
              [routerLink]="manifestationRoute(receipt.manifestationId)"
              [attr.routerLink]="manifestationRoute(receipt.manifestationId)"
              data-follow-up
              >{{ 'portal.screens.t22.title' | stynxTranslate }}</a
            >
          </p>
        } @else {
          <p data-anonymous-receipt>
            {{
              'portal.forms.manifestacao.anonimo_sem_acompanhamento'
                | stynxTranslate
            }}
          </p>
        }
      </section>
    }
  `,
})
export class ManifestationFormComponent {
  /** `SessionFacade.active()`: `false` → `anonymous` forçado `true`. */
  readonly sessionActive = input.required<boolean>();
  readonly status = input<CommandStatus>('idle');
  /** `['kind']` de MANIFESTATION_KIND_INVALID. */
  readonly fields = input<readonly string[]>([]);
  /** Comprovante imediato. */
  readonly receipt = input<ManifestationCreated | null>(null);
  readonly submitted = output<ManifestationCreateBody>();

  readonly kinds = MANIFESTATION_KINDS;
  readonly ownDataRoute = OWN_DATA_ROUTE;
  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };
  readonly kind = signal<ManifestationKind | null>(null);
  readonly text = signal('');
  readonly confidential = signal(false);
  readonly anonymousChoice = signal(false);

  readonly busy = computed(() => this.status() === 'submitting');
  /** Sem sessão: anônimo fixo (H.51; OD-P44). */
  readonly anonymous = computed(
    () => !this.sessionActive() || this.anonymousChoice(),
  );
  /** Orientação local (`ManifestacaoSchema`); nunca impede o envio. */
  readonly localHint = computed<string | null>(() => {
    const kind = this.kind();
    if (kind === null && this.text().length === 0) return null;
    const parsed = ManifestacaoSchema.safeParse({
      kind,
      text: this.text(),
      attachmentIds: [],
    });
    return parsed.success ? null : 'portal.screens.t21.state.erro_recuperavel';
  });

  kindKey(kind: string): string {
    return `${KIND_KEY_PREFIX}${kind}`;
  }

  manifestationRoute(manifestationId: string): string {
    return `${MANIFESTATION_ROUTE_PREFIX}${manifestationId}`;
  }

  textOf(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }

  checkedOf(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  /**
   * Emite o corpo TAL COMO ESTÁ (recebimento irrecusável; o servidor decide): sem tipo escolhido
   * o campo vai ausente e o servidor responde `400 MANIFESTATION_KIND_INVALID` — nunca um tipo
   * escolhido pelo cliente.
   */
  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.busy()) return;
    const kind = this.kind();
    const body: Partial<ManifestationCreateBody> = {
      ...(kind !== null ? { kind } : {}),
      text: this.text(),
      confidential: this.confidential(),
      attachmentIds: [],
      anonymous: this.anonymous(),
    };
    this.submitted.emit(body as ManifestationCreateBody);
  }
}
