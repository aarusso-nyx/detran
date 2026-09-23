import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  PendingTasks,
  signal,
  type OnInit,
} from '@angular/core';
import { TeatI18n } from '../../../core/i18n.service.js';
import {
  mobilePageContract,
  type MobileCommandContext,
  MobilePageRuntime,
} from '../../../shared/mobile-page.component.js';

@Component({
  standalone: true,
  template: `
    <main [attr.data-screen]="screenId" [attr.data-state]="state()">
      <h1>{{ title() }}</h1>
      <p role="status">{{ status() }}</p>
      <form (submit)="onSubmit($event)">
        <button type="submit">{{ submitLabel() }}</button>
      </form>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AitReviewPageComponent implements OnInit {
  private readonly runtime = inject(MobilePageRuntime);
  private readonly injector = inject(Injector);
  private readonly pendingTasks = inject(PendingTasks);
  private i18n?: TeatI18n;
  private loadedAction?: Readonly<{
    input: Record<string, unknown>;
    context: MobileCommandContext;
  }>;
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
    }
    return result;
  };
  readonly title = signal('');
  readonly submitLabel = signal('');
  readonly status = signal('');
  readonly state = signal<
    'loading' | 'ready' | 'persisted' | 'blocked' | 'error'
  >('loading');

  ngOnInit(): void {
    const i18n = this.injector.get(TeatI18n);
    this.i18n = i18n;
    void this.pendingTasks.run(async () => {
      const load = this.integration.load();
      await i18n.initialize();
      this.title.set(i18n.translate('teat.screens.ait-review.title'));
      this.submitLabel.set(i18n.translate('teat.common.confirm'));
      this.status.set(i18n.translate('teat.common.loading'));
      const loaded = await load;
      this.loadedAction = reviewActionFromQueue(loaded.value);
      this.state.set('ready');
      this.status.set(i18n.translate('teat.common.save'));
    });
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    void this.pendingTasks.run(async () => {
      const i18n = this.i18n;
      if (i18n === undefined || this.loadedAction === undefined) {
        this.state.set('blocked');
        if (i18n !== undefined) {
          this.status.set(i18n.translate('teat.readiness.blocker'));
        }
        return;
      }
      try {
        const result = await this.submit(
          this.loadedAction.input,
          this.loadedAction.context,
        );
        if (result.kind === 'persisted') {
          this.state.set('persisted');
        } else {
          this.state.set('blocked');
          this.status.set(i18n.translate('teat.readiness.blocker'));
        }
      } catch {
        this.state.set('error');
        this.status.set(i18n.translate('teat.errors.internal'));
      }
    });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function reviewActionFromQueue(value: unknown):
  | Readonly<{
      input: Record<string, unknown>;
      context: MobileCommandContext;
    }>
  | undefined {
  if (!Array.isArray(value)) return undefined;
  const item = value.find(
    (candidate) => isRecord(candidate) && candidate['entityType'] === 'ait',
  );
  if (!isRecord(item)) return undefined;
  const input = item['payloadJson'];
  const context = item['commandContext'];
  if (!isRecord(input) || !isMobileCommandContext(context)) return undefined;
  return { input, context };
}

function isMobileCommandContext(value: unknown): value is MobileCommandContext {
  if (!isRecord(value)) return false;
  const session = value['session'];
  const location = value['location'];
  if (!isRecord(session) || !isRecord(location)) return false;
  const sessionKeys = [
    'tenantId',
    'orgUnitId',
    'agentId',
    'deviceId',
    'shiftId',
    'appVersion',
  ] as const;
  return (
    (!sessionKeys.every((key) => typeof session[key] === 'string') ||
      !Array.isArray(session['roles']) ||
      !session['roles'].every((role) => typeof role === 'string') ||
      typeof value['localEntityId'] !== 'string' ||
      value['entityType'] !== 'ait' ||
      typeof value['version'] !== 'number' ||
      typeof value['idempotencyKey'] !== 'string' ||
      typeof value['payloadHash'] !== 'string' ||
      typeof value['createdLocallyAt'] !== 'string' ||
      typeof value['normativePackageId'] !== 'string' ||
      typeof value['normativePackageVersion'] !== 'string' ||
      typeof value['reservationId'] !== 'string' ||
      typeof value['reservedNumber'] !== 'number' ||
      typeof value['ifMatch'] !== 'string' ||
      typeof location['latitude'] !== 'number' ||
      typeof location['longitude'] !== 'number' ||
      typeof location['accuracyMeters'] !== 'number' ||
      typeof location['capturedAt'] !== 'string' ||
      !['gps', 'network', 'manual'].includes(String(location['source']))) ===
    false
  );
}
