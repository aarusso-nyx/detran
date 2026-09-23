// D-07 Detalhe da integração (IU-DASH-D-07; CTG-0002.md §9). L0 — sobe a L2 quando
// `integrations.client.ts` (gerado de BP-DASH-MONITOR-001) existir. A causa raiz é anotação na
// trilha (`dashboard:alert:annotate`), nunca ato de negócio; as categorias são as três do
// formulário (transporte, aceite, conteúdo).
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
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { DeepLinkButtonComponent } from '../../../shared/deep-link-button.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import { SourceStatusTableComponent } from '../../../shared/source-status-table.component';
import type { SourceStatusView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

type RootCauseCategory = 'transport' | 'acceptance' | 'payload';

interface IntegrationDetailData {
  readonly source: SourceStatusView;
  readonly isolated: readonly {
    readonly id: string;
    readonly category: RootCauseCategory;
  }[];
}

type IntegrationDetailState = Exclude<
  ScreenState<IntegrationDetailData>,
  { kind: 'blocked_by_decision' }
>;

const ANNOTATE_COMMAND = 'dashboard:alert:annotate';
const CATEGORY_KEYS: Readonly<Record<RootCauseCategory, string>> = {
  transport: 'dashboard.forms.causa_raiz.category_transport',
  acceptance: 'dashboard.forms.causa_raiz.category_acceptance',
  payload: 'dashboard.forms.causa_raiz.category_payload',
};

@Component({
  selector: 'dash-integracoes-system-page',
  imports: [
    ScreenFrameComponent,
    DashCanDirective,
    DashErrorBannerComponent,
    DeepLinkButtonComponent,
    FreshnessSealComponent,
    SourceStatusTableComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame
      [slug]="'integracoes-system'"
      [block]="'D'"
      [state]="state()"
    >
      @if (data(); as data) {
        <dash-source-status-table [sources]="sourceList()" />
        <dash-freshness-seal [freshness]="data.source.freshness" [block]="'D'">
          <code data-field="source">{{ data.source.source }}</code>
        </dash-freshness-seal>
        <ul>
          @for (item of data.isolated; track item.id) {
            <li>
              <code data-field="isolated">{{ item.id }}</code>
              <span data-field="category">{{
                categoryKey(item.category) | stynxTranslate
              }}</span>
            </li>
          }
        </ul>
        <!-- L0: o deep-link do incidente só existe com R-0011. -->
        <dash-deep-link-button [app]="null" [href]="''" />
        <button
          *dashCan="ANNOTATE_COMMAND"
          type="button"
          data-command="dashboard:alert:annotate"
          (click)="notice.unavailable(ANNOTATE_COMMAND)"
        >
          {{ 'dashboard.forms.causa_raiz.submit' | stynxTranslate }}
        </button>
        @if (notice.error(); as error) {
          <dash-error-banner [error]="error" />
        }
      }
    </dash-screen-frame>
  `,
})
export class IntegrationDetailPageComponent {
  /** Parâmetro de rota (`withComponentInputBinding`). */
  readonly system = input('');

  readonly state = mutableAccessor<IntegrationDetailState>(
    UNAVAILABLE_IN_VERSION,
  );
  protected readonly notice = createCommandNotice();

  protected readonly ANNOTATE_COMMAND = ANNOTATE_COMMAND;

  protected readonly data = computed<IntegrationDetailData | null>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : null;
  });

  /** Lista estável (nunca um literal novo por ciclo de detecção). */
  protected readonly sourceList = computed<readonly SourceStatusView[]>(() => {
    const data = this.data();
    return data ? [data.source] : [];
  });

  protected categoryKey(category: RootCauseCategory): string {
    return CATEGORY_KEYS[category];
  }
}
