// SneConsent (contrato CTG-0003c §5.2; [RN-PORTAL-123]; A5; ficha T09): os QUATRO efeitos da
// adesão ao SNE (`portal.legal.efeitos_sne.v1.<efeito>`, nomes de A5) lado a lado, um por linha,
// ANTES do botão; formulário com e-mail, celular, canal e o checkbox único de aceite (não
// pré-marcado; botão desabilitado até marcá-lo); `enroll` emite o corpo do fio — `effectsAck` com
// o enum do OpenAPI (`SNE_WIRE_EFFECTS`, OD-P61) e `textVersion` = `LEGAL_TEXT_VERSION`. Estado
// "aderido": `since`/canal e o botão de cancelar SEMPRE visível, precedido do aviso do efeito
// `cancelamento` e de um motivo opcional. NENHUMA faixa de pagamento, "60%/40%" nem link a
// pagamento aqui: adesão e decisão de pagar são telas distintas ([RN-PORTAL-123] trava 1). A
// validação de forma (`AdesaoSneSchema`) só orienta — o servidor decide (`SNE_CONTACT_REQUIRED`).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { PortalFieldErrorsDirective } from '../core/field-errors.directive';
import type {
  SneChannel,
  SneEnrollment,
  SneEnrollmentCancelBody,
  SneEnrollmentCreateBody,
  WireSneEffect,
} from '../data/portal-read.models';
import type { CommandStatus } from '../features/processos/processos.facade';
import { AdesaoSneSchema } from '../forms/adesao-sne.schema';
import {
  LEGAL_TEXT_VERSION,
  SNE_EFFECTS,
} from './consequence-dialog.component';

/** Enum do fio (`SneEnrollmentCreateDto.consent.effectsAck`; OD-P61) — a tela mostra os nomes de A5. */
export const SNE_WIRE_EFFECTS: readonly WireSneEffect[] = [
  'ciencia_ficta',
  'canal_exclusivo',
  'desconto_60',
  'cancelamento',
];

const DEFAULT_CHANNELS: readonly SneChannel[] = ['email', 'sne', 'push'];
const EFFECT_KEY_PREFIX = `portal.legal.efeitos_sne.v1.`;
const CHANNEL_KEY_PREFIX = `portal.forms.preferencias.canal.`;

