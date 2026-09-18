// PortalErrorBanner (contrato CTG-0003a §3.4; catálogo §8; §8 a11y): apresenta um
// `ErrorPresentation` com o `StynxBannerComponent` do kit (nunca reimplementado). `error` →
// `role="alert"` + `aria-live="assertive"` e recebe o foco ao aparecer; `warning`/`info` →
// `role="status"` + `aria-live="polite"`. O próximo passo é `<a routerLink>` quando há rota, ou
// `<button>` para `retry`/`reload`; o canal alternativo aparece sempre que `alternativeChannel`.
// Erros nunca vão em toast (toasts ficam para confirmações não bloqueantes).
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, type UrlTree } from '@angular/router';
import { StynxBannerComponent, StynxTranslatePipe } from '@detran/ui';
import { AlternativeChannelNoteComponent } from '../shared/alternative-channel-note.component';
import { BrandService } from './brand.service';
import {
  LOGIN_ROUTE,
  type ErrorPresentation,
  type NextStep,
} from './error-boundary';

/** Rótulo do próximo passo (contrato §3.2); `null` = sem controle. */
const NEXT_STEP_LABEL: Readonly<Record<NextStep, string | null>> = {
  login: 'portal.common.action.login',
  reauth: 'portal.common.action.login',
  elevation: 'portal.screens.t27.cmd.elevar',
  entitlement_help: 'portal.common.link.ouvidoria',
  service_unavailable: 'portal.common.label.alternative_channel',
  ineligible: null,
  retry: 'portal.common.action.retry',
  reload: 'portal.common.action.retry',
  inline_fields: null,
  support: 'portal.common.link.suporte',
  existing_request: 'portal.requests.nextAction.PEDIDO_EM_COMPOSICAO',
  payment: 'portal.requests.nextAction.AGUARDANDO_PAGAMENTO',
  enrollment: 'portal.services.adesao_sne',
  representation: 'portal.common.link.conta',
  none: null,
};

const TONE: Readonly<
  Record<ErrorPresentation['severity'], 'error' | 'warning' | 'info'>
> = { error: 'error', warning: 'warning', info: 'info' };

@Component({
  selector: 'portal-error-banner',
  imports: [
    RouterLink,
    StynxBannerComponent,
    StynxTranslatePipe,
    AlternativeChannelNoteComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error(); as presentation) {
      <div
        #region
        class="portal-error-banner"
        tabindex="-1"
        [attr.role]="presentation.severity === 'error' ? 'alert' : 'status'"
        [attr.aria-live]="
          presentation.severity === 'error' ? 'assertive' : 'polite'
        "
        [attr.data-code]="presentation.code"
        [attr.data-status]="presentation.status"
        [attr.data-next-step]="presentation.nextStep"
      >
        <stynx-banner
          [tone]="tone()"
          [message]="
            presentation.messageKey | stynxTranslate: presentation.messageParams
          "
        />
        @if (presentation.nextStep === 'ineligible') {
          <dl class="portal-error-details">
            @if (reason(); as text) {
              <dt>{{ 'portal.common.label.reason' | stynxTranslate }}</dt>
              <dd data-reason>{{ text }}</dd>
            }
          </dl>
        }
        @if (labelKey(); as key) {
          @if (nextStepTree(); as tree) {
            <a [routerLink]="tree" data-next-step>{{ key | stynxTranslate }}</a>
          } @else if (supportHref(); as href) {
            <a [attr.href]="href" rel="noopener" data-next-step>{{
              key | stynxTranslate
            }}</a>
          } @else if (isRetry()) {
            <button type="button" data-next-step (click)="retry.emit()">
              {{ key | stynxTranslate }}
            </button>
          }
        }
        @if (presentation.alternativeChannel) {
          <portal-alternative-channel-note
            [note]="alternativeNote()"
            [serviceKey]="serviceKey()"
          />
        }
      </div>
    }
  `,
})
export class PortalErrorBannerComponent {
  private readonly router = inject(Router);
  private readonly brand = inject(BrandService);
  private readonly region = viewChild<ElementRef<HTMLElement>>('region');

  readonly error = input.required<ErrorPresentation | null>();
  /** `nextStep` `retry` | `reload`. */
  readonly retry = output<void>();
  /**
   * Avisos (`warning`/`info`). O banner não renderiza controle próprio de fechar: não há chave
   * de rótulo com fonte (OD-P58 não a lista) — o hospedeiro fecha o aviso pelo seu contexto.
   */
  readonly dismiss = output<void>();

  readonly tone = computed(() => TONE[this.error()?.severity ?? 'error']);
  readonly labelKey = computed<string | null>(() => {
    const presentation = this.error();
    return presentation ? NEXT_STEP_LABEL[presentation.nextStep] : null;
  });
  readonly isRetry = computed(() => {
    const step = this.error()?.nextStep;
    return step === 'retry' || step === 'reload';
  });
  readonly nextStepTree = computed<UrlTree | null>(() => {
    const presentation = this.error();
    if (!presentation) return null;
    const step = presentation.nextStep;
    // Entrada gov.br é sempre a do shell (`/`), mesmo sem rota de retomada.
    const route =
      presentation.nextStepRoute ??
      (step === 'login' || step === 'reauth' ? LOGIN_ROUTE : null);
    return route ? this.router.parseUrl(route) : null;
  });
  /** `support` → `brand.supportUrl` (externo). */
  readonly supportHref = computed<string | null>(() => {
    if (this.error()?.nextStep !== 'support') return null;
    const brand = this.brand.state();
    return brand.status === 'available' ? (brand.supportUrl ?? null) : null;
  });
  readonly reason = computed<string | null>(() => {
    const reason = this.error()?.context['reason'];
    return typeof reason === 'string' ? reason : null;
  });
  readonly alternativeNote = computed<string | null>(() => {
    const context = this.error()?.context ?? {};
    const note = context['alternativeChannelNote'] ?? context['alternative'];
    return typeof note === 'string' ? note : null;
  });
  readonly serviceKey = computed<string | null>(() => {
    const key = this.error()?.context['serviceKey'];
    return typeof key === 'string' ? key : null;
  });

  constructor() {
    // Erro bloqueante recebe o foco ao aparecer (§8); avisos não movem o foco do usuário.
    afterRenderEffect(() => {
      const presentation = this.error();
      const region = this.region();
      untracked(() => {
        if (presentation?.severity === 'error' && region) {
          region.nativeElement.focus();
        }
      });
    });
  }
}
