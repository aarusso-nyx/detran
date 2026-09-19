// T-13 Pagar sua multa (contrato CTG-0003b §6; ficha IU-PORTAL-T13; [UC-PORTAL-015];
// [RN-PORTAL-125…128]; H.53; OD-P05/P41): valor e desconto LADO A LADO assim que o AIT é lido
// (`PagamentoForm` → `PaymentComparison`), a faixa de 40% visível mas indisponível com motivo
// (H.53), renúncia só depois do diálogo, guia acessível mediante solicitação, link a T-23 e o ciclo
// do wizard. `partially_available` → banner de status. Lógica comum em `PagamentoPageBase`.
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
import { PagamentoPageBase } from './pagamento-page.base';

@Component({
  selector: 'portal-pagamento-page',
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
    'data-screen': 'T-13',
    '[attr.data-ait-id]': 'aitId()',
    '[attr.data-status]': 'facade.status()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t13.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t13.intro' | stynxTranslate }}</p>

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
        <p data-collection-document>
          {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
        </p>
        <portal-alternative-channel-note [serviceKey]="serviceKey" />
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
export class PagamentoPageComponent extends PagamentoPageBase {
  readonly mode: PaymentComparisonMode = 'comparison';
}
