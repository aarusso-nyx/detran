/** Manifest-bound navigation controls for the explicit UI homologation profile. */
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { TeatI18n } from '../core/i18n.service.js';
import {
  dispatchTransition,
  TEAT_TRANSITIONS,
} from '../navigation/transitions.js';
import { TEAT_HOMOLOGATION_AIT } from './homologation-ait.port.js';
import { TEAT_MOBILE_HOMOLOGATION_SYNC } from './homologation-sync.port.js';

@Component({
  standalone: true,
  selector: 'teat-homologation-transition-panel',
  template: `
    @if (homologation) {
      <nav
        [attr.data-homologation-transitions]="activeScreen()"
        [attr.aria-label]="labels.navigation"
      >
        @for (item of transitions(); track item.index) {
          <button
            type="button"
            [attr.data-transition-index]="item.index"
            [attr.data-action]="item.action"
            [attr.data-to]="item.to"
            (click)="dispatch(item)"
          >
            {{ actionLabel(item.action) }} → {{ destinationLabel(item.to) }}
            @if (item.condition) {
              <span>({{ labels.condition }})</span>
            }
          </button>
        }
        @if (error()) {
          <p role="alert">{{ error() }}</p>
        }
      </nav>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomologationTransitionPanelComponent {
  readonly screenId = input<string>();
  readonly homologation = inject(TEAT_HOMOLOGATION_AIT, { optional: true });
  private readonly sync = inject(TEAT_MOBILE_HOMOLOGATION_SYNC, {
    optional: true,
  });
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly i18n = inject(TeatI18n);
  private readonly routeScreen = signal(
    this.router.url.slice(1).split('?')[0] ?? '',
  );
  readonly error = signal('');
  readonly labels = {
    navigation: this.i18n.translate('teat.navigation.homologationActions'),
    condition: this.i18n.translate('teat.navigation.homologationCondition'),
    unavailable: this.i18n.translate('teat.navigation.homologationUnavailable'),
    pending: this.i18n.translate('teat.navigation.homologationPending'),
    denied: this.i18n.translate('teat.navigation.homologationDenied'),
  };
  readonly activeScreen = computed(() => this.screenId() ?? this.routeScreen());
  readonly transitions = computed(() =>
    TEAT_TRANSITIONS.flatMap((entry, index) =>
      entry.from === this.activeScreen() ? [{ ...entry, index }] : [],
    ),
  );
  private readonly actionIndexes = new Map(
    TEAT_TRANSITIONS.map(
      (entry, index) => [entry.action, index] as const,
    ).filter(
      ([action], index, all) =>
        all.findIndex(([candidate]) => candidate === action) === index,
    ),
  );

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.routeScreen.set(
          event.urlAfterRedirects.slice(1).split('?')[0] ?? '',
        );
        this.error.set('');
      }
    });
  }

  actionLabel(action: string): string {
    const index = this.actionIndexes.get(action);
    if (index === undefined)
      throw new Error('homologation-action-label-missing');
    const key = `teat.navigation.homologationAction.${index}`;
    return this.i18n.translate(key);
  }

  destinationLabel(to: string): string {
    const key =
      to === '__previous__'
        ? 'teat.navigation.previous'
        : `teat.screens.${to}.title`;
    return this.i18n.translate(key);
  }

  async dispatch(
    item: (typeof this.transitions extends () => infer T ? T : never)[number],
  ): Promise<void> {
    if (item.to.startsWith('crash-') || item.to === 'ait-speed-measurement') {
      this.error.set(this.labels.unavailable);
      return;
    }
    const conditionSatisfied = this.hasValidatedFact(
      item.from,
      item.action,
      item.condition,
    );
    if (item.condition !== '' && !conditionSatisfied) {
      this.error.set(this.labels.pending);
      return;
    }
    const result = await dispatchTransition(
      {
        from: item.from,
        action: item.action,
        conditionSatisfied,
        transitionIndex: item.index,
      },
      this.router,
      this.location,
    );
    if (result.kind === 'denied') this.error.set(this.labels.denied);
  }

  private hasValidatedFact(
    from: string,
    action: string,
    condition: string,
  ): boolean {
    if (condition === '') return true;
    if (from === 'sync' && action === 'Abrir conflito')
      return this.sync?.status() === 'conflict';
    if (from === 'sync-item' && action === 'Reenviar')
      return this.sync?.status() === 'retried';
    if (from.startsWith('ait-') && action === 'Continuar')
      return (
        this.homologation?.snapshot?.().completedSteps.includes(from) === true
      );
    return false;
  }
}
