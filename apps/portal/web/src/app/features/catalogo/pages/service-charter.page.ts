// T-25 Carta de Serviços (contrato CTG-0003c §6; ficha IU-PORTAL-T25; [RN-PORTAL-102/108];
// [DIVERGE-23]): uma página para as duas rotas — lista (`GET services`, ordem do servidor, filtro
// local por texto) quando `:serviceKey` está ausente; detalhe (`GET services/{serviceKey}`) com os
// campos que o item tem (rótulos OD-P89; valores tal como o servidor manda, inclusive
// "source_pending (OD-P26)" — nunca "não se aplica" inventado). O nível é o do ATO
// (`portal.situation.assurance.<nível>`), nunca a cor do selo. "Ir para este serviço" só com
// `availability !== 'unavailable'` e rota funcional no manifesto; indisponível → motivo em
// `data-token` + nota do canal alternativo. 404 → fora do catálogo (não é vínculo).
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxI18nService,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import type { ServiceCatalogItem } from '../../../data/portal.client';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { CatalogoFacade } from '../catalogo.facade';

const SERVICE_KEY_PARAM = 'serviceKey';
const CHARTER_ROUTE = '/carta-servicos';
const SERVICES_KEY_PREFIX = `portal.services.`;
const AVAILABILITY_KEY_PREFIX = `portal.situation.availability.`;
const ASSURANCE_KEY_PREFIX = `portal.situation.assurance.`;
const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';

const STATE_KEYS = {
  loading: 'portal.screens.t25.state.carregando',
  notFound: 'portal.screens.t25.state.sem_permissao',
  recoverable: 'portal.screens.t25.state.erro_recuperavel',
  unavailable: 'portal.screens.t25.state.indisponivel',
} as const;

/** Campos do detalhe (rótulo → valor do item), na ordem da ficha. */
interface CharterField {
  readonly key: string;
  readonly labelKey: string;
  readonly value: string | null;
}

