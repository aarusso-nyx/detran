// T-08 Confirmação de desistência (contrato CTG-0003b §6; ficha IU-PORTAL-T08; [UC-PORTAL-006];
// [DIVERGE-9]): a consequência jurídica INLINE (`portal.legal.consequencias_desistencia.v1`, versão
// `v1`), focada ao carregar e lida por completo antes do botão (ordem do DOM); confirmação por
// escrito (checkbox obrigatório, `DesistenciaSchema`); `withdraw` com `If-Match` do `ETag` lido;
// `canWithdraw false` → inelegível com `data-reason`, sem formulário; `409 WITHDRAWAL_AFTER_JUDGMENT`
// → o mesmo texto + banner; `412`/`428` → recarregar, formulário mantido. Cancelar volta ao processo
// sem nenhuma escrita. Nenhum cálculo de prazo aqui (o servidor decide).
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
import type { RequestWithdrawBody } from '../../../data/portal.client';
import { DesistenciaSchema } from '../../../forms/desistencia.schema';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { LEGAL_TEXT_VERSION } from '../../../shared/consequence-dialog.component';
import { ProcessosFacade } from '../processos.facade';

const REQUEST_PARAM = 'requestId';
const PROCESS_ROUTE_PREFIX = '/processos/';
const AIT_ROUTE_PREFIX = '/autos/';
const LEGAL_DOCUMENT = 'consequencias_desistencia';
const AFTER_JUDGMENT_CODE = 'PORTAL.WITHDRAWAL_AFTER_JUDGMENT';

const STATE_KEYS = {
  loading: 'portal.screens.t08.state.loading',
  ineligible: 'portal.screens.t08.state.ineligible',
  error: 'portal.screens.t08.state.error_recoverable',
  unavailable: 'portal.screens.t08.state.unavailable',
} as const;