@Component({
  selector: 'portal-sne-consent',
  imports: [StynxTranslatePipe, StynxIntlDatePipe, PortalFieldErrorsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-text-version': LEGAL_TEXT_VERSION,
    '[attr.data-enrolled]': 'enrolled() ? "true" : "false"',
    '[attr.data-status]': 'status()',
  },
  template: `
    <section
      class="portal-sne-effects"
      aria-labelledby="portal-sne-effects-title"
    >
      <p id="portal-sne-effects-title">
        {{ 'portal.legal.efeitos_sne.v1' | stynxTranslate }}
      </p>
      <ol>
        @for (effect of effects; track effect) {
          <li [attr.data-effect]="effect">
            {{ effectKey(effect) | stynxTranslate }}
          </li>
        }
      </ol>
    </section>

    @if (enrollment(); as enrollment) {
      @if (enrollment.enrolled) {
        <section class="portal-sne-enrolled" data-enrolled-state>
          <p role="status">
            {{ 'portal.screens.t09.state.aderido' | stynxTranslate }}
          </p>
          <dl>
            @if (enrollment.since; as since) {
              <dt>{{ 'portal.common.receipt.issued_at' | stynxTranslate }}</dt>
              <dd>
                <time [attr.datetime]="since">{{ since | stynxIntlDate }}</time>
              </dd>
            }
            @if (enrollment.channel; as channel) {
              <dt>{{ 'portal.forms.preferencias.canal' | stynxTranslate }}</dt>
              <dd [attr.data-token]="channel">
                {{ channelKey(channel) | stynxTranslate }}
              </dd>
            }
          </dl>
          <form
            class="portal-sne-cancel"
            [portalFieldErrors]="fields()"
            (submit)="onCancel($event)"
          >
            <p data-cancel-effect>
              {{ effectKey('cancelamento') | stynxTranslate }}
            </p>
            <label>
              <span>{{
                'portal.forms.cancelamento_sne.motivo' | stynxTranslate
              }}</span>
              <textarea
                name="reason"
                rows="3"
                [value]="reason()"
                [disabled]="busy()"
                (input)="reason.set(textOf($event))"
              ></textarea>
            </label>
            <button
              type="submit"
              data-cancel
              class="portal-sne-confirm"
              [attr.aria-disabled]="
                !enrollment.cancelable || busy() ? 'true' : null
              "
              [disabled]="busy()"
            >
              {{ 'portal.screens.t09.cmd.cancel' | stynxTranslate }}
            </button>
          </form>
        </section>
      } @else {
        <form
          class="portal-sne-form"
          [portalFieldErrors]="fields()"
          (submit)="onEnroll($event)"
        >
          <p role="status">
            {{ 'portal.screens.t09.state.nao_aderido' | stynxTranslate }}
          </p>
          <label>
            <span>{{ 'portal.forms.adesao_sne.email' | stynxTranslate }}</span>
            <input
              type="email"
              name="email"
              autocomplete="email"
              [value]="email()"
              [disabled]="busy()"
              (input)="email.set(textOf($event))"
            />
          </label>
          <p id="email-error" data-field-error>
            @if (fields().includes('email')) {
              {{ 'portal.errors.sne_contact_required' | stynxTranslate }}
            }
          </p>
          <label>
            <span>{{
              'portal.forms.adesao_sne.celular' | stynxTranslate
            }}</span>
            <input
              type="tel"
              name="phone"
              autocomplete="tel-national"
              inputmode="numeric"
              [value]="phone()"
              [disabled]="busy()"
              (input)="phone.set(textOf($event))"
            />
          </label>
          <p id="phone-error" data-field-error>
            @if (fields().includes('phone')) {
              {{ 'portal.errors.sne_contact_required' | stynxTranslate }}
            }
          </p>
          <label>
            <span>{{
              'portal.forms.preferencias.canal' | stynxTranslate
            }}</span>
            <select
              name="channel"
              [value]="channel()"
              [disabled]="busy()"
              (change)="channel.set(channelOf($event))"
            >
              @for (option of channels(); track option) {
                <option [value]="option" [selected]="option === channel()">
                  {{ channelKey(option) | stynxTranslate }}
                </option>
              }
            </select>
          </label>
          @if (localHint(); as hint) {
            <p role="status" data-local-hint>{{ hint | stynxTranslate }}</p>
          }
          <label class="portal-sne-ack">
            <input
              type="checkbox"
              name="aceite"
              [checked]="accepted()"
              [disabled]="busy()"
              (change)="accepted.set(checkedOf($event))"
            />
            <span>{{ 'portal.forms.adesao_sne.aceite' | stynxTranslate }}</span>
          </label>
          <button
            type="submit"
            class="portal-sne-confirm"
            data-enroll
            [disabled]="!accepted() || busy()"
          >
            {{ 'portal.screens.t09.cmd.enroll' | stynxTranslate }}
          </button>
        </form>
      }
    } @else {
      <p role="status">
        {{ 'portal.screens.t09.state.loading' | stynxTranslate }}
      </p>
    }
  `,
})
export class SneConsentComponent {
  /** `null` enquanto carrega. */
  readonly enrollment = input.required<SneEnrollment | null>();
  readonly status = input<CommandStatus>('idle');
  /** `missing[]` de SNE_CONTACT_REQUIRED → `PortalFieldErrorsDirective`. */
  readonly fields = input<readonly string[]>([]);
  /** `SneEnrollmentCreateDto.channel?`; rótulos `portal.forms.preferencias.canal.<canal>`. */
  readonly channels = input<readonly SneChannel[]>(DEFAULT_CHANNELS);
  readonly enroll = output<SneEnrollmentCreateBody>();
  // eslint-disable-next-line @angular-eslint/no-output-native -- nome fixado pelo contrato CTG-0003c §5.2
  readonly cancel = output<SneEnrollmentCancelBody>();

  readonly effects = SNE_EFFECTS;
  readonly email = signal('');
  readonly phone = signal('');
  readonly channel = signal<SneChannel>(DEFAULT_CHANNELS[0]);
  readonly accepted = signal(false);
  readonly reason = signal('');

  readonly enrolled = computed(() => this.enrollment()?.enrolled === true);
  readonly busy = computed(() => this.status() === 'submitting');
  /** Orientação local de forma (`AdesaoSneSchema`); nunca bloqueia o envio. */
  readonly localHint = computed<string | null>(() => {
    if (this.email().length === 0 && this.phone().length === 0) return null;
    const parsed = AdesaoSneSchema.safeParse({
      email: this.email(),
      phone: this.phone(),
      consent: {
        textVersion: LEGAL_TEXT_VERSION,
        effectsAck: [...SNE_WIRE_EFFECTS],
      },
    });
    return parsed.success ? null : 'portal.screens.t09.state.ineligible';
  });

  effectKey(effect: string): string {
    return `${EFFECT_KEY_PREFIX}${effect}`;
  }

  channelKey(channel: string): string {
    return `${CHANNEL_KEY_PREFIX}${channel}`;
  }

  textOf(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  checkedOf(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  channelOf(event: Event): SneChannel {
    const value = (event.target as HTMLSelectElement).value;
    return this.channels().find((option) => option === value) ?? this.channel();
  }

  onEnroll(event: Event): void {
    event.preventDefault();
    if (!this.accepted() || this.busy()) return;
    this.enroll.emit({
      email: this.email(),
      phone: this.phone(),
      channel: this.channel(),
      consent: {
        textVersion: LEGAL_TEXT_VERSION,
        effectsAck: [...SNE_WIRE_EFFECTS],
      },
    });
  }

  onCancel(event: Event): void {
    event.preventDefault();
    if (this.busy() || this.enrollment()?.cancelable === false) return;
    const reason = this.reason().trim();
    this.cancel.emit(reason.length > 0 ? { reason } : {});
  }
}