@Component({
  selector: 'portal-service-charter-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
  ],
  providers: [CatalogoFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-25',
    '[attr.data-service-key]': 'serviceKey()',
    '[attr.data-status]': 'facade.status()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t25.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t25.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.status() === 'loading') {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (stateTextKey(); as key) {
        <p data-state-text>{{ key | stynxTranslate }}</p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.error(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (serviceKey() === null) {
      <form class="portal-charter-filter" (submit)="$event.preventDefault()">
        <label>
          <span>{{ 'portal.screens.t25.field.filtrar' | stynxTranslate }}</span>
          <input
            type="search"
            name="filter"
            [value]="filter()"
            (input)="onFilterInput($event)"
          />
        </label>
      </form>

      @if (facade.status() === 'empty') {
        <detran-empty-state
          [title]="'portal.states.empty' | stynxTranslate"
          [message]="'portal.states.empty' | stynxTranslate"
        />
      }

      @if (filteredItems().length > 0) {
        <ol data-service-list class="portal-service-list" aria-live="polite">
          @for (item of filteredItems(); track item.serviceKey) {
            <li
              [attr.data-service-key]="item.serviceKey"
              [attr.data-availability]="item.availability ?? null"
              [attr.data-token]="item.unavailableReason ?? null"
            >
              <h2>
                @if (serviceLabelKey(item); as key) {
                  {{ key | stynxTranslate }}
                }
              </h2>
              @if (item.availability; as availability) {
                <p data-availability-label>
                  {{ availabilityKey(availability) | stynxTranslate }}
                </p>
              }
              <p
                data-assurance
                [attr.data-token]="item.minimumAssurance ?? null"
              >
                <span>{{
                  'portal.screens.t25.field.nivel_assinatura' | stynxTranslate
                }}</span>
                <span>{{
                  assuranceKey(item.minimumAssurance) | stynxTranslate
                }}</span>
              </p>
              @if (item.alternativeChannelNote; as note) {
                <p data-note>{{ note }}</p>
              }
              <a
                [routerLink]="detailRoute(item)"
                [attr.routerLink]="detailRoute(item)"
                data-detail-link
                >{{ 'portal.screens.t25.title' | stynxTranslate }}</a
              >
            </li>
          }
        </ol>
      }
    }

    @if (facade.selected(); as item) {
      <article
        data-service-detail
        [attr.data-service-key]="item.serviceKey"
        [attr.data-availability]="item.availability ?? null"
      >
        <h2>
          @if (serviceLabelKey(item); as key) {
            {{ key | stynxTranslate }}
          }
        </h2>
        <dl>
          @for (field of detailFields(); track field.key) {
            <div [attr.data-field]="field.key">
              <dt>{{ field.labelKey | stynxTranslate }}</dt>
              <dd>{{ field.value }}</dd>
            </div>
          }
          @if (item.requirements?.length) {
            <div data-field="requirements">
              <dt>
                {{ 'portal.screens.t25.field.requisitos' | stynxTranslate }}
              </dt>
              <dd>
                <ul>
                  @for (requirement of item.requirements; track $index) {
                    <li>{{ requirement }}</li>
                  }
                </ul>
              </dd>
            </div>
          }
          @if (item.availability; as availability) {
            <div
              data-field="availability"
              [attr.data-token]="item.unavailableReason ?? null"
            >
              <dt>
                {{
                  'portal.screens.t25.field.disponibilidade' | stynxTranslate
                }}
              </dt>
              <dd>{{ availabilityKey(availability) | stynxTranslate }}</dd>
            </div>
          }
          <div
            data-field="minimumAssurance"
            [attr.data-token]="item.minimumAssurance ?? null"
          >
            <dt>
              {{ 'portal.screens.t25.field.nivel_assinatura' | stynxTranslate }}
            </dt>
            <dd>{{ assuranceKey(item.minimumAssurance) | stynxTranslate }}</dd>
          </div>
          @if (item.effectiveFrom; as effectiveFrom) {
            <div data-field="effectiveFrom">
              <dt>{{ 'portal.screens.t25.field.versao' | stynxTranslate }}</dt>
              <dd>
                @if (item.version !== undefined) {
                  <span data-version>{{ item.version }}</span>
                }
                <time [attr.datetime]="effectiveFrom">{{
                  'portal.screens.t25.field.vigencia'
                    | stynxTranslate
                      : { effectiveFrom: (effectiveFrom | stynxIntlDate) }
                }}</time>
              </dd>
            </div>
          }
        </dl>
        @if (functionalRoute(item); as route) {
          <p>
            <a [routerLink]="route" [attr.routerLink]="route" data-cmd-ir>{{
              'portal.screens.t25.cmd.ir' | stynxTranslate
            }}</a>
          </p>
        }
        <portal-alternative-channel-note
          [serviceKey]="item.serviceKey ?? null"
          [note]="item.alternativeChannelNote ?? null"
        />
      </article>
    }

    @if (serviceKey() !== null) {
      <p>
        <a [routerLink]="charterRoute" [attr.routerLink]="charterRoute">{{
          'portal.common.link.carta' | stynxTranslate
        }}</a>
      </p>
    }
  `,
})
export class ServiceCharterPageComponent {
  readonly facade = inject(CatalogoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(StynxI18nService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly serviceKey = signal<string | null>(null);
  readonly filter = signal('');
  readonly stateKeys = STATE_KEYS;
  readonly charterRoute = CHARTER_ROUTE;

  /** Filtro LOCAL por texto (rótulo traduzido, chave e resumo). */
  readonly filteredItems = computed<readonly ServiceCatalogItem[]>(() => {
    const needle = this.filter().trim().toLocaleLowerCase();
    const items = this.facade.items();
    if (needle.length === 0) return items;
    return items.filter((item) => {
      const labelKey = this.serviceLabelKey(item);
      const label = labelKey ? this.i18n.translate(labelKey) : '';
      return [label, item.serviceKey ?? '', item.summary ?? '']
        .join('\n')
        .toLocaleLowerCase()
        .includes(needle);
    });
  });

  /** Campos do detalhe presentes no item (valores do servidor, tal como chegam). */
  readonly detailFields = computed<readonly CharterField[]>(() => {
    const item = this.facade.selected();
    if (!item) return [];
    const candidates: readonly CharterField[] = [
      {
        key: 'summary',
        labelKey: 'portal.screens.t25.field.resumo',
        value: item.summary ?? null,
      },
      {
        key: 'deliveryChannel',
        labelKey: 'portal.screens.t25.field.canal',
        value: item.deliveryChannel ?? null,
      },
      {
        key: 'legalDeadline',
        labelKey: 'portal.screens.t25.field.prazo_maximo',
        value: item.legalDeadline ?? null,
      },
      {
        key: 'cost',
        labelKey: 'portal.screens.t25.field.custo',
        value: item.cost ?? null,
      },
      {
        key: 'accessibilityNote',
        labelKey: 'portal.screens.t25.field.acessibilidade',
        value: item.accessibilityNote ?? null,
      },
      {
        key: 'responsibleParty',
        labelKey: 'portal.screens.t25.field.responsavel',
        value: item.responsibleParty ?? null,
      },
      {
        key: 'normativeReference',
        labelKey: 'portal.screens.t25.field.base_normativa',
        value: item.normativeReference ?? null,
      },
    ];
    return candidates.filter((field) => field.value !== null);
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const serviceKey = params.get(SERVICE_KEY_PARAM);
        this.serviceKey.set(serviceKey);
        this.focused = false;
        this.load();
      });
    afterRenderEffect(() => {
      const status = this.facade.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** `portal.services.<key>` quando existe no catálogo; ausente → só `data-service-key`. */
  serviceLabelKey(item: ServiceCatalogItem): string | null {
    const key = item.serviceKey
      ? `${SERVICES_KEY_PREFIX}${item.serviceKey}`
      : null;
    return key && key in this.i18n.catalog() ? key : null;
  }

  availabilityKey(availability: string): string {
    return `${AVAILABILITY_KEY_PREFIX}${availability}`;
  }

  /** Nível do ATO ('none' → "nenhum nível exigido"); nunca cor de selo. */
  assuranceKey(level: string | undefined): string {
    return `${ASSURANCE_KEY_PREFIX}${level ?? 'none'}`;
  }

  detailRoute(item: ServiceCatalogItem): string {
    return `${CHARTER_ROUTE}/${item.serviceKey ?? ''}`;
  }

  /** "Ir para este serviço" só quando disponível (ao menos parcialmente) e com rota funcional. */
  functionalRoute(item: ServiceCatalogItem): string | null {
    if (!item.serviceKey || item.availability === 'unavailable') return null;
    return this.facade.functionalRoute(item.serviceKey);
  }

  stateTextKey(): string | null {
    const code = this.facade.error()?.code ?? null;
    if (code === NOT_FOUND_CODE) return STATE_KEYS.notFound;
    switch (this.facade.status()) {
      case 'unavailable':
        return STATE_KEYS.unavailable;
      case 'error':
        return STATE_KEYS.recoverable;
      default:
        return null;
    }
  }

  onFilterInput(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    const serviceKey = this.serviceKey();
    if (serviceKey === null) {
      void this.facade.loadList();
    } else {
      void this.facade.loadService(serviceKey);
    }
  }
}
