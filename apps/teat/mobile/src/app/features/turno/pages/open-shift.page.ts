import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthBootstrapCoordinator,
  BootstrapStore,
} from '../../../core/bootstrap.store.js';
import { TeatI18n } from '../../../core/i18n.service.js';
import { MobileBootstrapClient } from '../../../data/api/mobile-bootstrap.client.js';
import { TEAT_MOBILE_ID } from '../../../data/sync/sync.worker.js';
import { TEAT_MOBILE_HOMOLOGATION_SHIFT } from '../../../shared/homologation-shift.port.js';
import {
  mobilePageContract,
  MobilePageRuntime,
} from '../../../shared/mobile-page.component.js';

@Component({
  standalone: true,
  template: `
    <main [attr.data-screen]="screenId">
      <h1>{{ title }}</h1>
      <form (submit)="submit($event)">
        <label>
          {{ unitLabel }}
          <select name="operational_unit_id" required>
            @for (unit of operationalUnits(); track unit.id) {
              <option [value]="unit.id">{{ unit.label }}</option>
            }
          </select>
        </label>
        <label>
          {{ startedAtLabel }}
          <input name="started_at" type="datetime-local" required />
        </label>
        <button type="submit">{{ confirmLabel }}</button>
      </form>
      <p role="status">{{ status() }}</p>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenShiftPageComponent {
  private readonly i18n = inject(TeatI18n);
  private readonly runtime = inject(MobilePageRuntime);
  private readonly bootstrap = inject(BootstrapStore);
  private readonly coordinator = inject(AuthBootstrapCoordinator);
  private readonly apiClient = inject(MobileBootstrapClient);
  private readonly ids = inject(TEAT_MOBILE_ID);
  private readonly router = inject(Router);
  private readonly homologationShift = inject(TEAT_MOBILE_HOMOLOGATION_SHIFT, {
    optional: true,
  });
  private idempotencyKey?: string;
  readonly screenId = 'open-shift';
  readonly contract = mobilePageContract(this.screenId);
  readonly schema = this.contract.schemaId;
  readonly client = this.contract.clientId;
  readonly load = () => this.runtime.load(this.contract);
  readonly integration = this.load();
  readonly title = this.i18n.translate('teat.screens.open-shift.title');
  readonly unitLabel = this.i18n.translate('teat.screens.shift-context.title');
  readonly startedAtLabel = this.i18n.translate('teat.common.details');
  readonly confirmLabel = this.i18n.translate('teat.common.confirm');
  readonly status = signal(this.i18n.translate('teat.common.loading'));
  readonly operationalUnits = () => {
    if (this.homologationShift !== null)
      return [
        {
          id: 'homologation-demo-unit',
          label: this.i18n.translate('teat.forms.homologationShift.unit'),
        },
      ];
    const units = this.bootstrap.snapshot()?.catalog.operationalUnits ?? [];
    return units.flatMap((value) => {
      if (typeof value !== 'object' || value === null) return [];
      const record = value as Readonly<Record<string, unknown>>;
      if (typeof record['id'] !== 'string' || record['id'].trim() === '')
        return [];
      const label = record['label'] ?? record['name'] ?? record['id'];
      return [{ id: record['id'], label: String(label) }];
    });
  };

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    const unitControl = form.elements.namedItem('operational_unit_id');
    const startedAtControl = form.elements.namedItem('started_at');
    const operationalUnitId =
      unitControl instanceof HTMLSelectElement ||
      unitControl instanceof HTMLInputElement
        ? unitControl.value
        : '';
    const startedAtValue =
      startedAtControl instanceof HTMLInputElement
        ? startedAtControl.value
        : '';
    const startedAtTimestamp = Date.parse(startedAtValue);
    if (
      !this.operationalUnits().some((unit) => unit.id === operationalUnitId) ||
      !Number.isFinite(startedAtTimestamp)
    ) {
      this.status.set(this.i18n.translate('teat.errors.validation_failed'));
      return;
    }
    if (this.homologationShift !== null) {
      try {
        this.homologationShift.openShift();
        this.status.set(
          this.i18n.translate('teat.forms.homologationShift.opened'),
        );
        await this.router.navigateByUrl('/home');
      } catch {
        this.status.set(this.i18n.translate('teat.errors.validation_failed'));
      }
      return;
    }
    const snapshot = this.bootstrap.snapshot();
    if (snapshot === undefined) {
      this.status.set(this.i18n.translate('teat.errors.validation_failed'));
      return;
    }
    this.idempotencyKey ??= this.ids.uuid('open-shift');
    try {
      await this.apiClient.openShift(
        {
          device_id: snapshot.context.device.id,
          app_version: snapshot.context.device.appVersion,
          operational_unit_id: operationalUnitId,
          started_at: new Date(startedAtTimestamp).toISOString(),
        },
        snapshot.context.device.id,
        { 'Idempotency-Key': this.idempotencyKey },
      );
      const state = await this.coordinator.start();
      if (
        state.status !== 'ready' ||
        state.bootstrap.context.activeShift?.status !== 'open' ||
        state.bootstrap.numberingReservations.length === 0
      ) {
        throw new Error('post-shift-bootstrap-not-ready');
      }
      await this.router.navigateByUrl('/home');
    } catch {
      this.status.set(this.i18n.translate('teat.errors.validation_failed'));
    }
  }
}
