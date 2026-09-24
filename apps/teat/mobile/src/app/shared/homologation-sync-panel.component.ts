import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TeatI18n } from '../core/i18n.service.js';
import { dispatchTransition } from '../navigation/transitions.js';
import { TEAT_MOBILE_HOMOLOGATION_SYNC } from './homologation-sync.port.js';

@Component({
  standalone: true,
  selector: 'teat-homologation-sync-panel',
  template: `
    @if (sync) {
      <section [attr.data-homologation-sync-step]="screenId()">
        <p role="status">{{ labels.item }} {{ statusLabel() }}</p>
        @if (screenId() === 'sync') {
          <button type="button" data-sync-action="enqueue" (click)="enqueue()">
            {{ labels.enqueue }}
          </button>
          <button
            type="button"
            data-sync-action="open-item"
            (click)="openItem()"
          >
            {{ labels.openItem }}
          </button>
          <button
            type="button"
            data-sync-action="mark-conflict"
            (click)="markConflict()"
          >
            {{ labels.markConflict }}
          </button>
          <button
            type="button"
            data-sync-action="open-conflict"
            (click)="openConflict()"
          >
            {{ labels.openConflict }}
          </button>
        }
        @if (screenId() === 'sync-item') {
          <button type="button" data-sync-action="fail" (click)="fail()">
            {{ labels.fail }}
          </button>
          <button type="button" data-sync-action="retry" (click)="retry()">
            {{ labels.retry }}
          </button>
        }
        @if (screenId() === 'sync-conflict') {
          <button type="button" data-sync-action="resolve" (click)="resolve()">
            {{ labels.resolve }}
          </button>
        }
        @if (error()) {
          <p role="alert">{{ error() }}</p>
        }
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomologationSyncPanelComponent {
  private readonly i18n = inject(TeatI18n);
  readonly screenId = input.required<string>();
  readonly sync = inject(TEAT_MOBILE_HOMOLOGATION_SYNC, { optional: true });
  readonly error = signal('');
  private readonly router = inject(Router);
  readonly labels = {
    item: this.i18n.translate('teat.shell.homologationSyncItem'),
    enqueue: this.i18n.translate('teat.shell.homologationSyncEnqueue'),
    openItem: this.i18n.translate('teat.shell.homologationSyncOpenItem'),
    markConflict: this.i18n.translate(
      'teat.shell.homologationSyncMarkConflict',
    ),
    openConflict: this.i18n.translate(
      'teat.shell.homologationSyncOpenConflict',
    ),
    fail: this.i18n.translate('teat.shell.homologationSyncFail'),
    retry: this.i18n.translate('teat.shell.homologationSyncRetry'),
    resolve: this.i18n.translate('teat.shell.homologationSyncResolve'),
  };

  private runIfAllowed(
    allowed: boolean,
    mutation: () => void,
    denied: string,
  ): boolean {
    if (!allowed) {
      this.error.set(denied);
      return false;
    }
    mutation();
    this.error.set('');
    return true;
  }

  statusLabel(): string {
    return this.i18n.translate(
      `teat.shell.homologationSyncState.${this.sync?.status() ?? 'empty'}`,
    );
  }

  enqueue(): void {
    this.sync?.enqueue();
    this.error.set('');
  }

  async openItem(): Promise<void> {
    if (this.sync?.status() === 'empty') {
      this.error.set(
        this.i18n.translate('teat.shell.homologationSyncMissingItem'),
      );
      return;
    }
    await dispatchTransition(
      { from: 'sync', action: 'Abrir pendência', conditionSatisfied: true },
      this.router,
      { back: () => undefined },
    );
  }

  fail(): void {
    if (
      this.runIfAllowed(
        this.sync?.status() === 'queued',
        () => this.sync?.fail(),
        this.i18n.translate('teat.shell.homologationSyncMissingItem'),
      )
    )
      this.error.set(this.i18n.translate('teat.shell.homologationSyncFailed'));
  }

  async retry(): Promise<void> {
    if (
      !this.runIfAllowed(
        this.sync?.status() === 'failed',
        () => this.sync?.retry(),
        this.i18n.translate('teat.shell.homologationSyncRetryDenied'),
      )
    )
      return;
    await dispatchTransition(
      {
        from: 'sync-item',
        action: 'Reenviar',
        conditionSatisfied: this.sync?.status() === 'retried',
      },
      this.router,
      { back: () => undefined },
    );
  }

  markConflict(): void {
    this.runIfAllowed(
      this.sync?.status() === 'retried',
      () => this.sync?.markConflict(),
      this.i18n.translate('teat.shell.homologationSyncConflictDenied'),
    );
  }

  async openConflict(): Promise<void> {
    const hasConflict = this.sync?.status() === 'conflict';
    if (!hasConflict)
      this.error.set(
        this.i18n.translate('teat.shell.homologationSyncMissingConflict'),
      );
    else this.error.set('');
    await dispatchTransition(
      {
        from: 'sync',
        action: 'Abrir conflito',
        conditionSatisfied: hasConflict,
      },
      this.router,
      { back: () => undefined },
    );
  }

  resolve(): void {
    if (
      this.runIfAllowed(
        this.sync?.status() === 'conflict',
        () => this.sync?.resolve(),
        this.i18n.translate('teat.shell.homologationSyncMissingConflict'),
      )
    )
      this.error.set(
        this.i18n.translate('teat.shell.homologationSyncResolved'),
      );
  }
}
