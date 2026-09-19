// T-22 Acompanhar manifestação (contrato CTG-0003c §6; ficha IU-PORTAL-T22; [RN-PORTAL-109];
// [UC-PORTAL-016/017]; [DIVERGE-18]): estado traduzido (`portal.situation.manifestation.<STATE>`,
// token em `data-token`), protocolo, recebimento, tipo, o ÚNICO relógio visível — `agencyDueOn`
// como `DeadlineCard` do órgão —, a prorrogação com justificativa (nunca silenciosa), a decisão
// quando houver, o botão de ciência SÓ em `CIENCIA_AO_USUARIO` e, após a ciência/quando oferecida,
// a avaliação inline (`EvaluationForm` com `subjectKind: 'manifestation'`). Nenhum relógio interno
// (`info_due_on`) existe no tipo. 404 → vínculo; `EM_ANALISE`/informação solicitada → status, não
// erro; 409 na ciência → banner + releitura. Foco ao topo após atualização.
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
import {
  DetranLoadingStateComponent,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import type { EvaluationCreateBody } from '../../../data/portal-read.models';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import { EvaluationFormComponent } from '../../../shared/evaluation-form.component';
import { AtendimentoFacade } from '../atendimento.facade';

const MANIFESTATION_PARAM = 'manifestationId';
const OUVIDORIA_ROUTE = '/ouvidoria/nova';
const STATE_KEY_PREFIX = `portal.situation.manifestation.`;
const KIND_KEY_PREFIX = `portal.forms.manifestacao.tipo.`;
const CIENCIA_STATE = 'CIENCIA_AO_USUARIO';
/** Estados em que a manifestação está com a ouvidoria (status informativo, não erro). */
const IN_ANALYSIS_STATES: ReadonlySet<string> = new Set([
  'EM_ANALISE',
  'INFORMACAO_SOLICITADA_AO_AGENTE',
]);
const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';

const STATE_KEYS = {
  loading: 'portal.screens.t22.state.carregando',
  notFound: 'portal.screens.t22.state.sem_permissao',
  inAnalysis: 'portal.screens.t22.state.erro_recuperavel',
  unavailable: 'portal.screens.t22.state.indisponivel',
} as const;

@Component({
  selector: 'portal-manifestation-detail-page',
  imports: [
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    DeadlineCardComponent,
    EvaluationFormComponent,
  ],
  providers: [AtendimentoFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-22',
    '[attr.data-manifestation-id]': 'manifestationId()',
    '[attr.data-status]': 'facade.detailStatus()',
    '[attr.data-token]': 'facade.detail()?.state ?? null',
    '[attr.aria-busy]': 'busy() ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t22.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t22.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (busy()) {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (inAnalysis()) {
        <p data-in-analysis>{{ stateKeys.inAnalysis | stynxTranslate }}</p>
      }
      @if (stateTextKey(); as key) {
        <p data-state-text>{{ key | stynxTranslate }}</p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.detailError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
      @if (facade.ackError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
      @if (facade.evaluationError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (facade.detail(); as detail) {
      <section data-manifestation>
        <p data-state [attr.data-token]="detail.state">
          {{ stateKey(detail.state) | stynxTranslate }}
        </p>
        <dl>
          <dt>{{ 'portal.common.receipt.number' | stynxTranslate }}</dt>
          <dd data-protocol>{{ detail.protocol }}</dd>
          <dt>{{ 'portal.forms.manifestacao.tipo' | stynxTranslate }}</dt>
          <dd data-kind [attr.data-token]="detail.kind">
            {{ kindKey(detail.kind) | stynxTranslate }}
          </dd>
          <dt>{{ 'portal.common.receipt.issued_at' | stynxTranslate }}</dt>
          <dd>
            <time [attr.datetime]="detail.receivedAt">{{
              'portal.screens.t22.field.recebida_em'
                | stynxTranslate
                  : {
                      receivedAt:
                        (detail.receivedAt | stynxIntlDate: dateTimeFormat),
                    }
            }}</time>
          </dd>
          @if (detail.text; as text) {
            <dt>
              {{ 'portal.forms.manifestacao.descricao' | stynxTranslate }}
            </dt>
            <dd data-text>{{ text }}</dd>
          }
        </dl>

        <portal-deadline-card
          [dueOn]="detail.deadlines.agencyDueOn"
          ownedBy="agency"
          labelKey="portal.screens.t22.field.prazo_orgao"
        />
        @if (detail.deadlines.extended; as extended) {
          <p data-extended>
            {{
              'portal.screens.t22.field.prorrogacao'
                | stynxTranslate
                  : {
                      on: (extended.on | stynxIntlDate),
                      justification: extended.justification,
                    }
            }}
          </p>
        }

        @if (detail.decision?.text; as decisionText) {
          <section data-decision>
            <h2>{{ 'portal.screens.t22.field.decisao' | stynxTranslate }}</h2>
            <p>{{ decisionText }}</p>
          </section>
        }

        @if (detail.state === cienciaState) {
          <button
            type="button"
            class="portal-primary"
            data-acknowledge
            [disabled]="busy()"
            (click)="acknowledge()"
          >
            {{ 'portal.screens.t22.cmd.confirmar_ciencia' | stynxTranslate }}
          </button>
        }

        @if (detail.evaluationOffered && !detail.evaluated) {
          <portal-evaluation-form
            subjectKind="manifestation"
            [subjectId]="detail.manifestationId"
            [scale]="null"
            [status]="facade.evaluationStatus()"
            [fields]="facade.evaluationError()?.fields ?? []"
            [result]="facade.evaluation()"
            (submitted)="evaluate($event)"
            (manifestationRequested)="openManifestation()"
          />
        }
      </section>
    }

    <portal-alternative-channel-note />
  `,
})
export class ManifestationDetailPageComponent {
  readonly facade = inject(AtendimentoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focusPending = true;

  readonly manifestationId = signal('');
  readonly stateKeys = STATE_KEYS;
  readonly cienciaState = CIENCIA_STATE;
  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };

  readonly busy = computed(
    () =>
      this.facade.detailStatus() === 'loading' ||
      this.facade.ackStatus() === 'submitting',
  );
  /** `EM_ANALISE`/informação solicitada → status informativo ([RN-PORTAL-109]). */
  readonly inAnalysis = computed(() => {
    const state = this.facade.detail()?.state;
    return state !== undefined && IN_ANALYSIS_STATES.has(state);
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const manifestationId = params.get(MANIFESTATION_PARAM) ?? '';
        this.manifestationId.set(manifestationId);
        this.focusPending = true;
        void this.facade.loadDetail(manifestationId);
      });
    // Foco ao topo após cada atualização concluída (§7.3).
    afterRenderEffect(() => {
      const status = this.facade.detailStatus();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (status === 'ready' && this.focusPending) {
          this.focusPending = false;
          heading?.focus();
        }
      });
    });
  }

  stateKey(state: string): string {
    return `${STATE_KEY_PREFIX}${state}`;
  }

  kindKey(kind: string): string {
    return `${KIND_KEY_PREFIX}${kind}`;
  }

  stateTextKey(): string | null {
    const code = this.facade.detailError()?.code ?? null;
    if (code === NOT_FOUND_CODE) return STATE_KEYS.notFound;
    const status = this.facade.detailStatus();
    if (status === 'unavailable' || status === 'error') {
      return STATE_KEYS.unavailable;
    }
    return null;
  }

  acknowledge(): void {
    this.focusPending = true;
    void this.facade.acknowledge(this.manifestationId());
  }

  evaluate(body: EvaluationCreateBody): void {
    void this.facade.evaluate(body);
  }

  openManifestation(): void {
    void this.router.navigateByUrl(OUVIDORIA_ROUTE);
  }

  reload(): void {
    this.focusPending = true;
    void this.facade.loadDetail(this.manifestationId());
  }
}
