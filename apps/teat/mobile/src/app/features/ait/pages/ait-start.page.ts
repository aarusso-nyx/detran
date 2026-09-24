import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  PendingTasks,
  signal,
  type OnInit,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TeatI18n } from '../../../core/i18n.service.js';
import { TEAT_HOMOLOGATION_AIT } from '../../../shared/homologation-ait.port.js';
import { dispatchTransition } from '../../../navigation/transitions.js';
import {
  mobilePageContract,
  MobilePageRuntime,
} from '../../../shared/mobile-page.component.js';

@Component({
  standalone: true,
  template: `
    <main
      [attr.data-screen]="screenId"
      [attr.data-state]="state()"
      [attr.data-profile]="homologation ? 'homologation' : 'production'"
    >
      @if (homologation) {
        <p role="note">{{ profileLabel() }}</p>
      }
      <h1>{{ title() }}</h1>
      <p role="status">{{ status() }}</p>
      @if (homologation) {
        <form
          data-homologation-workflow-step="ait-start"
          (submit)="onStart($event)"
        >
          <label
            >{{ labels['teat.forms.homologationAit.approach'] }}
            <select name="approach">
              <option value="">
                {{ labels['teat.forms.homologationAit.select'] }}
              </option>
              <option value="with-approach">
                {{ labels['teat.forms.homologationAit.withApproach'] }}
              </option>
            </select>
          </label>
          <button type="submit">
            {{ labels['teat.forms.homologationAit.continue'] }}
          </button>
          @if (error()) {
            <p role="alert">{{ error() }}</p>
          }
        </form>
      } @else {
        <button type="button" (click)="onStart()">{{ actionLabel() }}</button>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AitStartPageComponent implements OnInit {
  readonly labels = new Proxy({} as Readonly<Record<string, string>>, {
    get: (_target, key) => this.injector.get(TeatI18n).translate(String(key)),
  });
  private readonly runtime = inject(MobilePageRuntime);
  private readonly injector = inject(Injector);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly router = inject(Router, { optional: true });
  private readonly location = inject(Location, { optional: true });
  private readonly homologationPort = inject(TEAT_HOMOLOGATION_AIT, {
    optional: true,
  });
  readonly homologation =
    inject(TEAT_HOMOLOGATION_AIT, { optional: true }) !== null;
  readonly screenId = 'ait-start';
  readonly contract = mobilePageContract(this.screenId);
  readonly schema = this.contract.schemaId;
  readonly client = this.contract.clientId;
  readonly load = () => this.runtime.load(this.contract);
  readonly integration = this.load();
  readonly title = signal('');
  readonly status = signal('');
  readonly actionLabel = signal('');
  readonly profileLabel = signal('');
  readonly error = signal('');
  readonly state = signal<
    'loading' | 'ready' | 'blocked' | 'demonstrated' | 'error'
  >('loading');

  ngOnInit(): void {
    void this.pendingTasks.run(async () => {
      const i18n = this.injector.get(TeatI18n);
      await i18n.initialize();
      this.title.set(i18n.translate('teat.screens.ait-start.title'));
      this.actionLabel.set(i18n.translate('teat.common.confirm'));
      this.profileLabel.set(i18n.translate('teat.shell.homologation'));
      this.status.set(i18n.translate('teat.common.loading'));
      this.state.set(this.homologation ? 'ready' : 'blocked');
    });
  }

  onStart(event?: Event): void {
    event?.preventDefault();
    const approach =
      event === undefined
        ? undefined
        : (
            (event.target as HTMLFormElement).elements.namedItem(
              'approach',
            ) as HTMLSelectElement | null
          )?.value;
    if (
      this.homologation &&
      this.homologationPort?.snapshot !== undefined &&
      approach !== 'with-approach'
    ) {
      this.error.set(
        this.injector
          .get(TeatI18n)
          .translate('teat.forms.homologationAit.approachRequired'),
      );
      return;
    }
    void this.pendingTasks.run(async () => {
      const i18n = this.injector.get(TeatI18n);
      try {
        const result = await this.integration.submit?.(
          this.homologation ? { approach } : undefined,
        );
        if (result?.kind === 'demonstrated' && this.homologation) {
          this.state.set('demonstrated');
          this.status.set(i18n.translate('teat.states.demonstrated'));
          this.error.set('');
          if (
            this.homologationPort?.snapshot !== undefined &&
            this.router !== null &&
            this.location !== null
          ) {
            await dispatchTransition(
              {
                from: 'ait-start',
                action: 'Continuar',
                conditionSatisfied: true,
              },
              this.router,
              this.location,
            );
          }
        } else {
          this.state.set('blocked');
          this.status.set(i18n.translate('teat.readiness.blocker'));
        }
      } catch {
        this.state.set('error');
        this.status.set(i18n.translate('teat.errors.internal'));
        this.error.set(
          i18n.translate('teat.forms.homologationAit.invalidStep'),
        );
      }
    });
  }
}
