// T-27 Elevação de nível (contrato CTG-0003c §6; ficha IU-PORTAL-T27; [RN-PORTAL-101/102/105];
// [UC-PORTAL-019]): explica qual nível falta e por quê (`AssuranceExplainer`, níveis como tokens
// traduzidos — nunca a cor do selo como condição), oferece os caminhos de verificação e leva ao
// gov.br (`window.location.assign(redirectUrl)` — a facade não toca em `window`). O ato retoma onde
// parou: o lembrete de retomada mostra a rota (`data-resume-route`); com nível já suficiente a
// página retoma de imediato. Retorno do gov.br: os nomes dos parâmetros são `source_pending`
// (OD-P15) — a página só chama `complete()` quando ambos existirem. Toda falha vira banner com os
// caminhos restantes (nunca beco sem saída); `422 SERVICE_UNAVAILABLE` (elevação pendente nesta
// rodada, OD-P15) → indisponível com canal, nunca elevação simulada. `resumeToken` nunca em tela.
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DetranLoadingStateComponent,
  StynxBannerComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import type { ElevationMethod } from '../../../core/session.facade';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import {
  AssuranceExplainerComponent,
  ELEVATION_METHODS,
} from '../../../shared/assurance-explainer.component';
import { AssinaturaFacade } from '../assinatura.facade';

/** Parâmetros da URL de retorno do gov.br: nomes `source_pending` (OD-P15) — forma provisória. */
const RETURN_ELEVATION_ID_PARAM = 'elevationId';
const RETURN_RESUME_TOKEN_PARAM = 'resumeToken';
/** Nível que nunca é exigido ([RN-PORTAL-101] c). */
const NEVER_REQUIRED_LEVEL = 'qualificada';
const METHOD_KEY_PREFIX = `portal.forms.elevacao.caminho.`;

const STATE_KEYS = {
  loading: 'portal.screens.t27.state.carregando',
  recoverable: 'portal.screens.t27.state.erro_recuperavel',
  unavailable: 'portal.screens.t27.state.indisponivel',
} as const;

@Component({
  selector: 'portal-elevation-page',
  imports: [
    StynxTranslatePipe,
    StynxBannerComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    AssuranceExplainerComponent,
  ],
  providers: [AssinaturaFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-27',
    '[attr.data-phase]': 'facade.phase()',
    '[attr.aria-busy]': 'busy() ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t27.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t27.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (busy()) {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (facade.context(); as context) {
        <div data-resume-hint [attr.data-resume-route]="context.resumeRoute">
          <stynx-banner
            tone="info"
            [message]="'portal.screens.t27.resume_hint' | stynxTranslate"
          />
        </div>
      }
      @if (stateTextKey(); as key) {
        <p data-state-text [attr.data-reason]="unavailableReason()">
          {{ key | stynxTranslate }}
        </p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (qualifiedNeverRequired()) {
        <stynx-banner
          tone="error"
          [message]="
            'portal.errors.assurance_qualified_never_required' | stynxTranslate
          "
        />
      }
      @if (facade.error(); as error) {
        <portal-error-banner [error]="error" />
      }
    </div>

    @if (facade.context(); as context) {
      @if (!context.sufficient && !qualifiedNeverRequired()) {
        <portal-assurance-explainer
          [required]="context.required"
          [current]="context.current"
          [actKey]="context.actKey ?? ''"
          (methodSelected)="start($event)"
        />
        <div class="portal-elevation-methods" role="group">
          @for (method of methods; track method) {
            <button
              type="button"
              class="portal-primary"
              [attr.data-method]="method"
              [disabled]="busy()"
              (click)="start(method)"
            >
              {{ 'portal.screens.t27.cmd.elevar' | stynxTranslate }}
              — {{ methodKey(method) | stynxTranslate }}
            </button>
          }
        </div>
      }
    }

    <portal-alternative-channel-note />
  `,
})
export class ElevationPageComponent {
  readonly facade = inject(AssinaturaFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;
  private completing = false;

  readonly methods = ELEVATION_METHODS;
  readonly stateKeys = STATE_KEYS;

  readonly busy = computed(() => {
    const phase = this.facade.phase();
    return (
      phase === 'starting' || phase === 'redirecting' || phase === 'completing'
    );
  });
  readonly qualifiedNeverRequired = computed(
    () => this.facade.context()?.required === NEVER_REQUIRED_LEVEL,
  );
  readonly unavailableReason = computed<string | null>(() => {
    const reason = this.facade.error()?.context['unavailableReason'];
    return typeof reason === 'string' ? reason : null;
  });

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.facade.resolveContext(params);
        const elevationId = params.get(RETURN_ELEVATION_ID_PARAM);
        const resumeToken = params.get(RETURN_RESUME_TOKEN_PARAM);
        if (elevationId && resumeToken && !this.completing) {
          this.completing = true;
          void this.complete(elevationId, resumeToken);
          return;
        }
        // Nível já suficiente (link antigo): retoma de imediato, sem oferecer elevação.
        if (this.facade.context()?.sufficient) {
          void this.router.navigateByUrl(this.facade.resumeTarget());
        }
      });
    afterRenderEffect(() => {
      const context = this.facade.context();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && context) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  methodKey(method: ElevationMethod): string {
    return `${METHOD_KEY_PREFIX}${method}`;
  }

  stateTextKey(): string | null {
    switch (this.facade.phase()) {
      case 'unavailable':
        return STATE_KEYS.unavailable;
      case 'error':
        return STATE_KEYS.recoverable;
      default:
        return null;
    }
  }

  /** Caminho escolhido → `requestElevation` → navegação externa ao `redirectUrl`. */
  async start(method: ElevationMethod): Promise<void> {
    if (this.busy()) return;
    const started = await this.facade.start(method);
    if (started) window.location.assign(started.redirectUrl);
  }

  private async complete(
    elevationId: string,
    resumeToken: string,
  ): Promise<void> {
    const done = await this.facade.complete(elevationId, resumeToken);
    this.completing = false;
    if (done) await this.router.navigateByUrl(this.facade.resumeTarget());
  }
}
