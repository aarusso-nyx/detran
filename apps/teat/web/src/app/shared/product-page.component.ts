import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  PendingTasks,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';

import { ErrorBoundary } from '../core/error-boundary/error-boundary.service.js';
import { SseService } from '../core/sse.service.js';
import { AitClient, type AitAcceptResponse } from '../data/ait.client.js';
import { WebClientRegistry } from '../data/web-client.registry.js';

interface RenderedError {
  readonly code: string;
  readonly messageKey: string;
}

interface AitRecord {
  readonly id: string;
  readonly version: number;
  readonly current_status: string;
  readonly ait_number?: string;
  readonly content_hash?: string;
  readonly system_signature_ref?: string;
  readonly receipt_protocol?: string;
}

@Component({
  selector: 'teat-product-page',
  standalone: true,
  template: `
    <main>
      <h1>{{ translate(titleKey) }}</h1>
      @if (isLogin) {
        <form (submit)="login($event)">
          <button type="submit">
            {{ translate('teat.screens.login.title') }}
          </button>
        </form>
        <p role="alert">
          {{ error()?.code ?? '' }}
          {{ error() === undefined ? '' : translate(error()!.messageKey) }}
        </p>
      } @else {
        <p role="status">
          {{ content() }}
          {{ error()?.code ?? '' }}
          {{ error() === undefined ? '' : translate(error()!.messageKey) }}
        </p>
        @if (isAitValidation) {
          <fieldset>
            <legend>
              {{ translate('teat.screens.ait-validation.title') }}
            </legend>
            @for (record of aitRecords(); track record.id) {
              <label>
                <input
                  type="radio"
                  name="ait-selection"
                  [value]="record.id"
                  [checked]="selectedAitId() === record.id"
                  (change)="selectAit(record.id)"
                />
                {{ record.ait_number }}
              </label>
            }
          </fieldset>
        }
        @if (selectedAit(); as record) {
          <dl>
            <dt>{{ translate('teat.screens.ait-detail.title') }}</dt>
            <dd>{{ record.ait_number }}</dd>
            <dt>{{ translate('teat.states.validando') }}</dt>
            <dd>{{ record.current_status }}</dd>
            <dt>{{ translate('teat.common.details') }}</dt>
            <dd>{{ record.version }}</dd>
            <dt>{{ translate('teat.legal.contentHash') }}</dt>
            <dd>{{ record.content_hash }}</dd>
            <dt>{{ translate('teat.forms.signatureOutcome') }}</dt>
            <dd>{{ record.system_signature_ref }}</dd>
            <dt>{{ translate('teat.sync.receipt') }}</dt>
            <dd>{{ record.receipt_protocol }}</dd>
          </dl>
        }
        @if (canAcceptSelectedAit()) {
          <button type="button" (click)="acceptAit()">
            {{ translate('teat.common.confirm') }}
          </button>
        }
        @if (endpoint !== undefined) {
          <button type="button" (click)="load()">
            {{ translate('teat.sync.resend') }}
          </button>
        }
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(StynxSessionService);
  private readonly tenant = inject(TenantContextService);
  private readonly clients = inject(WebClientRegistry);
  private readonly aitClient = inject(AitClient);
  private readonly boundary = inject(ErrorBoundary);
  private readonly sse = inject(SseService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(StynxI18nService);
  private readonly pendingTasks = inject(PendingTasks);

  readonly titleKey = String(
    this.route.snapshot.data['titleKey'] ?? 'teat.navigation.error',
  );
  readonly endpoint = this.route.snapshot.data['endpoint'] as
    string | undefined;
  readonly runtimeClient = this.route.snapshot.data['runtimeClient'] as
    string | undefined;
  readonly isLogin = this.route.snapshot.routeConfig?.path === 'login';
  readonly isAitValidation =
    this.route.snapshot.routeConfig?.path === 'ait-validation';
  readonly content = signal(this.translate('teat.a11y.loading'));
  readonly aitRecords = signal<readonly AitRecord[]>([]);
  readonly selectedAitId = signal<string | undefined>(undefined);
  readonly selectedAit = computed(() =>
    this.aitRecords().find((record) => record.id === this.selectedAitId()),
  );
  readonly canAcceptSelectedAit = computed(() => {
    const record = this.selectedAit();
    return (
      record !== undefined &&
      ['RECEBIDO', 'VALIDANDO', 'CORRIGIDO'].includes(record.current_status) &&
      sessionHasRole(this.session, 'traffic-authority')
    );
  });
  readonly error = signal<RenderedError | undefined>(undefined);

  constructor() {
    if (this.isLogin) {
      this.observeLoginCallback();
      return;
    }
    if (this.endpoint !== undefined) this.load();
    if (this.route.snapshot.data['sse'] === true) this.observeStream();
  }

  translate(key: string): string {
    return this.i18n.translate(key);
  }

  login(event: Event): void {
    event.preventDefault();
    this.session.login();
  }

  load(): void {
    if (this.endpoint === undefined || this.runtimeClient === undefined) return;
    this.error.set(undefined);
    this.clients.query(this.runtimeClient, this.endpoint).subscribe({
      next: (value) => this.presentLoadedValue(value),
      error: (failure: unknown) => this.presentError(failure),
    });
  }

  acceptAit(): void {
    const record = this.selectedAit();
    const claims = this.session.state().claims;
    const userRef = claims?.['sub'];
    if (
      record === undefined ||
      typeof userRef !== 'string' ||
      userRef.length === 0
    ) {
      this.presentError({ code: 'TEAT.AUTH_REQUIRED' });
      return;
    }
    this.aitClient.accept(record.id, record.version, userRef).subscribe({
      next: (result) => this.mergeAcceptedAit(result),
      error: (failure: unknown) => this.presentError(failure),
    });
  }

  selectAit(id: string): void {
    if (this.aitRecords().some((record) => record.id === id)) {
      this.selectedAitId.set(id);
    }
  }

  private observeLoginCallback(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parameters) => {
        if (!parameters.has('code') || !parameters.has('state')) return;
        const origin =
          typeof location === 'undefined'
            ? 'http://localhost'
            : location.origin;
        void this.pendingTasks.run(() =>
          this.completeLogin(`${origin}${this.router.url}`),
        );
      });
  }

  private async completeLogin(url: string): Promise<void> {
    try {
      const state = await this.session.completeLogin(url);
      const tenantId = this.tenant.tenantId();
      if (
        !this.session.active() ||
        typeof tenantId !== 'string' ||
        tenantId.length === 0 ||
        state.tenantId !== tenantId
      ) {
        throw { code: 'TEAT.AUTH_REQUIRED' };
      }
      await this.router.navigateByUrl('/ux/web/dashboard-home');
    } catch (failure: unknown) {
      this.presentError(failure);
    }
  }

  private observeStream(): void {
    this.sse
      .stream({
        topics: this.route.snapshot.data['sseTopics'] as
          readonly string[] | undefined,
        fallbackUrl: this.endpoint,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => {
          if (isEventEnvelope(value)) {
            this.load();
          } else {
            this.presentLoadedValue(value);
          }
        },
        error: (failure: unknown) => this.presentError(failure),
      });
  }

  private presentLoadedValue(value: unknown): void {
    if (!this.isAitValidation) {
      this.content.set(renderValue(value));
      return;
    }
    const records = Array.isArray(value) ? value.filter(isAitRecord) : [];
    this.aitRecords.set(records);
    if (
      this.selectedAitId() !== undefined &&
      !records.some((record) => record.id === this.selectedAitId())
    ) {
      this.selectedAitId.set(undefined);
    }
    this.content.set(
      records.length === 0
        ? this.translate('teat.common.empty')
        : renderValue(records),
    );
  }

  private mergeAcceptedAit(result: AitAcceptResponse): void {
    const current = this.selectedAit();
    if (current === undefined || current.id !== result.id) return;
    const updated = { ...current, ...result };
    this.aitRecords.update((records) =>
      records.map((record) => (record.id === updated.id ? updated : record)),
    );
    this.content.set(renderValue(updated));
  }

  private presentError(failure: unknown): void {
    const classified = this.boundary.classify(failure);
    this.error.set(classified);
    this.content.set(this.translate('teat.a11y.actionFailed'));
  }
}

function sessionHasRole(session: StynxSessionService, role: string): boolean {
  const state = session.state();
  const roleAware = session as unknown as Readonly<{
    hasAnyRole?: (roles: readonly string[]) => boolean;
  }>;
  if (roleAware.hasAnyRole !== undefined) return roleAware.hasAnyRole([role]);
  const claims = state.claims;
  const roles = [claims?.['roles'], claims?.['cognito:groups']]
    .filter(Array.isArray)
    .flat();
  return roles.includes(role);
}

function isEventEnvelope(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string'
  );
}

function renderValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(renderValue).join(', ');
  return JSON.stringify(value);
}

function isAitRecord(value: unknown): value is AitRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'version' in value &&
    typeof value.version === 'number' &&
    'current_status' in value &&
    typeof value.current_status === 'string'
  );
}
