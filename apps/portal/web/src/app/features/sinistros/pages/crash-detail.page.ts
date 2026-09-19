// T-19 Detalhe do sinistro (contrato CTG-0003c §6; ficha IU-PORTAL-T19; [RN-PORTAL-118];
// [JRN-PORTAL-007]; OD-P19/OD-P91): resumo primeiro — o rótulo de estado do servidor (`data-token`),
// o id como protocolo e um `<dl>` só com os valores primitivos de `summary` (a chave crua vai SÓ em
// `data-key`, nunca como texto; `gravidade`/`dinamica` ganham rótulo quando existem); a supressão
// de dado de terceiro é anunciada em `role="status"` (o servidor já suprimiu; o titular vê o próprio
// dado sem máscara). "Baixar boletim" não tem rota ([DIVERGE-15]) → `aria-disabled` + indisponível
// nesta versão. `CRASH_NOT_FINAL` é erro recuperável sem prazo; 404 → vínculo; 5xx → indisponível.
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
import { ActivatedRoute } from '@angular/router';
import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { SinistrosFacade } from '../sinistros.facade';

const CRASH_PARAM = 'crashId';
const SERVICE_KEY = 'consulta_bat';
const CRASH_NOT_FINAL_CODE = 'PORTAL.CRASH_NOT_FINAL';
const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';

/** Chaves de `summary` com rótulo na ficha (nomes `source_pending`, OD-P97). */
const LABELLED_SUMMARY_KEYS: Readonly<Record<string, string>> = {
  gravidade: 'portal.screens.t19.field.gravidade',
  dinamica: 'portal.screens.t19.field.dinamica',
};

const STATE_KEYS = {
  loading: 'portal.screens.t19.state.carregando',
  notFound: 'portal.screens.t19.state.sem_permissao',
  recoverable: 'portal.screens.t19.state.erro_recuperavel',
  unavailable: 'portal.screens.t19.state.indisponivel',
} as const;

interface SummaryEntry {
  readonly key: string;
  readonly labelKey: string | null;
  readonly value: string;
}

function isPrimitive(
  value: unknown,
): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

@Component({
  selector: 'portal-crash-detail-page',
  imports: [
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
  ],
  providers: [SinistrosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-19',
    '[attr.data-crash-id]': 'crashId()',
    '[attr.data-status]': 'facade.detailStatus()',
    '[attr.aria-busy]': 'facade.detailStatus() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t19.title' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.detailStatus() === 'loading') {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (facade.detail()?.thirdPartyFieldsSuppressed) {
        <p data-suppressed>
          {{
            'portal.errors.crash_third_party_data_restricted' | stynxTranslate
          }}
        </p>
      }
      @if (stateTextKey(); as key) {
        <p data-state-text>{{ key | stynxTranslate }}</p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.detailError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (facade.detail(); as detail) {
      <section #summary tabindex="-1" data-crash-summary>
        <p data-state-label [attr.data-token]="detail.stateLabel">
          {{ detail.stateLabel }}
        </p>
        <p>
          <span>{{ 'portal.common.receipt.number' | stynxTranslate }}</span>
          <span data-protocol>{{ detail.crashId }}</span>
        </p>
        @if (summaryEntries().length > 0) {
          <dl data-summary>
            @for (entry of summaryEntries(); track entry.key) {
              <div [attr.data-key]="entry.key">
                @if (entry.labelKey; as labelKey) {
                  <dt>{{ labelKey | stynxTranslate }}</dt>
                }
                <dd>{{ entry.value }}</dd>
              </div>
            }
          </dl>
        }
        <button
          type="button"
          data-download
          aria-disabled="true"
          [attr.title]="'portal.states.unavailable_in_version' | stynxTranslate"
        >
          {{ 'portal.screens.t19.cmd.baixar' | stynxTranslate }}
        </button>
        <p data-download-unavailable>
          {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
        </p>
      </section>
    }

    <portal-alternative-channel-note [serviceKey]="serviceKey" />
  `,
})
export class CrashDetailPageComponent {
  readonly facade = inject(SinistrosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');
  private focused = false;

  readonly crashId = signal('');
  readonly stateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;

  /** Só os valores primitivos de `summary` (forma livre, OD-P91); nada de texto inventado. */
  readonly summaryEntries = computed<readonly SummaryEntry[]>(() => {
    const summary = this.facade.detail()?.summary ?? {};
    return Object.entries(summary)
      .filter((entry): entry is [string, string | number | boolean | null] =>
        isPrimitive(entry[1]),
      )
      .map(([key, value]) => ({
        key,
        labelKey: LABELLED_SUMMARY_KEYS[key] ?? null,
        value: value === null ? '' : String(value),
      }));
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const crashId = params.get(CRASH_PARAM) ?? '';
        this.crashId.set(crashId);
        this.focused = false;
        void this.facade.loadDetail(crashId);
      });
    // Foco no resumo ao carregar ([JRN-PORTAL-007] 4); erro → o banner já recebe o foco.
    afterRenderEffect(() => {
      const status = this.facade.detailStatus();
      const summary = this.summary()?.nativeElement;
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (this.focused || status !== 'ready') return;
        this.focused = true;
        (summary ?? heading)?.focus();
      });
    });
  }

  stateTextKey(): string | null {
    const code = this.facade.detailError()?.code ?? null;
    if (code === CRASH_NOT_FINAL_CODE) return STATE_KEYS.recoverable;
    if (code === NOT_FOUND_CODE) return STATE_KEYS.notFound;
    if (this.facade.detailStatus() === 'unavailable') {
      return STATE_KEYS.unavailable;
    }
    return null;
  }

  reload(): void {
    void this.facade.loadDetail(this.crashId());
  }
}