@Component({
  selector: 'portal-desistencia-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    PortalFieldErrorsDirective,
    AlternativeChannelNoteComponent,
  ],
  providers: [ProcessosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-08',
    '[attr.data-request-id]': 'requestId()',
    '[attr.data-status]': 'facade.detailStatus()',
    '[attr.data-command-status]': 'facade.commandStatus()',
    '[attr.aria-busy]': 'busy() ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1" [id]="titleId">
      {{ 'portal.screens.t08.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t08.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.detailStatus() === 'loading') {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (withdrawn(); as withdrawn) {
        <p data-withdrawn [attr.data-token]="withdrawn.state">
          {{ requestStateKey(withdrawn.state) | stynxTranslate }}
        </p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (stateTextKey(); as key) {
        <p data-state-text [attr.data-reason]="blockedReason()">
          {{ key | stynxTranslate }}
        </p>
      }
      @if (facade.detailError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
      @if (facade.commandError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (withdrawn(); as withdrawn) {
      <p>
        <a [routerLink]="processRoute()" [attr.routerLink]="processRoute()">{{
          'portal.screens.t07.title' | stynxTranslate
        }}</a>
      </p>
      @if (paymentRoute(); as route) {
        <p>
          <a [routerLink]="route" [attr.routerLink]="route">{{
            'portal.screens.t01.cmd.pay' | stynxTranslate
          }}</a>
        </p>
      }
    } @else if (facade.detail(); as detail) {
      @if (detail.actions.canWithdraw) {
        <section
          #legal
          role="region"
          tabindex="-1"
          [attr.aria-labelledby]="titleId"
          [attr.data-document]="legalDocument"
          [attr.data-text-version]="textVersion"
          class="portal-legal-text"
        >
          <p>{{ legalTextKey | stynxTranslate }}</p>
        </section>
        <form
          class="portal-desistencia-form"
          [portalFieldErrors]="fields()"
          (submit)="onSubmit($event)"
        >
          <label>
            <input
              type="checkbox"
              name="confirm"
              [checked]="confirmed()"
              [disabled]="busy()"
              (change)="onConfirmChange($event)"
            />
            <span>{{
              'portal.forms.desistencia.confirmacao' | stynxTranslate
            }}</span>
          </label>
          <label>
            <span>{{
              'portal.forms.desistencia.motivo' | stynxTranslate
            }}</span>
            <textarea
              name="reason"
              rows="3"
              [value]="reason()"
              [disabled]="busy()"
              (input)="onReasonInput($event)"
            ></textarea>
          </label>
          <div class="portal-desistencia-actions">
            <button type="button" data-cancel (click)="cancel()">
              {{ 'portal.screens.t08.cmd.cancel' | stynxTranslate }}
            </button>
            <button type="submit" data-confirm [disabled]="!canConfirm()">
              {{ 'portal.screens.t08.cmd.confirm' | stynxTranslate }}
            </button>
          </div>
        </form>
      } @else {
        <p>
          <a [routerLink]="processRoute()" [attr.routerLink]="processRoute()">{{
            'portal.screens.t07.title' | stynxTranslate
          }}</a>
        </p>
      }
    }

    <portal-alternative-channel-note />
  `,
})
export class DesistenciaPageComponent {
  readonly facade = inject(ProcessosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly legal = viewChild<ElementRef<HTMLElement>>('legal');
  private focusedLegal = false;

  readonly requestId = signal('');
  readonly confirmed = signal(false);
  readonly reason = signal('');
  readonly withdrawn = signal<{ state: string } | null>(null);
  readonly stateKeys = STATE_KEYS;
  readonly legalDocument = LEGAL_DOCUMENT;
  readonly textVersion = LEGAL_TEXT_VERSION;
  readonly legalTextKey = `portal.legal.${LEGAL_DOCUMENT}.${LEGAL_TEXT_VERSION}`;
  readonly titleId = 'portal-desistencia-title';

  readonly busy = computed(
    () =>
      this.facade.detailStatus() === 'loading' ||
      this.facade.commandStatus() === 'submitting',
  );

  /** `fields[]` do erro de comando (400/422) para a diretiva. */
  readonly fields = computed<readonly string[]>(
    () => this.facade.commandError()?.fields ?? [],
  );

  readonly afterJudgment = computed(
    () => this.facade.commandError()?.code === AFTER_JUDGMENT_CODE,
  );

  readonly blockedReason = computed<string | null>(() => {
    const detail = this.facade.detail();
    if (detail && !detail.actions.canWithdraw) {
      return detail.actions.withdrawalBlockedReason;
    }
    return null;
  });

  readonly stateTextKey = computed<string | null>(() => {
    if (this.afterJudgment()) return STATE_KEYS.ineligible;
    const detail = this.facade.detail();
    if (detail && !detail.actions.canWithdraw) return STATE_KEYS.ineligible;
    switch (this.facade.detailStatus()) {
      case 'unavailable':
        return STATE_KEYS.unavailable;
      case 'error':
        return STATE_KEYS.error;
      default:
        break;
    }
    switch (this.facade.commandStatus()) {
      case 'unavailable':
        return STATE_KEYS.unavailable;
      case 'error':
        return STATE_KEYS.error;
      default:
        return null;
    }
  });

  readonly canConfirm = computed(
    () => this.confirmed() && !this.busy() && this.withdrawn() === null,
  );

  readonly processRoute = computed(
    () => `${PROCESS_ROUTE_PREFIX}${this.requestId()}`,
  );

  /** [UC-PORTAL-006] AC-4: depois de desistir, pagar com o valor já calculado (T-13). */
  readonly paymentRoute = computed<string | null>(() => {
    const request = this.facade.detail()?.request;
    return request?.targetKind === 'ait' && request.targetId
      ? `${AIT_ROUTE_PREFIX}${request.targetId}/pagamento`
      : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const requestId = params.get(REQUEST_PARAM) ?? '';
        this.requestId.set(requestId);
        this.focusedLegal = false;
        void this.facade.loadDetail(requestId);
      });
    // Foco no texto jurídico ao carregar (T08 §9): a consequência é lida antes do botão.
    afterRenderEffect(() => {
      const status = this.facade.detailStatus();
      const legal = this.legal()?.nativeElement;
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (this.focusedLegal || status !== 'ready') return;
        this.focusedLegal = true;
        (legal ?? heading)?.focus();
      });
    });
  }

  requestStateKey(state: string): string {
    return `portal.situation.request.${state}`;
  }

  /** O botão de confirmar acompanha o checkbox no mesmo evento (resposta imediata). */
  onConfirmChange(event: Event): void {
    this.confirmed.set((event.target as HTMLInputElement).checked);
    this.changeDetector.detectChanges();
  }

  onReasonInput(event: Event): void {
    this.reason.set((event.target as HTMLTextAreaElement).value);
  }

  /** `DesistenciaSchema.safeParse` → `withdraw` com `If-Match = etag()` (§2.2). */
  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canConfirm()) return;
    const reason = this.reason().trim();
    const parsed = DesistenciaSchema.safeParse({
      confirm: this.confirmed(),
      ...(reason.length > 0 ? { reason } : {}),
    });
    if (!parsed.success) return;
    const body: RequestWithdrawBody = parsed.data;
    const result = await this.facade.withdraw(this.requestId(), body);
    if (result) this.withdrawn.set({ state: result.state });
  }

  /** [UC-PORTAL-006] 3a: volta ao processo sem nenhuma requisição de escrita. */
  cancel(): void {
    void this.router.navigateByUrl(this.processRoute());
  }

  reload(): void {
    void this.facade.loadDetail(this.requestId());
  }
}
