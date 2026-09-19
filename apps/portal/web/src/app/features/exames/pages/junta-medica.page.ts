// /exames/:examId/junta/nova (contrato CTG-0003c §6; [UC-PORTAL-014]; [DIVERGE-17]): o pedido de
// junta médica ou psicológica pelo ciclo comum — `ServiceWizard` com `JuntaMedicaSchema` /
// `JUNTA_MEDICA_GATE` e o `JuntaMedicaForm` projetado no passo 2 — sobre o exame da rota
// (`ExamesFacade.loadBoardContext`: alvo fixado ao entrar; prazo `boardDueOn` como `DeadlineCard`
// quando o servidor o envia). O pedido só nasce por ato do cidadão (botão de início; a retomada
// do `ResumeService` restaura sem novo `POST`); `422 BOARD_REQUEST_WINDOW_CLOSED { dueOn }` é o
// servidor decidindo a janela — banner, nunca cálculo local. Canal alternativo em todos os passos.
// Nesta rodada o serviço está ausente do catálogo (OD-P19/A4): o guarda redireciona antes.
import {
  ChangeDetectionStrategy,
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
import { ActivatedRoute, Router } from '@angular/router';
import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import {
  JUNTA_MEDICA_GATE,
  JuntaMedicaSchema,
} from '../../../forms/junta-medica.schema';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
import { JuntaMedicaFormComponent } from '../components/junta-medica-form.component';
import { ExamesFacade } from '../exames.facade';

const EXAM_PARAM = 'examId';
const SERVICE_KEY = 'junta_medica';

@Component({
  selector: 'portal-junta-medica-page',
  imports: [
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    DeadlineCardComponent,
    ServiceWizardComponent,
    JuntaMedicaFormComponent,
  ],
  providers: [ExamesFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': '',
    '[attr.data-exam-id]': 'examId()',
    '[attr.data-status]': 'facade.detailStatus()',
    '[attr.aria-busy]': 'facade.detailStatus() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.services.junta_medica' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.detailStatus() === 'loading' || wizardLoading()) {
        <detran-loading-state
          [label]="'portal.states.loading' | stynxTranslate"
        />
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.detailError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @for (deadline of facade.deadlines(); track deadline.kind) {
      <portal-deadline-card
        [dueOn]="deadline.dueOn"
        [ownedBy]="deadline.ownedBy"
        [kind]="deadline.kind"
        labelKey="portal.screens.t20.field.prazo_junta"
      />
    }

    @if (facade.target(); as target) {
      @if (
        wizard.store.step() === 'elegibilidade' &&
        wizard.store.status() === 'idle'
      ) {
        <p>
          <button
            type="button"
            class="portal-primary"
            data-cmd="submit"
            (click)="start()"
          >
            {{ 'portal.screens.t20.cmd.requerer_junta' | stynxTranslate }}
          </button>
        </p>
      }
      <portal-service-wizard
        #wizard
        [target]="target"
        [schema]="schema"
        [gate]="gate"
        [resumeRoute]="resumeRoute()"
      >
        <portal-junta-medica-form
          [examId]="examId()"
          [requirements]="wizard.store.requirements()"
          [requestId]="wizard.store.requestId()"
          [fields]="wizard.store.error()?.fields ?? []"
          [disabled]="wizard.store.busy()"
          [values]="wizard.values()"
          (valuesChange)="wizard.values.set($event)"
        />
      </portal-service-wizard>
    } @else {
      <portal-alternative-channel-note [serviceKey]="serviceKey" />
    }
  `,
})
export class JuntaMedicaPageComponent {
  readonly facade = inject(ExamesFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
  private resumed = false;
  private focused = false;

  readonly examId = signal('');
  readonly schema = JuntaMedicaSchema;
  readonly gate = JUNTA_MEDICA_GATE;
  readonly serviceKey = SERVICE_KEY;
  readonly resumeRoute = computed(() => this.router.url);

  readonly wizardLoading = computed(
    () => this.wizard()?.store.status() === 'loading',
  );

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const examId = params.get(EXAM_PARAM) ?? '';
        this.examId.set(examId);
        this.resumed = false;
        this.focused = false;
        void this.facade.loadBoardContext(examId, this.router.url);
      });
    // Ponto de retomada ([UC-PORTAL-019] AC-4): restaura sem novo POST, uma única vez.
    afterRenderEffect(() => {
      const wizard = this.wizard();
      const resume = this.facade.resume();
      untracked(() => {
        if (!wizard || this.resumed || !resume) return;
        this.resumed = true;
        wizard.resumeFrom(resume);
      });
    });
    afterRenderEffect(() => {
      const target = this.facade.target();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && target) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** Início do pedido só por ato do cidadão (o passo 1 do wizard também o oferece). */
  start(): void {
    void this.wizard()?.store.start();
  }

  reload(): void {
    void this.facade.loadBoardContext(this.examId(), this.router.url);
  }
}
