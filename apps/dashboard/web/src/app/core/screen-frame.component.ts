// Moldura de tela (CTG-0002.md §9): título, intro, região viva e os seis estados de M4 — a
// página só projeta o conteúdo de `ready`. Em L0 o estado padrão é "indisponível nesta versão",
// citando a dependência por identificador (R-0011 / BP-DASH-MONITOR-001): nunca mock silencioso,
// nunca fixture como dado.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  DetranEmptyStateComponent,
  DetranErrorStateComponent,
  DetranLoadingStateComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import type {
  DashboardBlock,
  DashboardPanel,
  DashboardRouteLevel,
} from '../app.route-manifest';
import { DashErrorBannerComponent } from './error-banner.component';
import type { ClassifiedError } from './error-boundary';
import type { FreshnessMeta } from './freshness.store';
import { tokenKey } from './i18n-token-key';
import { FreshnessSealComponent } from '../shared/freshness-seal.component';
import { L0_DEPENDENCY, type ScreenState } from '../shared/screen-state';

const LIVE_REGION_KEY = 'dashboard.a11y.live_region';
const RETRY_KEY = 'dashboard.common.action.retry';
const PANEL_BLOCKED_KEY = 'dashboard.errors.panel_blocked_by_decision';
const STATE_KEYS: Readonly<Record<string, string>> = {
  unavailable_in_version: 'dashboard.states.unavailable_in_version',
  loading: 'dashboard.states.loading',
  empty: 'dashboard.states.empty',
  error: 'dashboard.states.error',
  unavailable: 'dashboard.states.unavailable',
  stale: 'dashboard.states.stale',
  blocked_by_decision: 'dashboard.states.blocked_by_decision',
};

@Component({
  selector: 'dash-screen-frame',
  imports: [
    DetranEmptyStateComponent,
    DetranErrorStateComponent,
    DetranLoadingStateComponent,
    DashErrorBannerComponent,
    FreshnessSealComponent,
    StynxTranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen() ?? ""',
    '[attr.data-state]': 'state().kind',
    '[attr.data-level]': 'level()',
  },
  template: `
    <h1>{{ titleKey() | stynxTranslate }}</h1>
    <p class="dash-intro">{{ introKey() | stynxTranslate }}</p>
    <div
      role="status"
      aria-live="polite"
      [attr.aria-label]="LIVE_REGION_KEY | stynxTranslate"
    >
      @if (liveKey(); as key) {
        {{ key | stynxTranslate: stateParams() }}
      }
    </div>
    @switch (state().kind) {
      @case ('unavailable_in_version') {
        <detran-error-state
          [title]="STATE_KEYS['unavailable_in_version'] | stynxTranslate"
          [message]="STATE_KEYS['unavailable_in_version'] | stynxTranslate"
        />
        <code [attr.data-dependency]="L0_DEPENDENCY">{{ L0_DEPENDENCY }}</code>
      }
      @case ('loading') {
        <detran-loading-state
          [label]="STATE_KEYS['loading'] | stynxTranslate"
        />
      }
      @case ('empty') {
        <detran-empty-state
          [title]="emptyKey() | stynxTranslate"
          [message]="STATE_KEYS['empty'] | stynxTranslate"
        />
      }
      @case ('error') {
        @if (classified(); as error) {
          <dash-error-banner [error]="error" />
        }
        <button type="button" (click)="retry.emit()">
          {{ RETRY_KEY | stynxTranslate }}
        </button>
      }
      @case ('unavailable') {
        <dash-freshness-seal [freshness]="sealMeta()" [block]="block()" />
      }
      @case ('stale') {
        <dash-freshness-seal [freshness]="sealMeta()" [block]="block()" />
      }
      @case ('blocked_by_decision') {
        <detran-error-state
          [title]="
            STATE_KEYS['blocked_by_decision'] | stynxTranslate: stateParams()
          "
          [message]="PANEL_BLOCKED_KEY | stynxTranslate"
        />
        <code data-decision>{{ decision() }}</code>
        @if (decisionLink(); as link) {
          <a [href]="link">{{ decision() }}</a>
        }
      }
      @case ('ready') {
        <ng-content />
      }
    }
  `,
})
export class ScreenFrameComponent {
  readonly slug = input.required<string>();
  readonly screen = input<DashboardPanel | null>(null);
  readonly block = input<DashboardBlock>('A');
  readonly state = input.required<ScreenState<unknown>>();
  readonly level = input<DashboardRouteLevel>('L0');
  readonly decisionLink = input<string | null>(null);

  readonly retry = output<void>();

  protected readonly LIVE_REGION_KEY = LIVE_REGION_KEY;
  protected readonly RETRY_KEY = RETRY_KEY;
  protected readonly PANEL_BLOCKED_KEY = PANEL_BLOCKED_KEY;
  protected readonly STATE_KEYS = STATE_KEYS;
  protected readonly L0_DEPENDENCY = L0_DEPENDENCY;

  protected readonly titleKey = computed(
    () => `${tokenKey('screens', this.slug())}.title`,
  );
  protected readonly introKey = computed(
    () => `${tokenKey('screens', this.slug())}.intro`,
  );
  protected readonly emptyKey = computed(
    () => `${tokenKey('screens', this.slug())}.empty`,
  );

  /** Texto do estado corrente na região viva; `ready` não anuncia nada. */
  protected readonly liveKey = computed<string | null>(() => {
    const kind = this.state().kind;
    return kind === 'ready' ? null : (STATE_KEYS[kind] ?? null);
  });

  protected readonly stateParams = computed<Record<string, string>>(() => {
    const state = this.state();
    const params: Record<string, string> = {};
    if (state.kind === 'blocked_by_decision')
      params['decision'] = state.decision;
    return params;
  });

  protected readonly classified = computed<ClassifiedError | null>(() => {
    const state = this.state();
    return state.kind === 'error' ? state.error : null;
  });

  protected readonly sealMeta = computed<FreshnessMeta | null>(() => {
    const state = this.state();
    return state.kind === 'unavailable' || state.kind === 'stale'
      ? state.freshness
      : null;
  });

  protected readonly decision = computed(() => {
    const state = this.state();
    return state.kind === 'blocked_by_decision' ? state.decision : '';
  });
}
