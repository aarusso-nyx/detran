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
  type MobileCommandContext,
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
        <p>
          {{ labels['teat.forms.homologationAit.scenarioPlate'] }}
          {{ snapshot()?.plate }}
        </p>
        <p data-scenario-hash>
          {{ labels['teat.forms.homologationAit.syntheticId'] }}
          {{ snapshot()?.scenarioHash }}
        </p>
      }
      <form
        [attr.data-homologation-workflow-step]="
          homologation ? 'ait-review' : null
        "
        (submit)="onSubmit($event)"
      >
        @if (homologation) {
          <label
            >{{ labels['teat.forms.homologationAit.explicitAction'] }}
            <select name="explicit_action">
              <option value="">
                {{ labels['teat.forms.homologationAit.select'] }}
              </option>
              <option value="finalize">
                {{ labels['teat.forms.homologationAit.finalizeSimulation'] }}
              </option>
            </select>
          </label>
        }
        <button type="submit">{{ submitLabel() }}</button>
        @if (error()) {
          <p role="alert">{{ error() }}</p>
        }
      </form>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AitReviewPageComponent implements OnInit {
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
  private i18n?: TeatI18n;
  readonly screenId = 'ait-review';
  readonly contract = mobilePageContract(this.screenId);
  readonly schema = this.contract.schemaId;
  readonly client = this.contract.clientId;
  readonly load = () => this.runtime.load(this.contract);
  readonly integration = this.load();
  readonly submit = async (input: unknown, context?: MobileCommandContext) => {
    const result = await this.integration.submit!(input, context);
    if (result.kind === 'persisted' && this.i18n !== undefined) {
      this.status.set(this.i18n.translate('teat.states.finalizado_local'));
    } else if (result.kind === 'demonstrated' && this.i18n !== undefined) {
      this.status.set(this.i18n.translate('teat.states.demonstrated'));
    }
    return result;
  };
  readonly title = signal('');
  readonly submitLabel = signal('');
  readonly profileLabel = signal('');
  readonly status = signal('');
  readonly error = signal('');
  readonly snapshot = () => this.homologationPort?.snapshot?.();
  readonly state = signal<
    'loading' | 'ready' | 'persisted' | 'demonstrated' | 'blocked' | 'error'
  >('loading');

  ngOnInit(): void {
    const i18n = this.injector.get(TeatI18n);
    this.i18n = i18n;
    void this.pendingTasks.run(async () => {
      await i18n.initialize();
      this.title.set(i18n.translate('teat.screens.ait-review.title'));
      this.submitLabel.set(i18n.translate('teat.common.confirm'));
      this.profileLabel.set(i18n.translate('teat.shell.homologation'));
      this.state.set(this.homologation ? 'ready' : 'blocked');
      this.status.set(
        i18n.translate(
          this.homologation ? 'teat.common.loading' : 'teat.readiness.blocker',
        ),
      );
    });
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const explicitAction = (
      (event.target as HTMLFormElement).elements.namedItem(
        'explicit_action',
      ) as HTMLSelectElement | null
    )?.value;
    if (
      this.homologation &&
      this.homologationPort?.snapshot !== undefined &&
      explicitAction !== 'finalize'
    ) {
      this.error.set(
        this.injector
          .get(TeatI18n)
          .translate('teat.forms.homologationAit.finalizeRequired'),
      );
      return;
    }
    void this.pendingTasks.run(async () => {
      const i18n = this.i18n;
      if (i18n === undefined) {
        this.state.set('blocked');
        return;
      }
      if (!this.homologation) {
        this.state.set('blocked');
        this.status.set(i18n.translate('teat.readiness.blocker'));
        return;
      }
      try {
        const result = await this.submit(
          this.homologation ? { explicit_action: explicitAction } : undefined,
        );
        if (result.kind === 'demonstrated') {
          this.state.set('demonstrated');
          this.error.set('');
          if (
            this.homologationPort?.snapshot !== undefined &&
            this.router !== null &&
            this.location !== null
          ) {
            await dispatchTransition(
              {
                from: 'ait-review',
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
        this.error.set(this.labels['teat.forms.homologationAit.invalidStep']);
      }
    });
  }
}
