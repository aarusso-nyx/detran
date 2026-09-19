// T-09 Adesão ao SNE (contrato CTG-0003c §6; ficha IU-PORTAL-T09; [RN-PORTAL-123]; [DIVERGE-6]):
// tela SEPARADA da decisão de pagar — só a adesão (`SneConsent`) e o seu cancelamento, sobre
// `GET sne/enrollment`. Estados por `ReadStatus`/`CommandStatus`: `SNE_CONTACT_REQUIRED` marca os
// campos; `SNE_UPSTREAM_UNAVAILABLE` → "indisponível, seus prazos não mudam"; `ASSURANCE_INSUFFICIENT`
// (403, nível abaixo de `avancada` — a rota é `simples`, OD-P100) → banner com o passo de elevação
// (retomar=/sne) e o `AssuranceExplainer` — nunca "acesso negado"; `SNE_ALREADY_ENROLLED`/
// `SNE_NOT_ENROLLED` → releitura + banner. Saída: `/notificacoes`. Canal alternativo sempre.
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
import { RouterLink } from '@angular/router';
import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import {
  SessionFacade,
  isAssuranceLevel,
  type AssuranceLevel,
} from '../../../core/session.facade';
import type {
  SneEnrollmentCancelBody,
  SneEnrollmentCreateBody,
} from '../../../data/portal-read.models';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { AssuranceExplainerComponent } from '../../../shared/assurance-explainer.component';
import { SneConsentComponent } from '../../../shared/sne-consent.component';
import { NotificacoesFacade } from '../notificacoes.facade';

const SERVICE_KEY = 'adesao_sne';
const INBOX_ROUTE = '/notificacoes';
const ASSURANCE_INSUFFICIENT_CODE = 'PORTAL.ASSURANCE_INSUFFICIENT';
const SNE_UPSTREAM_UNAVAILABLE_CODE = 'PORTAL.SNE_UPSTREAM_UNAVAILABLE';
const SNE_CONTACT_REQUIRED_CODE = 'PORTAL.SNE_CONTACT_REQUIRED';
/** Teto de [RN-PORTAL-101] quando o 403 não traz `required`. */
const DEFAULT_REQUIRED_LEVEL: AssuranceLevel = 'avancada';

const STATE_KEYS = {
  loading: 'portal.screens.t09.state.loading',
  ineligible: 'portal.screens.t09.state.ineligible',
  errorRecoverable: 'portal.screens.t09.state.error_recoverable',
  unavailable: 'portal.screens.t09.state.unavailable',
} as const;

@Component({
  selector: 'portal-sne-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    AssuranceExplainerComponent,
    SneConsentComponent,
  ],
  providers: [NotificacoesFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-09',
    '[attr.data-status]': 'facade.enrollmentStatus()',
    '[attr.data-command-status]': 'facade.sneCommandStatus()',
    '[attr.aria-busy]':
      'facade.enrollmentStatus() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t09.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t09.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.enrollmentStatus() === 'loading') {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (stateTextKey(); as key) {
        <p data-state-text [attr.data-reason]="unavailableReason()">
          {{ key | stynxTranslate }}
        </p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.enrollmentError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
      @if (facade.sneCommandError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (insufficient(); as insufficient) {
      <portal-assurance-explainer
        [required]="insufficient.required"
        [current]="insufficient.current"
        [actKey]="serviceKey"
      />
    }

    @if (facade.enrollment(); as enrollment) {
      <portal-sne-consent
        [enrollment]="enrollment"
        [status]="facade.sneCommandStatus()"
        [fields]="contactFields()"
        (enroll)="onEnroll($event)"
        (cancel)="onCancel($event)"
      />
    }

    <p>
      <a [routerLink]="inboxRoute" [attr.routerLink]="inboxRoute">{{
        'portal.screens.t12.title' | stynxTranslate
      }}</a>
    </p>

    <portal-alternative-channel-note [serviceKey]="serviceKey" />
  `,
})
export class SnePageComponent {
  readonly facade = inject(NotificacoesFacade);
  private readonly session = inject(SessionFacade);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly stateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;
  readonly inboxRoute = INBOX_ROUTE;

  /** `missing[]` de SNE_CONTACT_REQUIRED (1:1 com `name` email/phone). */
  readonly contactFields = computed<readonly string[]>(() => {
    const error = this.facade.sneCommandError();
    return error?.code === SNE_CONTACT_REQUIRED_CODE ? error.fields : [];
  });

  /** 403 ASSURANCE_INSUFFICIENT { required, current } → explicador (nunca "acesso negado"). */
  readonly insufficient = computed<{
    readonly required: AssuranceLevel;
    readonly current: AssuranceLevel | null;
  } | null>(() => {
    const error = this.facade.sneCommandError();
    if (error?.code !== ASSURANCE_INSUFFICIENT_CODE) return null;
    const required = error.context['required'];
    const current = error.context['current'];
    return {
      required: isAssuranceLevel(required) ? required : DEFAULT_REQUIRED_LEVEL,
      current: isAssuranceLevel(current)
        ? current
        : this.session.assuranceLevel(),
    };
  });

  readonly unavailableReason = computed<string | null>(() => {
    const reason = this.facade.sneCommandError()?.context['unavailableReason'];
    return typeof reason === 'string' ? reason : null;
  });

  constructor() {
    void this.facade.loadEnrollment();
    afterRenderEffect(() => {
      const status = this.facade.enrollmentStatus();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && status === 'ready') {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  stateTextKey(): string | null {
    const error = this.facade.sneCommandError();
    if (error?.code === SNE_CONTACT_REQUIRED_CODE) return STATE_KEYS.ineligible;
    if (error?.code === SNE_UPSTREAM_UNAVAILABLE_CODE) {
      return STATE_KEYS.errorRecoverable;
    }
    if (this.facade.sneCommandStatus() === 'unavailable') {
      return STATE_KEYS.unavailable;
    }
    return null;
  }

  onEnroll(body: SneEnrollmentCreateBody): void {
    void this.facade.enroll(body);
  }

  onCancel(body: SneEnrollmentCancelBody): void {
    void this.facade.cancel(body);
  }

  reload(): void {
    void this.facade.loadEnrollment();
  }
}
