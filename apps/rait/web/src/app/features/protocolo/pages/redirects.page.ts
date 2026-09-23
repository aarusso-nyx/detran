// T-20 Redirecionamentos (ficha IU-RAIT-023; contrato CTG-0002b §6.1 linha 22; [RN-RAIT-122]):
// `ProtocolFacade.loadRedirects(query)` → `redirecionamentos` numa `<stynx-table>` do kit
// (direction, reason, protocol_number, counterpart_agency, redirected_at — a lista não é de
// casos, fixado o primitivo); formulário mínimo (`direction`, `reason`, `counterpartAgency`,
// `targetBody` = `field.target_body`; nome do schema fica para o CTG-0002c) com
// `Validators.required` e erro inline; ação `rait-case:redirect` sob `*stynxHasPermission`
// (chave só de ficha — OD-R12-027) com confirmação `confirm.redirect` → `facade.redirect` (M8).
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  StynxIntlDatePipe,
  StynxPaginationComponent,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { SseService } from '../../../core/sse.service';
import { ProtocolFacade } from '../../../data/facades/protocol.facade';
import {
  permissionKeyOf,
  type CreateRaitRedirectDto,
  type RaitRedirectDirection,
  type RaitRedirectReason,
} from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import { connectListToUrl } from '../../list-url-sync';
import {
  CONFIRM_TITLE_KEY,
  LOADING_KEY,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';

const TITLE_KEY = 'rait.screens.protocolo-redirecionamentos.title';
const INTRO_KEY = 'rait.screens.protocolo-redirecionamentos.intro';
const EMPTY_KEY = 'rait.screens.protocolo-redirecionamentos.empty';
const CMD_REDIRECT_KEY =
  'rait.screens.protocolo-redirecionamentos.cmd.redirect';
const CONFIRM_REDIRECT_KEY =
  'rait.screens.protocolo-redirecionamentos.confirm.redirect';
const FIELD_TARGET_BODY_KEY =
  'rait.screens.protocolo-redirecionamentos.field.target_body';
/** Tokens do contrato `RaitRedirect['direction'|'reason']` (sem chave de rótulo no catálogo:
 * o token fica em `value`/`data-token`; o texto visível é o campo do contrato — OD-R12-028). */
const DIRECTIONS: readonly RaitRedirectDirection[] = ['entrada', 'saida'];
const REASONS: readonly RaitRedirectReason[] = [
  'outro_orgao_autuador',
  'orgao_incompetente',
];
const ERROR_ID_PREFIX = 'rait-redirect-error-';

interface RedirectRow extends Record<string, unknown> {
  readonly id: string;
  readonly direction: string;
  readonly reason: string;
  readonly protocol_number: string;
  readonly counterpart_agency: string;
  readonly redirected_at: string;
}

const COLUMNS: readonly TableColumn<RedirectRow>[] = [
  { key: 'direction', label: 'direction' },
  { key: 'reason', label: 'reason' },
  { key: 'protocol_number', label: 'protocol_number' },
  { key: 'counterpart_agency', label: 'counterpart_agency' },
  { key: 'redirected_at', label: 'redirected_at' },
];

@Component({
  selector: 'rait-redirects-page',
  imports: [
    ReactiveFormsModule,
    StynxTranslatePipe,
    StynxTableComponent,
    StynxPaginationComponent,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    RaitErrorBannerComponent,
  ],
  providers: [...provideRaitI18nFallback(), StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.redirecionamentos.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="facade.redirecionamentos.status()"
      [error]="facade.redirecionamentos.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (rows().length > 0) {
      <stynx-table
        [columns]="columns"
        [rows]="rows()"
        [rowTrackBy]="trackRow"
      />
    }
    @if (facade.redirecionamentos.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    <form
      *stynxHasPermission="redirectPermission"
      [formGroup]="form"
      (ngSubmit)="submit()"
      novalidate
    >
      <label for="rait-redirect-direction">direction</label>
      <select
        id="rait-redirect-direction"
        formControlName="direction"
        [attr.aria-invalid]="invalid('direction') ? 'true' : null"
        [attr.aria-describedby]="
          invalid('direction') ? errorId('direction') : null
        "
      >
        <option value=""></option>
        @for (direction of directions; track direction) {
          <option [value]="direction" [attr.data-token]="direction">
            {{ direction }}
          </option>
        }
      </select>
      @if (invalid('direction')) {
        <p [id]="errorId('direction')" role="alert">direction</p>
      }

      <label for="rait-redirect-reason">reason</label>
      <select
        id="rait-redirect-reason"
        formControlName="reason"
        [attr.aria-invalid]="invalid('reason') ? 'true' : null"
        [attr.aria-describedby]="invalid('reason') ? errorId('reason') : null"
      >
        <option value=""></option>
        @for (reason of reasons; track reason) {
          <option [value]="reason" [attr.data-token]="reason">
            {{ reason }}
          </option>
        }
      </select>
      @if (invalid('reason')) {
        <p [id]="errorId('reason')" role="alert">reason</p>
      }

      <label for="rait-redirect-agency">counterpart_agency</label>
      <input
        id="rait-redirect-agency"
        type="text"
        formControlName="counterpartAgency"
        [attr.aria-invalid]="invalid('counterpartAgency') ? 'true' : null"
        [attr.aria-describedby]="
          invalid('counterpartAgency') ? errorId('counterpartAgency') : null
        "
      />
      @if (invalid('counterpartAgency')) {
        <p [id]="errorId('counterpartAgency')" role="alert">
          counterpart_agency
        </p>
      }

      <label for="rait-redirect-target">{{
        fieldTargetBodyKey | stynxTranslate
      }}</label>
      <input
        id="rait-redirect-target"
        type="text"
        formControlName="targetBody"
        [attr.aria-invalid]="invalid('targetBody') ? 'true' : null"
        [attr.aria-describedby]="
          invalid('targetBody') ? errorId('targetBody') : null
        "
      />
      @if (invalid('targetBody')) {
        <p [id]="errorId('targetBody')" role="alert">
          {{ fieldTargetBodyKey | stynxTranslate }}
        </p>
      }

      <button
        type="button"
        data-action="redirect"
        [disabled]="offline()"
        (click)="requestRedirect()"
      >
        {{ cmdRedirectKey | stynxTranslate }}
      </button>
    </form>

    <stynx-confirm-dialog
      [open]="confirm.open()"
      [title]="confirmTitleKey | stynxTranslate"
      [message]="confirm.pending()?.confirmKey ?? '' | stynxTranslate"
      [confirmLabel]="confirm.pending()?.labelKey ?? '' | stynxTranslate"
      (confirm)="confirm.confirm()"
      (dismissed)="confirm.dismiss()"
    />
  `,
})
export class RedirectsPageComponent {
  readonly facade = inject(ProtocolFacade);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly sse = inject(SseService);
  private readonly datePipe = inject(StynxIntlDatePipe);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdRedirectKey = CMD_REDIRECT_KEY;
  readonly fieldTargetBodyKey = FIELD_TARGET_BODY_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly directions = DIRECTIONS;
  readonly reasons = REASONS;
  readonly columns = COLUMNS as TableColumn<RedirectRow>[];
  readonly trackRow = (row: RedirectRow): string => row.id;
  readonly redirectPermission = permissionKeyOf('rait-case:redirect');
  readonly confirm = createConfirmQueue();
  private readonly attempted = signal(false);

  readonly form = this.fb.group({
    direction: this.fb.control<'' | RaitRedirectDirection>(
      '',
      Validators.required,
    ),
    reason: this.fb.control<'' | RaitRedirectReason>('', Validators.required),
    counterpartAgency: this.fb.control('', Validators.required),
    targetBody: this.fb.control('', Validators.required),
  });

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadRedirects(query),
  });
  readonly offline = computed(
    () => this.facade.redirecionamentos.status() === 'offline',
  );
  readonly rows = computed<RedirectRow[]>(() =>
    this.facade.redirecionamentos.items().map((item) => ({
      id: item.id,
      direction: item.direction,
      reason: item.reason,
      protocol_number: item.protocol_number,
      counterpart_agency: item.counterpart_agency,
      redirected_at: this.datePipe.transform(item.redirected_at),
    })),
  );

  constructor() {
    this.sse.connect();
    afterRenderEffect(() => {
      const status = this.facade.redirecionamentos.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  invalid(field: keyof RedirectsPageComponent['form']['controls']): boolean {
    return this.attempted() && this.form.controls[field].invalid;
  }

  errorId(field: string): string {
    return `${ERROR_ID_PREFIX}${field}`;
  }

  submit(): void {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.requestRedirect();
  }

  requestRedirect(): void {
    const value = this.form.getRawValue();
    this.confirm.request({
      action: 'redirect',
      confirmKey: CONFIRM_REDIRECT_KEY,
      labelKey: CMD_REDIRECT_KEY,
      run: () =>
        this.facade.redirect(
          provisionalBody<CreateRaitRedirectDto>({
            ...(value.direction !== '' ? { direction: value.direction } : {}),
            ...(value.reason !== '' ? { reason: value.reason } : {}),
            ...(value.counterpartAgency.length > 0
              ? { counterpart_agency: value.counterpartAgency }
              : {}),
          }),
        ),
    });
  }

  reload(): void {
    void this.facade.loadRedirects(this.list.query());
  }
}
