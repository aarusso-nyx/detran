// T-24 Meus dados (LGPD) (contrato CTG-0003c §6; ficha IU-PORTAL-T24; [RN-PORTAL-118/120/121/122];
// [UC-PORTAL-018]; [JRN-PORTAL-011]; [DIVERGE-21]): confirmação imediata de tratamento em
// `role="status"` (temos/não temos dados seus), o `OwnDataPanel` com o cadastro do titular SEM
// máscara (cpf, nome — origem `source_pending`) e as seções que linkam às telas funcionais, e o ato
// `lgpd_declaracao` pelo ciclo comum (`ServiceWizard` + `LgpdRequestForm`): declaração completa,
// correção ao lado do dado (escopo `correcao` + campo) — o pedido nasce por ato do cidadão.
// `403 PRIVACY_SCOPE_REQUIRES_ASSURANCE` → elevação com retomada para esta rota;
// `422 PRIVACY_CORRECTION_NOT_ALLOWED { howToCorrect }` → sem permissão + como corrigir. Serviço
// `partially_available` → aviso + nota (OD-P17). "Exportar" não tem rota → indisponível nesta
// versão. Transparência: finalidade + Encarregado (`privacyUrl` da marca). Nenhum prazo no cliente.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  DetranLoadingStateComponent,
  StynxBannerComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { BrandService } from '../../../core/brand.service';
import type { ErrorPresentation } from '../../../core/error-boundary';
import {
  MEUS_DADOS_GATE,
  MeusDadosSchema,
} from '../../../forms/meus-dados.schema';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import {
  OwnDataPanelComponent,
  type CorrectRequest,
  type OwnDataSection,
} from '../../../shared/own-data-panel.component';
import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
import { LgpdRequestFormComponent } from '../components/lgpd-request-form.component';
import { PrivacidadeFacade, type LgpdScope } from '../privacidade.facade';

const SERVICE_KEY = 'lgpd_declaracao';
/** = `RESUME_QUERY_PARAM` de `core/guards/auth.guard.ts` (C-3c-113 veda importar `core/guards`). */
const RESUME_QUERY_PARAM = 'retomar';
const CORRECTION_NOT_ALLOWED_CODE = 'PORTAL.PRIVACY_CORRECTION_NOT_ALLOWED';
const CADASTRO_SECTION = 'cadastro';

const STATE_KEYS = {
  loading: 'portal.screens.t24.state.carregando',
  hasData: 'portal.screens.t24.state.tem_dados',
  noData: 'portal.screens.t24.empty',
  notEligible: 'portal.screens.t24.state.sem_elegibilidade',
  notAllowed: 'portal.screens.t24.state.sem_permissao',
  unavailable: 'portal.screens.t24.state.indisponivel',
} as const;

/** Seções que só apontam para a tela funcional ([JRN-PORTAL-011] 2), na ordem da ficha. */
const LINKED_SECTIONS: readonly OwnDataSection[] = [
  {
    key: 'infracoes',
    titleKey: 'portal.shell.nav.autos',
    route: '/autos',
    fields: [],
  },
  {
    key: 'sinistros',
    titleKey: 'portal.screens.t18.title',
    route: '/sinistros',
    fields: [],
  },
  {
    key: 'exames',
    titleKey: 'portal.screens.t20.title',
    route: '/exames',
    fields: [],
  },
];

