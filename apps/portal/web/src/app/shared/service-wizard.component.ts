// ServiceWizard (contrato CTG-0003a §5.4; [WF-PORTAL-001]; [RN-PORTAL-105], [RN-PORTAL-107]):
// os quatro passos do ciclo comum — elegibilidade → composição → assinatura → protocolo. O
// formulário do passo 2 é projetado (`ng-content`) pela feature; o estado vive no
// `ServiceWizardStore` provido aqui (a feature o lê pelo injector do componente). Todo passo
// renderiza `portal-alternative-channel-note`; o checklist de `requirements[]` aparece inteiro no
// passo 2; a mudança de passo move o foco ao `<h2 tabindex="-1">` (§8). A consequência jurídica
// (`consequence`) abre o `ConsequenceDialog` ANTES do `submit` (invariante 10).
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
import type { ZodType } from 'zod';
import { PortalErrorBannerComponent } from '../core/error-banner.component';
import type { ErrorPresentation } from '../core/error-boundary';
import type { ElevationStarted } from '../data/portal-command.models';
import type {
  DraftSaved,
  RequestCreated,
  RequestSubmitted,
} from '../data/portal.client';
import type { FormGate } from '../forms/form-gate';
import { AlternativeChannelNoteComponent } from './alternative-channel-note.component';
import {
  ConsequenceDialogComponent,
  type ConsequenceAck,
  type LegalDocument,
} from './consequence-dialog.component';
import { ProtocolReceiptComponent } from './protocol-receipt.component';
import {
  ServiceWizardStore,
  WIZARD_STEPS,
  type WizardResumeDraft,
  type WizardStep,
  type WizardTarget,
} from './service-wizard.store';
import {
  SignatureStepComponent,
  type SignatureChoice,
} from './signature-step.component';

export {
  WIZARD_STEPS,
  type WizardResumeDraft,
  type WizardStatus,
  type WizardStep,
  type WizardTarget,
} from './service-wizard.store';

@Component({
  selector: 'portal-service-wizard',
  imports: [
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    ConsequenceDialogComponent,
    ProtocolReceiptComponent,
    SignatureStepComponent,
  ],
  providers: [ServiceWizardStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-step]': 'store.step()',
    '[attr.data-status]': 'store.status()',
    '[attr.data-service-key]': 'target().serviceKey',
    '[attr.aria-busy]': 'store.busy() ? "true" : null',
  },
  template: `
    <nav [attr.aria-label]="'portal.a11y.wizard_steps' | stynxTranslate">
      <ol class="portal-wizard-steps">
        @for (step of steps; track step) {
          <li
            [attr.data-wizard-step]="step"
            [attr.aria-current]="step === store.step() ? 'step' : null"
          >
            {{ stepKey(step) | stynxTranslate }}
          </li>
        }
      </ol>
    </nav>
    <h2 #heading tabindex="-1">{{ stepKey(store.step()) | stynxTranslate }}</h2>

    @if (store.busy()) {
      <detran-loading-state
        [label]="'portal.states.loading' | stynxTranslate"
      />
    }
    @if (store.error(); as error) {
      <portal-error-banner [error]="error" (retry)="retry()" />
    }

    @switch (store.step()) {
      @case ('elegibilidade') {
        @if (store.status() === 'ineligible') {
          <p role="status" data-ineligible>
            {{ 'portal.states.ineligible' | stynxTranslate }}
          </p>
        } @else if (store.status() === 'unavailable') {
          <p role="status" data-unavailable>
            {{ 'portal.states.service_unavailable' | stynxTranslate }}
          </p>
        } @else if (store.status() === 'idle') {
          <button type="button" data-start (click)="store.start()">
            {{ 'portal.common.action.continue' | stynxTranslate }}
          </button>
        }
      }
      @case ('composicao') {
        @if (store.requirements().length > 0) {
          <ul class="portal-wizard-requirements" data-requirements>
            @for (item of store.requirements(); track $index) {
              <li>{{ item }}</li>
            }
          </ul>
        }
        <ng-content />
        <button
          type="button"
          data-continue
          [disabled]="store.busy()"
          (click)="saveAndContinue()"
        >
          {{ 'portal.common.action.continue' | stynxTranslate }}
        </button>
      }
      @case ('assinatura') {
        <portal-signature-step
          [actKey]="target().serviceKey"
          [required]="store.minimumAssurance() ?? 'none'"
          [resumeRoute]="resumeRoute()"
          [resumeDraft]="store.resumeDraft('assinatura')"
          [uploadRequestId]="store.requestId()"
          [govbrSignatureRef]="govbrSignatureRef()"
          (signed)="onSigned($event)"
          (elevationRequested)="elevationRequested.emit($event)"
        />
        @if (consequence(); as document) {
          @if (consequenceAckLabelKey(); as ackKey) {
            <portal-consequence-dialog
              [document]="document"
              [open]="pendingSignature() !== null"
              [ackLabelKey]="ackKey"
              [confirmLabelKey]="consequenceConfirmLabelKey()"
              [cancelLabelKey]="consequenceCancelLabelKey()"
              (confirmed)="onConsequenceConfirmed($event)"
              (cancelled)="pendingSignature.set(null)"
            />
          }
        }
      }
      @case ('protocolo') {
        @if (store.receipt(); as receipt) {
          <portal-protocol-receipt
            [requestId]="receipt.requestId"
            [protocol]="receipt.protocol"
            [state]="receipt.state"
            [attr.data-protocol]="receipt.protocol.number"
          />
        }
      }
    }

    <portal-alternative-channel-note [serviceKey]="target().serviceKey" />
  `,
})
export class ServiceWizardComponent {
  readonly store = inject(ServiceWizardStore);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focusedStep: WizardStep = WIZARD_STEPS[0];

