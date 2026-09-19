// /notificacoes/preferencias (contrato CTG-0003c §6; OD-P38/OD-P87/OD-P88): canal preferencial
// de notificação (rádios sem valor pré-selecionado — `me.preferences` é `null`) e o opt-in de
// push por gesto explícito (`PushService.subscribe()` só no clique). O salvamento (`PUT
// preferences`) não tem `If-Match` de origem nesta rodada (OD-P87): a página abre já com o aviso
// "indisponível nesta versão" em `role="status"`, o formulário continua editável e o botão salvar
// ativo — o 428/422 do servidor é apresentado como indisponível (nunca "recarregue"), com o canal
// alternativo. Push `unsupported`/`unavailable` → texto + botão `aria-disabled`; `denied`/`error`
// → texto/banner; nunca assinatura sem clique.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { StynxBannerComponent, StynxTranslatePipe } from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
import { PushService } from '../../../core/push.service';
import { SessionFacade } from '../../../core/session.facade';
import type { SneChannel } from '../../../data/portal-read.models';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { NotificacoesFacade } from '../notificacoes.facade';

const CHANNELS: readonly SneChannel[] = ['push', 'email', 'sne'];
const CHANNEL_KEY_PREFIX = `portal.forms.preferencias.canal.`;
const PUSH_STATUS_KEY_PREFIX = `portal.notifications.preferences.push_`;

@Component({
  selector: 'portal-preferences-page',
  imports: [
    StynxTranslatePipe,
    StynxBannerComponent,
    PortalErrorBannerComponent,
    PortalFieldErrorsDirective,
    AlternativeChannelNoteComponent,
  ],
  providers: [NotificacoesFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': '',
    '[attr.data-preferences-status]': 'facade.preferencesStatus()',
    '[attr.data-push-status]': 'push.status()',
    '[attr.data-server-preferences]':
      'serverPreferences() === null ? "null" : "present"',
  },
  template: `
    <h1 tabindex="-1">
      {{ 'portal.notifications.preferences.title' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      <stynx-banner
        tone="info"
        [message]="'portal.states.unavailable_in_version' | stynxTranslate"
      />
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.preferencesError(); as error) {
        <portal-error-banner [error]="error" (retry)="save()" />
      }
      @if (push.status() === 'error' && push.error(); as error) {
        <portal-error-banner [error]="error" (retry)="subscribePush()" />
      }
    </div>

    <form
      class="portal-preferences-form"
      [portalFieldErrors]="facade.preferencesError()?.fields ?? []"
      (submit)="onSubmit($event)"
    >
      <fieldset>
        <legend>
          {{ 'portal.forms.preferencias.canal' | stynxTranslate }}
        </legend>
        @for (option of channels; track option) {
          <label>
            <input
              type="radio"
              name="channel"
              [value]="option"
              [checked]="channel() === option"
              [disabled]="saving()"
              (change)="channel.set(option)"
            />
            <span>{{ channelKey(option) | stynxTranslate }}</span>
          </label>
        }
      </fieldset>
      <p id="channel-error" data-field-error></p>

      <section class="portal-push" data-push [attr.data-status]="push.status()">
        @if (pushStatusKey(); as key) {
          <p data-push-status>{{ key | stynxTranslate }}</p>
        }
        @if (push.status() === 'subscribed') {
          <button
            type="button"
            data-push-unsubscribe
            (click)="unsubscribePush()"
          >
            {{
              'portal.notifications.preferences.push_unsubscribe'
                | stynxTranslate
            }}
          </button>
        } @else {
          <button
            type="button"
            data-push-opt-in
            [attr.aria-disabled]="pushOptInEnabled() ? null : 'true'"
            (click)="subscribePush()"
          >
            {{
              'portal.notifications.preferences.push_opt_in' | stynxTranslate
            }}
          </button>
        }
      </section>

      <button
        type="submit"
        class="portal-primary"
        data-save
        [disabled]="saving()"
      >
        {{ 'portal.common.action.save' | stynxTranslate }}
      </button>
    </form>

    <portal-alternative-channel-note />
  `,
})
export class PreferencesPageComponent {
  readonly facade = inject(NotificacoesFacade);
  readonly push = inject(PushService);
  private readonly session = inject(SessionFacade);

  readonly channels = CHANNELS;
  /** Nenhum valor pré-selecionado: `me.preferences` é `null` nesta rodada (OD-P38). */
  readonly channel = signal<SneChannel | null>(null);
  /** `me.preferences` tal como chega (`null`, OD-P38) — exposto para o dia em que existir. */
  readonly serverPreferences = computed<unknown>(
    () => this.session.account()?.preferences ?? null,
  );
  readonly saving = computed(
    () => this.facade.preferencesStatus() === 'submitting',
  );
  readonly pushOptInEnabled = computed(() => {
    const status = this.push.status();
    return status === 'idle' || status === 'denied' || status === 'error';
  });

  channelKey(channel: string): string {
    return `${CHANNEL_KEY_PREFIX}${channel}`;
  }

  /** `portal.notifications.preferences.push_<status>` (OD-P89); `idle`/`subscribing` → só o botão; `error` → banner. */
  pushStatusKey(): string | null {
    const status = this.push.status();
    if (status === 'idle' || status === 'subscribing' || status === 'error') {
      return null;
    }
    return `${PUSH_STATUS_KEY_PREFIX}${status}`;
  }

  /** SÓ pelo clique do cidadão (§4.2). */
  subscribePush(): void {
    if (!this.pushOptInEnabled()) return;
    void this.push.subscribe();
  }

  unsubscribePush(): void {
    void this.push.unsubscribe();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.save();
  }

  /** `PUT preferences { channel, pushSubscription? }` — sem canal escolhido nada é enviado. */
  save(): void {
    const channel = this.channel();
    if (channel === null || this.saving()) return;
    const pushSubscription =
      channel === 'push' ? this.push.preferencesPayload() : null;
    void this.facade.savePreferences({
      channel,
      ...(pushSubscription ? { pushSubscription } : {}),
    });
  }
}
