// T-23 Pagar sem abrir mão do recurso (contrato CTG-0003b §6; ficha IU-PORTAL-T23;
// [RN-PORTAL-127]; [JRN-PORTAL-010]): a mesma composição de T-13 SEM as faixas que renunciam
// (`mode 'preserving_appeal'`: só `desconto_80` e `integral_juros`), com a garantia
// `portal.screens.t23.intro` como frase principal ANTES da confirmação e repetida depois do
// protocolo (o comprovante reflete a garantia), mais o link ao processo em curso quando há
// `openRequestId`. Estados com as chaves próprias da ficha. Lógica comum em `PagamentoPageBase`.
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DetranLoadingStateComponent,
  StynxBannerComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import type { PaymentComparisonMode } from '../../../shared/payment-comparison.component';
import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
import { PagamentoFormComponent } from '../components/pagamento-form.component';
import { PagamentoFacade } from '../pagamento.facade';
import {
  PagamentoPageBase,
  type PagamentoStateKeys,
} from './pagamento-page.base';

/** Textos de estado próprios da ficha T23 §5. */
const T23_STATE_KEYS: PagamentoStateKeys = {
  loading: 'portal.screens.t23.state.carregando',
  ineligible: 'portal.screens.t23.state.sem_elegibilidade',
  error: 'portal.screens.t23.state.erro_recuperavel',
  unavailable: 'portal.screens.t23.state.indisponivel',
  notFound: 'portal.screens.t23.state.sem_permissao',
};

@Component({
  selector: 'portal-pagamento-preservando-recurso-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxBannerComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    DeadlineCardComponent,
    ServiceWizardComponent,
    PagamentoFormComponent,
  ],
  providers: [PagamentoFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-23',
    '[attr.data-ait-id]': 'aitId()',
    '[attr.data-status]': 'facade.status()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t23.title' | stynxTranslate }}
    </h1>
    <p data-guarantee>{{ 'portal.screens.t23.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.status() === 'loading' || wizardLoading()) {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (partiallyAvailable()) {
        <stynx-banner tone="warning" [message]="partialKey | stynxTranslate" />
        <portal-alternative-channel-note
          [note]="facade.availability()?.alternativeChannelNote ?? null"
          [serviceKey]="serviceKey"
        />
      }
      @if (facade.existingRequestId(); as existingRequestId) {
        <p data-existing-request>
          {{ stateKeys.ineligible | stynxTranslate }}
          <a
            [routerLink]="processRoute(existingRequestId)"
            [attr.routerLink]="processRoute(existingRequestId)"
            >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
          >
        </p>
      }
      @if (facade.status() === 'not_found') {
        <p data-not-found>{{ stateKeys.notFound | stynxTranslate }}</p>
      }
      @if (unavailableReason(); as reason) {
        <p data-unavailable [attr.data-reason]="reason">
          {{ stateKeys.unavailable | stynxTranslate }}
        </p>
      }
      @if (accessibleFormatRequested()) {
        <p data-accessible-format-status>
          {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
        </p>
      }
      @if (submitted()) {
        <p data-guarantee-after>
          {{ 'portal.screens.t23.intro' | stynxTranslate }}
        </p>
        <p data-collection-document>
          {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
        </p>
        <portal-alternative-channel-note [serviceKey]="serviceKey" />
        @if (openRequestId(); as openRequestId) {
          <p data-open-request>
            <a
              [routerLink]="processRoute(openRequestId)"
              [attr.routerLink]="processRoute(openRequestId)"
              >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
            >
          </p>
        }
      }
    </div>

    @if (facade.error(); as error) {
      <portal-error-banner [error]="error" (retry)="reload()" />
    }

    @for (deadline of facade.deadlines(); track $index) {
      <portal-deadline-card
        [dueOn]="deadline.dueOn"
        [ownedBy]="deadline.ownedBy"
        [kind]="deadline.kind"
        [labelKey]="nextActionKey(deadline.ownedBy)"
      />
    }

    @if (paymentView(); as payment) {
      @if (!submitted()) {
        <portal-pagamento-form
          [payment]="payment"
          [flags]="flags"
          [mode]="mode"
          [aitId]="aitId()"
          [disabled]="wizardBusy()"
          [availableTiers]="availableTiers()"
          [availableMethods]="availableMethods()"
          (confirmed)="onConfirmed($event)"
          (sneEnrollmentRequested)="goToEnrollment()"
          (preservingAppealRequested)="goToPreservingAppeal()"
          (accessibleFormatRequested)="accessibleFormatRequested.set(true)"
        />
      }
    }

    @if (facade.target(); as target) {
      @if (facade.existingRequestId() === null) {
        <portal-service-wizard
          #wizard
          [target]="target"
          [schema]="schema"
          [gate]="gate"
          [resumeRoute]="resumeRoute()"
          (created)="lastFailure.set(null)"
          (draftSaved)="lastFailure.set(null)"
          (submitted)="onSubmitted($event)"
          (failed)="onFailed($event)"
        />
      }
    } @else {
      <portal-alternative-channel-note [serviceKey]="serviceKey" />
    }
  `,
})
export class PagamentoPreservandoRecursoPageComponent extends PagamentoPageBase {
  readonly mode: PaymentComparisonMode = 'preserving_appeal';
  override readonly stateKeys = T23_STATE_KEYS;
  /** Processo em curso sobre o AIT ([JRN-PORTAL-010] 3). */
  readonly openRequestId = computed(
    () => this.facade.ait()?.openRequestId ?? null,
  );
}
