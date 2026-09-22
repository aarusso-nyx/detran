// D-14 Catálogo de indicadores (IU-DASH-D-14; CTG-0002.md §9). L0 — sobe a L2 quando
// `catalogue.client.ts` (gerado de BP-DASH-MONITOR-001) existir. Mesma página serve a rota-filha
// `/indicadores/:id` (ficha única): com `id`, o indicador em foco é destacado. Os dois conjuntos
// (indicadores do bloco B e demais linhas) são nomeados como no calendário de deveres (M4).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { DashCanDirective } from '../../../core/can.directive';
import { createCommandNotice } from '../../../core/command-notice';
import { DashErrorBannerComponent } from '../../../core/error-banner.component';
import { tokenKey } from '../../../core/i18n-token-key';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { ClassificationBadgeComponent } from '../../../shared/classification-badge.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import { SourceStatusTableComponent } from '../../../shared/source-status-table.component';
import { TargetVsCeilingComponent } from '../../../shared/target-vs-ceiling.component';
import type { IndicatorView, SourceStatusView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

type IndicatorCatalogueState = Exclude<
  ScreenState<readonly IndicatorView[]>,
  { kind: 'blocked_by_decision' }
>;

const UPDATE_COMMAND = 'dashboard:indicator-config:update';
const PUBLISH_COMMAND = 'dashboard:indicator-config:publish';
const BLOCK_B_KEY = 'dashboard.blocks.b';
const MASTER_TABLE_KEY = 'dashboard.screens.deveres.title';

@Component({
  selector: 'dash-indicadores-page',
  imports: [
    ScreenFrameComponent,
    ClassificationBadgeComponent,
    DashCanDirective,
    DashErrorBannerComponent,
    FreshnessSealComponent,
    SourceStatusTableComponent,
    TargetVsCeilingComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame [slug]="'indicadores'" [block]="'A'" [state]="state()">
      <section data-group="block_b">
        <h2>{{ BLOCK_B_KEY | stynxTranslate }}</h2>
        <ul>
          @for (indicator of blockB(); track indicator.code) {
            <li [attr.data-focus]="indicator.code === id() ? 'true' : null">
              <span data-field="name">{{
                indicatorKey(indicator.code) | stynxTranslate
              }}</span>
              <dash-classification-badge
                [classification]="indicator.classification"
              />
              <dash-freshness-seal
                [freshness]="indicator.freshness"
                [block]="indicator.block"
              >
                <code data-field="threshold">{{ indicator.threshold }}</code>
              </dash-freshness-seal>
            </li>
          }
        </ul>
      </section>
      <section data-group="master_table">
        <h2>{{ MASTER_TABLE_KEY | stynxTranslate }}</h2>
        <ul>
          @for (indicator of others(); track indicator.code) {
            <li [attr.data-focus]="indicator.code === id() ? 'true' : null">
              <span data-field="name">{{
                indicatorKey(indicator.code) | stynxTranslate
              }}</span>
              <dash-classification-badge
                [classification]="indicator.classification"
              />
              <dash-freshness-seal
                [freshness]="indicator.freshness"
                [block]="indicator.block"
              >
                <code data-field="threshold">{{ indicator.threshold }}</code>
              </dash-freshness-seal>
            </li>
          }
        </ul>
      </section>
      <!-- Meta e teto do indicador em foco: só quando o dado trouxer (L0 não inventa). -->
      <dash-target-vs-ceiling [target]="null" [ceiling]="null" />
      <!-- Fonte conectada por indicador: a lista chega com R-0011. -->
      <dash-source-status-table [sources]="EMPTY_SOURCES" />
      <button
        *dashCan="UPDATE_COMMAND"
        type="button"
        data-command="dashboard:indicator-config:update"
        (click)="notice.unavailable(UPDATE_COMMAND)"
      >
        {{ 'dashboard.forms.configurar_indicador.submit' | stynxTranslate }}
      </button>
      <button
        *dashCan="PUBLISH_COMMAND"
        type="button"
        data-command="dashboard:indicator-config:publish"
        (click)="notice.unavailable(PUBLISH_COMMAND)"
      >
        {{ 'dashboard.forms.configurar_indicador.submit' | stynxTranslate }}
      </button>
      @if (notice.error(); as error) {
        <dash-error-banner [error]="error" />
      }
    </dash-screen-frame>
  `,
})
export class IndicatorCataloguePageComponent {
  /** Parâmetro da rota-filha §B (`withComponentInputBinding`). */
  readonly id = input('');

  readonly state = mutableAccessor<IndicatorCatalogueState>(
    UNAVAILABLE_IN_VERSION,
  );
  protected readonly notice = createCommandNotice();

  protected readonly UPDATE_COMMAND = UPDATE_COMMAND;
  protected readonly PUBLISH_COMMAND = PUBLISH_COMMAND;
  protected readonly BLOCK_B_KEY = BLOCK_B_KEY;
  protected readonly MASTER_TABLE_KEY = MASTER_TABLE_KEY;
  protected readonly EMPTY_SOURCES: readonly SourceStatusView[] = [];

  protected readonly indicators = computed<readonly IndicatorView[]>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : [];
  });

  protected readonly blockB = computed(() =>
    this.indicators().filter((indicator) => indicator.block === 'B'),
  );

  protected readonly others = computed(() =>
    this.indicators().filter((indicator) => indicator.block !== 'B'),
  );

  protected indicatorKey(code: string): string {
    return tokenKey('indicators', code);
  }
}