  readonly target = input.required<WizardTarget>();
  /** `forms/<nome>.schema.ts`. */
  readonly schema = input.required<ZodType>();
  readonly gate = input.required<FormGate>();
  /** `state.url` da tela. */
  readonly resumeRoute = input.required<string>();
  /** Abre `ConsequenceDialog` antes de assinar. */
  readonly consequence = input<LegalDocument | null>(null);
  /** Rótulos do diálogo de consequência (chaves da tela chamadora; §5.7). */
  readonly consequenceAckLabelKey = input<string | null>(null);
  readonly consequenceConfirmLabelKey = input<string>(
    'portal.common.action.continue',
  );
  readonly consequenceCancelLabelKey = input<string>(
    'portal.common.action.cancel',
  );
  /** `source_pending` (OD-P60): origem do `signatureRef` para `govbr`. */
  readonly govbrSignatureRef = input<string | null>(null);
  /** O formulário do passo 2 é projetado pela feature; os valores chegam por aqui. */
  readonly values = model<Record<string, unknown> | null>(null);
  readonly created = output<RequestCreated>();
  readonly draftSaved = output<DraftSaved>();
  readonly submitted = output<RequestSubmitted>();
  readonly ineligible = output<ErrorPresentation>();
  readonly failed = output<ErrorPresentation>();
  readonly stepChanged = output<WizardStep>();
  readonly elevationRequested = output<ElevationStarted>();

  readonly steps = WIZARD_STEPS;
  readonly pendingSignature = signal<SignatureChoice | null>(null);
  readonly serviceKey = computed(() => this.target().serviceKey);

  constructor() {
    this.store.attach(this);
    // Mudança de passo move o foco ao título do passo (§8); a primeira renderização não rouba o
    // foco do usuário.
    afterRenderEffect(() => {
      const step = this.store.step();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (step !== this.focusedStep) {
          this.focusedStep = step;
          heading?.focus();
        }
      });
    });
  }

  stepKey(step: WizardStep): string {
    return `portal.common.step.${step}`;
  }

  /** `retry`/`reload` do banner: repete a ação do passo corrente. */
  retry(): void {
    switch (this.store.step()) {
      case 'elegibilidade':
        void this.store.start();
        return;
      case 'composicao':
        void this.store.save();
        return;
      default:
        return;
    }
  }

  async saveAndContinue(): Promise<void> {
    await this.store.save();
    if (this.store.error() === null && this.store.status() === 'ready') {
      this.store.goTo('assinatura');
    }
  }

  onSigned(choice: SignatureChoice): void {
    if (this.consequence() !== null) {
      this.pendingSignature.set(choice);
      return;
    }
    void this.store.sign(choice, null);
  }

  onConsequenceConfirmed(ack: ConsequenceAck): void {
    const choice = this.pendingSignature();
    this.pendingSignature.set(null);
    if (choice) void this.store.sign(choice, ack);
  }

  /** `ResumeService.resume()` já consumido pela feature ([UC-PORTAL-019] AC-4). */
  resumeFrom(point: WizardResumeDraft): void {
    this.store.resumeFrom(point);
  }
}