@Component({
  selector: 'portal-own-data-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxBannerComponent,
    DetranLoadingStateComponent,
    AlternativeChannelNoteComponent,
    OwnDataPanelComponent,
    ServiceWizardComponent,
    LgpdRequestFormComponent,
  ],
  providers: [PrivacidadeFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-24',
    '[attr.data-confirmation]': 'facade.confirmation()',
    '[attr.aria-busy]': 'facade.loading() ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t24.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t24.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (partial(); as partial) {
        <stynx-banner
          tone="warning"
          [message]="
            'portal.errors.service_partially_available' | stynxTranslate
          "
        />
        @if (partial.alternativeChannelNote; as note) {
          <p data-partial-note>{{ note }}</p>
        }
      }
      @if (facade.loading()) {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (facade.confirmation() === 'has_data') {
        <p data-confirmation="has_data">
          {{ stateKeys.hasData | stynxTranslate }}
        </p>
      } @else if (facade.confirmation() === 'no_data') {
        <p data-confirmation="no_data">
          {{ stateKeys.noData | stynxTranslate }}
        </p>
      }
      @if (correctionNotAllowed(); as howToCorrect) {
        <p data-correction-not-allowed>
          {{ stateKeys.notAllowed | stynxTranslate }}
          <span data-how-to-correct>{{ howToCorrect }}</span>
        </p>
      }
      @if (!facade.canRequest('declaracao_completa')) {
        <p data-not-eligible="declaracao_completa">
          {{ stateKeys.notEligible | stynxTranslate }}
        </p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (accountUnavailable()) {
        <p data-account-unavailable>
          {{ stateKeys.unavailable | stynxTranslate }}
        </p>
      }
    </div>

    <portal-own-data-panel
      [sections]="sections()"
      (correctRequested)="requestCorrection($event)"
    />

    <p data-purpose>
      {{ 'portal.forms.meus_dados.campo.finalidade' | stynxTranslate }}
      @if (privacyUrl(); as url) {
        <a [attr.href]="url" rel="noopener" data-privacy-officer>{{
          'portal.shell.footer.privacidade' | stynxTranslate
        }}</a>
      }
    </p>

    <div class="portal-own-data-actions" role="group">
      <button
        type="button"
        class="portal-primary"
        data-cmd="declaracao_completa"
        [attr.aria-disabled]="
          facade.canRequest('declaracao_completa') ? null : 'true'
        "
        (click)="requestScope('declaracao_completa')"
      >
        {{ 'portal.screens.t24.cmd.declaracao_completa' | stynxTranslate }}
      </button>
      <button
        type="button"
        data-export
        aria-disabled="true"
        [attr.title]="'portal.states.unavailable_in_version' | stynxTranslate"
      >
        {{ 'portal.screens.t24.cmd.exportar' | stynxTranslate }}
      </button>
      <span data-export-unavailable>
        {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
      </span>
    </div>

    @if (elevationRequired()) {
      <p data-elevation>
        <a
          routerLink="/assinatura/elevacao"
          [queryParams]="resumeQuery()"
          data-elevation-link
          >{{ 'portal.screens.t27.cmd.elevar' | stynxTranslate }}</a
        >
      </p>
    }

    <portal-service-wizard
      #wizard
      [target]="facade.target()"
      [schema]="schema"
      [gate]="gate"
      [resumeRoute]="resumeRoute()"
      (failed)="onFailed($event)"
      (created)="lastFailure.set(null)"
    >
      <portal-lgpd-request-form
        [fields]="wizard.store.error()?.fields ?? []"
        [disabled]="wizard.store.busy()"
        [values]="wizard.values()"
        (valuesChange)="wizard.values.set($event)"
      />
    </portal-service-wizard>

    <portal-alternative-channel-note
      [serviceKey]="serviceKey"
      [note]="partial()?.alternativeChannelNote ?? null"
    />
  `,
})
export class OwnDataPageComponent {
  readonly facade = inject(PrivacidadeFacade);
  private readonly router = inject(Router);
  private readonly brand = inject(BrandService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
  private resumed = false;
  private focused = false;

  readonly schema = MeusDadosSchema;
  readonly gate = MEUS_DADOS_GATE;
  readonly serviceKey = SERVICE_KEY;
  readonly stateKeys = STATE_KEYS;
  readonly lastFailure = signal<ErrorPresentation | null>(null);
  readonly resumeRoute = computed(() => this.router.url);
  readonly resumeQuery = computed(() => ({
    [RESUME_QUERY_PARAM]: this.resumeRoute(),
  }));

  /** `partially_available` (OD-P17) → aviso `role="status"` + nota do catálogo. */
  readonly partial = computed(() => {
    const availability = this.facade.availability();
    return availability?.status === 'partially_available' ? availability : null;
  });
  readonly privacyUrl = computed<string | null>(() => {
    const brand = this.brand.state();
    return brand.status === 'available' ? (brand.privacyUrl ?? null) : null;
  });
  /** Falha de `me` não esconde as demais seções: só o cadastro fica indisponível. */
  readonly accountUnavailable = computed(
    () => this.facade.account() === null && this.facade.loadError() !== null,
  );
  readonly elevationRequired = computed(
    () => this.lastFailure()?.nextStep === 'elevation',
  );
  readonly correctionNotAllowed = computed<string | null>(() => {
    const failure = this.lastFailure();
    if (failure?.code !== CORRECTION_NOT_ALLOWED_CODE) return null;
    const howToCorrect = failure.context['howToCorrect'];
    return typeof howToCorrect === 'string' ? howToCorrect : '';
  });

  /** Cadastro do titular (cpf, nome — sem máscara; origem `source_pending`) + seções funcionais. */
  readonly sections = computed<readonly OwnDataSection[]>(() => {
    const account = this.facade.account();
    const cadastro: OwnDataSection = {
      key: CADASTRO_SECTION,
      titleKey: 'portal.screens.t24.title',
      route: null,
      fields: account
        ? [
            {
              name: 'cpf',
              labelKey: 'portal.forms.meus_dados.campo.cpf',
              value: account.cpf ?? null,
              category: 'consulta',
              source: null,
              correctable: true,
            },
            {
              name: 'name',
              labelKey: 'portal.forms.meus_dados.campo.nome',
              value: account.name ?? null,
              category: 'consulta',
              source: null,
              correctable: true,
            },
          ]
        : [],
    };
    return [cadastro, ...LINKED_SECTIONS];
  });

  constructor() {
    void this.facade.load(this.router.url);
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
      const loading = this.facade.loading();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && !loading) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** Abre o pedido com o escopo (o servidor decide a permissão; `canRequest` só orienta). */
  requestScope(scope: LgpdScope, fields: readonly string[] = []): void {
    const wizard = this.wizard();
    if (!wizard) return;
    this.lastFailure.set(null);
    wizard.values.set({
      scope,
      ...(fields.length > 0 ? { fields: [...fields] } : {}),
    });
    if (wizard.store.requestId() === null) {
      void wizard.store.start();
    }
  }

  /** Correção AO LADO do dado ([RN-PORTAL-121] 1): escopo `correcao` + campo. */
  requestCorrection(request: CorrectRequest): void {
    this.requestScope('correcao', [request.field]);
  }

  /** `403 PRIVACY_SCOPE_REQUIRES_ASSURANCE` → elevação; `422 PRIVACY_CORRECTION_NOT_ALLOWED` → como corrigir. */
  onFailed(presentation: ErrorPresentation): void {
    this.lastFailure.set(presentation);
  }
}
