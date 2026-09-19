// T-21 Nova manifestação (contrato CTG-0003c §6; ficha IU-PORTAL-T21; [RN-PORTAL-109]; H.51):
// sem leitura prévia e sem guarda — anônimo admitido (a sessão é opcional). O `ManifestationForm`
// envia pela facade; o comprovante imediato aparece na mesma tela (`role="status"`) com o link ao
// acompanhamento só quando não anônima. Recebimento irrecusável: nenhuma combinação é bloqueada no
// cliente; `400 MANIFESTATION_KIND_INVALID` marca o campo; qualquer 5xx/offline é "indisponível"
// com o canal alternativo — nunca um texto que sugira recusa.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import { SessionFacade } from '../../../core/session.facade';
import type { ManifestationCreateBody } from '../../../data/portal-read.models';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { ManifestationFormComponent } from '../../../shared/manifestation-form.component';
import { AtendimentoFacade } from '../atendimento.facade';

const SERVICE_KEY = 'manifestar';
const KIND_INVALID_CODE = 'PORTAL.MANIFESTATION_KIND_INVALID';

const STATE_KEYS = {
  submitting: 'portal.screens.t21.state.carregando',
  recoverable: 'portal.screens.t21.state.erro_recuperavel',
  unavailable: 'portal.screens.t21.state.indisponivel',
} as const;

@Component({
  selector: 'portal-manifestation-new-page',
  imports: [
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    ManifestationFormComponent,
  ],
  providers: [AtendimentoFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-21',
    '[attr.data-status]': 'facade.createStatus()',
    '[attr.aria-busy]':
      'facade.createStatus() === "submitting" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t21.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t21.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.createStatus() === 'submitting') {
        <detran-loading-state [label]="stateKeys.submitting | stynxTranslate" />
      }
      @if (stateTextKey(); as key) {
        <p data-state-text>{{ key | stynxTranslate }}</p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.createError(); as error) {
        <portal-error-banner [error]="error" (retry)="retry()" />
      }
    </div>

    <portal-manifestation-form
      [sessionActive]="session.active()"
      [status]="facade.createStatus()"
      [fields]="facade.createError()?.fields ?? []"
      [receipt]="facade.created()"
      (submitted)="onSubmitted($event)"
    />

    <portal-alternative-channel-note [serviceKey]="serviceKey" />
  `,
})
export class ManifestationNewPageComponent {
  readonly facade = inject(AtendimentoFacade);
  readonly session = inject(SessionFacade);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private lastBody: ManifestationCreateBody | null = null;
  private focused = false;

  readonly stateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;

  readonly stateTextKey = computed<string | null>(() => {
    const status = this.facade.createStatus();
    const code = this.facade.createError()?.code ?? null;
    if (code === KIND_INVALID_CODE) return STATE_KEYS.recoverable;
    if (
      status === 'error' ||
      status === 'unavailable' ||
      status === 'offline'
    ) {
      return STATE_KEYS.unavailable;
    }
    return null;
  });

  constructor() {
    // Confirmação de envio anunciada (§7.3): o comprovante é `role="status"`; o foco vai ao título.
    afterRenderEffect(() => {
      const created = this.facade.created();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (created && !this.focused) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  onSubmitted(body: ManifestationCreateBody): void {
    this.lastBody = body;
    this.focused = false;
    void this.facade.create(body);
  }

  retry(): void {
    if (this.lastBody) void this.facade.create(this.lastBody);
  }
}
