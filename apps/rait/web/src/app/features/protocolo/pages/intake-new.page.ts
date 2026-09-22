// T-17 Novo protocolo físico (ficha IU-RAIT-020; contrato CTG-0002b §6.1 linha 19; [UC-RAIT-002]):
// formulário `intake-fisico` (spec §9: canal, data do marco, placa + nº do AIT, requerente —
// nome, CPF/CNPJ, endereço —, assinatura presente, documentos; CPF/CNPJ, "um AIT" e "data ≤
// hoje" ficam no schema zod do CTG-0002c) em `NonNullableFormBuilder` com `Validators.required`
// e erro inline com `aria-describedby` (guia §3.7); `DocumentUploader` do requerente; ação
// `rait-case:protocol` sob `*stynxHasPermission` (M4) com confirmação `confirm.protocol` (guia
// §3.3) → `facade.protocol` (M8). `state.duplicate` é o erro do servidor
// `RAIT.INTAKE_DUPLICATE_INSTANCE` (§4.4) — não é regra local.
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
import { StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { ProtocolFacade } from '../../../data/facades/protocol.facade';
import {
  RAIT_COMMUNICATION_CHANNELS,
  permissionKeyOf,
  type CreateRaitCaseDto,
  type RaitCommunicationChannel,
} from '../../../data/models';
import {
  DocumentUploaderComponent,
  type DocumentUploadRequest,
} from '../../../shared/document-uploader.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  CONFIRM_TITLE_KEY,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';

const TITLE_KEY = 'rait.screens.protocolo-novo.title';
const INTRO_KEY = 'rait.screens.protocolo-novo.intro';
const CMD_PROTOCOL_KEY = 'rait.screens.protocolo-novo.cmd.protocol';
const CONFIRM_PROTOCOL_KEY = 'rait.screens.protocolo-novo.confirm.protocol';
const FIELD_CHANNEL_KEY = 'rait.screens.protocolo-novo.field.channel';
const FIELD_MARK_KEY = 'rait.screens.protocolo-novo.field.marco';
const FIELD_AIT_KEY = 'rait.screens.protocolo-novo.field.ait';
/** Erro do servidor `RAIT.INTAKE_DUPLICATE_INSTANCE` (catálogo §3): apresentado pelo banner. */
export const DUPLICATE_STATE_KEY =
  'rait.screens.protocolo-novo.state.duplicate';
const CHANNEL_KEY_PREFIX = 'rait.channel.';
/** Rótulos de campo sem chave própria na ficha 020 (placa, nº do AIT, nome, documento, endereço,
 * assinatura): nome do campo do contrato, como os cabeçalhos de tabela (OD-R12-028, precedente do
 * par 1) — nenhum texto inventado; o grupo do requerente usa a chave do papel. */
const APPLICANT_KEY = 'rait.common.party_requerente';
const DOCUMENTS_KEY = 'rait.common.originRequester';
/** Tipos de documento do requerente: do formulário do CTG-0002c (nenhum inventado aqui). */
const APPLICANT_KINDS: readonly string[] = [];
const ERROR_ID_PREFIX = 'rait-intake-error-';

@Component({
  selector: 'rait-intake-new-page',
  imports: [
    ReactiveFormsModule,
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    DocumentUploaderComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.command.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="rait-intake__field">
        <label for="rait-intake-channel">{{
          fieldChannelKey | stynxTranslate
        }}</label>
        <select
          id="rait-intake-channel"
          formControlName="channel"
          [attr.aria-invalid]="invalid('channel') ? 'true' : null"
          [attr.aria-describedby]="
            invalid('channel') ? errorId('channel') : null
          "
        >
          <option value=""></option>
          @for (channel of channels; track channel) {
            <option [value]="channel">
              {{ channelKeyPrefix + channel | stynxTranslate }}
            </option>
          }
        </select>
        @if (invalid('channel')) {
          <p [id]="errorId('channel')" role="alert">
            {{ fieldChannelKey | stynxTranslate }}
          </p>
        }
      </div>

      <div class="rait-intake__field">
        <label for="rait-intake-mark">{{
          fieldMarkKey | stynxTranslate
        }}</label>
        <input
          id="rait-intake-mark"
          type="date"
          formControlName="markOn"
          [attr.aria-invalid]="invalid('markOn') ? 'true' : null"
          [attr.aria-describedby]="invalid('markOn') ? errorId('markOn') : null"
        />
        @if (invalid('markOn')) {
          <p [id]="errorId('markOn')" role="alert">
            {{ fieldMarkKey | stynxTranslate }}
          </p>
        }
      </div>

      <fieldset>
        <legend>{{ fieldAitKey | stynxTranslate }}</legend>
        <label for="rait-intake-plate">plate</label>
        <input
          id="rait-intake-plate"
          type="text"
          formControlName="plate"
          [attr.aria-invalid]="invalid('plate') ? 'true' : null"
          [attr.aria-describedby]="invalid('plate') ? errorId('plate') : null"
        />
        @if (invalid('plate')) {
          <p [id]="errorId('plate')" role="alert">
            {{ fieldAitKey | stynxTranslate }}
          </p>
        }
        <label for="rait-intake-ait">ait_number</label>
        <input
          id="rait-intake-ait"
          type="text"
          formControlName="aitNumber"
          [attr.aria-invalid]="invalid('aitNumber') ? 'true' : null"
          [attr.aria-describedby]="
            invalid('aitNumber') ? errorId('aitNumber') : null
          "
        />
        @if (invalid('aitNumber')) {
          <p [id]="errorId('aitNumber')" role="alert">
            {{ fieldAitKey | stynxTranslate }}
          </p>
        }
      </fieldset>

      <fieldset formGroupName="applicant">
        <legend>{{ applicantKey | stynxTranslate }}</legend>
        <label for="rait-intake-name">person_name</label>
        <input
          id="rait-intake-name"
          type="text"
          formControlName="name"
          [attr.aria-invalid]="invalid('applicant.name') ? 'true' : null"
          [attr.aria-describedby]="
            invalid('applicant.name') ? errorId('applicant-name') : null
          "
        />
        @if (invalid('applicant.name')) {
          <p [id]="errorId('applicant-name')" role="alert">
            {{ applicantKey | stynxTranslate }}
          </p>
        }
        <label for="rait-intake-document">document_number</label>
        <input
          id="rait-intake-document"
          type="text"
          formControlName="document"
          [attr.aria-invalid]="invalid('applicant.document') ? 'true' : null"
          [attr.aria-describedby]="
            invalid('applicant.document') ? errorId('applicant-document') : null
          "
        />
        @if (invalid('applicant.document')) {
          <p [id]="errorId('applicant-document')" role="alert">
            {{ applicantKey | stynxTranslate }}
          </p>
        }
        <label for="rait-intake-address">address</label>
        <input
          id="rait-intake-address"
          type="text"
          formControlName="address"
          [attr.aria-invalid]="invalid('applicant.address') ? 'true' : null"
          [attr.aria-describedby]="
            invalid('applicant.address') ? errorId('applicant-address') : null
          "
        />
        @if (invalid('applicant.address')) {
          <p [id]="errorId('applicant-address')" role="alert">
            {{ applicantKey | stynxTranslate }}
          </p>
        }
      </fieldset>

      <div class="rait-intake__field">
        <label>
          <input
            type="checkbox"
            formControlName="signaturePresent"
            [attr.aria-invalid]="invalid('signaturePresent') ? 'true' : null"
            [attr.aria-describedby]="
              invalid('signaturePresent') ? errorId('signature') : null
            "
          />
          signature_present
        </label>
        @if (invalid('signaturePresent')) {
          <p [id]="errorId('signature')" role="alert">
            {{ 'rait.errors.intake_signature_missing' | stynxTranslate }}
          </p>
        }
      </div>

      <section [attr.aria-label]="documentsKey | stynxTranslate">
        <h2>{{ documentsKey | stynxTranslate }}</h2>
        <rait-document-uploader
          origin="requerente"
          [kinds]="applicantKinds"
          (submitted)="addDocument($event)"
        />
        @if (documents().length > 0) {
          <ul data-documents>
            @for (document of documents(); track $index) {
              <li>{{ document.file.name }}</li>
            }
          </ul>
        }
      </section>

      <button
        *stynxHasPermission="protocolPermission"
        type="button"
        data-action="protocol"
        (click)="requestProtocol()"
      >
        {{ cmdProtocolKey | stynxTranslate }}
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
export class IntakeNewPageComponent {
  readonly facade = inject(ProtocolFacade);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly cmdProtocolKey = CMD_PROTOCOL_KEY;
  readonly fieldChannelKey = FIELD_CHANNEL_KEY;
  readonly fieldMarkKey = FIELD_MARK_KEY;
  readonly fieldAitKey = FIELD_AIT_KEY;
  readonly applicantKey = APPLICANT_KEY;
  readonly documentsKey = DOCUMENTS_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly channelKeyPrefix = CHANNEL_KEY_PREFIX;
  readonly channels = RAIT_COMMUNICATION_CHANNELS;
  readonly applicantKinds = APPLICANT_KINDS;
  readonly protocolPermission = permissionKeyOf('rait-case:protocol');
  readonly confirm = createConfirmQueue();
  readonly documents = signal<readonly DocumentUploadRequest[]>([]);
  private readonly attempted = signal(false);

  /** Spec §9 "Intake físico": todos obrigatórios; `documents[]` pelo uploader. */
  readonly form = this.fb.group({
    channel: this.fb.control<'' | RaitCommunicationChannel>(
      '',
      Validators.required,
    ),
    markOn: this.fb.control('', Validators.required),
    plate: this.fb.control('', Validators.required),
    aitNumber: this.fb.control('', Validators.required),
    applicant: this.fb.group({
      name: this.fb.control('', Validators.required),
      document: this.fb.control('', Validators.required),
      address: this.fb.control('', Validators.required),
    }),
    signaturePresent: this.fb.control(false, Validators.requiredTrue),
  });

  readonly attemptedSubmit = computed(() => this.attempted());

  constructor() {
    afterRenderEffect(() => {
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  invalid(path: string): boolean {
    const control = this.form.get(path);
    return this.attemptedSubmit() && control !== null && control.invalid;
  }

  errorId(field: string): string {
    return `${ERROR_ID_PREFIX}${field}`;
  }

  addDocument(request: DocumentUploadRequest): void {
    this.documents.update((current) => [...current, request]);
  }

  /** `submit` do formulário: inválido → erros inline, nenhum comando (guia §3.7). */
  submit(): void {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.documents().length === 0) return;
    this.requestProtocol();
  }

  /** Confirmação `confirm.protocol` (guia §3.3) → `rait-case:protocol` com os campos preenchidos. */
  requestProtocol(): void {
    const value = this.form.getRawValue();
    this.confirm.request({
      action: 'protocol',
      confirmKey: CONFIRM_PROTOCOL_KEY,
      labelKey: CMD_PROTOCOL_KEY,
      run: () =>
        this.facade.protocol(
          provisionalBody<CreateRaitCaseDto>({
            ...(value.channel !== '' ? { intake_channel: value.channel } : {}),
          }),
        ),
    });
  }
}
