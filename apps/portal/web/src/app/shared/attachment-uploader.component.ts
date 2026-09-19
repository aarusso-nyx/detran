// AttachmentUploader (contrato CTG-0003a §5.6; [UC-PORTAL-001] AC-3/3a; ADR-0018; [RN-PORTAL-104],
// [RN-PORTAL-106], [RN-PORTAL-107] regra 3). Por arquivo: pré-checagem de forma (`accept`,
// `maxBytes` — só orientam; o servidor prevalece) → SHA-256 no cliente → intenção de upload →
// `PUT` na URL assinada (fetch puro, sem bearer) → `complete` → `done`. Erros por arquivo
// (`ATTACHMENT_INVALID`, `ATTACHMENT_AGENCY_DOCUMENT`) rejeitam SÓ aquele arquivo;
// `422 SERVICE_UNAVAILABLE` torna o componente inteiro indisponível, com canal alternativo, sem
// retry automático nem id simulado (M15). O checklist é o `requirements[]` do servidor — não
// existe lista de tipos de anexo no cliente. Anexo assinado presume-se autêntico: nenhum campo de
// reconhecimento de firma ([RN-PORTAL-104]).
import {
  ChangeDetectionStrategy,
  Component,
  type Signal,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { PortalErrorBannerComponent } from '../core/error-banner.component';
import {
  classifyError,
  presentError,
  type ErrorPresentation,
} from '../core/error-boundary';
import { sha256Hex } from '../data/idempotency-key';
import { PortalClient } from '../data/portal.client';

export type AttachmentStatus =
  'hashing' | 'requesting' | 'uploading' | 'completing' | 'done' | 'rejected';

export interface AttachmentEntry {
  readonly localId: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly sha256: string | null;
  readonly attachmentId: string | null;
  readonly status: AttachmentStatus;
  readonly error: ErrorPresentation | null;
}

const ATTACHMENT_INVALID = 'PORTAL.ATTACHMENT_INVALID';
const SERVICE_UNAVAILABLE = 'PORTAL.SERVICE_UNAVAILABLE';

@Component({
  selector: 'portal-attachment-uploader',
  imports: [StynxTranslatePipe, PortalErrorBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-request-id]': 'requestId()' },
  template: `
    <div class="portal-attachment-uploader">
      @if (checklist().length > 0) {
        <ul class="portal-attachment-checklist" data-checklist>
          @for (item of checklist(); track $index) {
            <li>{{ item }}</li>
          }
        </ul>
      }
      <p [id]="hintId()" class="portal-attachment-hint">
        {{ hintKey() | stynxTranslate }}
      </p>
      @if (unavailable(); as failure) {
        <portal-error-banner [error]="failure" />
      } @else {
        @if (labelKey(); as key) {
          <label [for]="inputId()">{{ key | stynxTranslate }}</label>
        }
        <input
          type="file"
          multiple
          [id]="inputId()"
          [accept]="acceptAttribute()"
          [attr.aria-labelledby]="labelKey() ? null : hintId()"
          [attr.aria-describedby]="hintId()"
          [disabled]="disabled()"
          (change)="onFilesSelected($event)"
        />
      }
      @if (entries().length > 0) {
        <ul class="portal-attachment-entries">
          @for (entry of entries(); track entry.localId) {
            <li
              [attr.data-status]="entry.status"
              [attr.data-attachment-id]="entry.attachmentId"
            >
              <span>{{ entry.filename }}</span>
              @if (entry.error; as error) {
                <portal-error-banner [error]="error" />
              }
              @if (entry.status === 'done' && entry.attachmentId) {
                <button
                  type="button"
                  data-remove
                  [disabled]="disabled()"
                  (click)="remove(entry)"
                >
                  {{ 'portal.common.action.remove' | stynxTranslate }}
                </button>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class AttachmentUploaderComponent {
  private readonly client = inject(PortalClient);
  private readonly entriesState = signal<readonly AttachmentEntry[]>([]);
  private readonly unavailableState = signal<ErrorPresentation | null>(null);
  private sequence = 0;

  readonly requestId = input.required<string>();
  /** `forms/attachments.ts` `ATTACHMENT_ACCEPT`. */
  readonly accept = input.required<readonly string[]>();
  /** `ATTACHMENT_MAX_BYTES` (OD-P66). */
  readonly maxBytes = input.required<number>();
  /** `requirements[]` do servidor — nunca constante do cliente. */
  readonly checklist = input<readonly string[]>([]);
  /** `portal.forms.<form>.anexos_hint` | `.hint` | `.anexos`. */
  readonly hintKey = input.required<string>();
  /**
   * Rótulo do campo de arquivo (nome acessível), chave da tela chamadora (ex.:
   * `portal.forms.resposta_diligencia.anexos`); sem ela, o nome vem da própria dica
   * (`aria-labelledby` = `hintId`).
   */
  readonly labelKey = input<string | null>(null);
  readonly disabled = input(false);
  readonly attachmentIds = model<readonly string[]>([]);
  readonly entries: Signal<readonly AttachmentEntry[]> =
    this.entriesState.asReadonly();
  /** `422 SERVICE_UNAVAILABLE` do storage. */
  readonly unavailable: Signal<ErrorPresentation | null> =
    this.unavailableState.asReadonly();
  readonly attached = output<AttachmentEntry>();
  /** `attachmentId`. */
  readonly removed = output<string>();

  readonly acceptAttribute = computed(() => this.accept().join(','));
  readonly hintId = computed(
    () => `portal-attachment-hint-${this.requestId()}`,
  );
  readonly inputId = computed(
    () => `portal-attachment-input-${this.requestId()}`,
  );

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    for (const file of files) void this.add(file);
    input.value = '';
  }

  remove(entry: AttachmentEntry): void {
    const attachmentId = entry.attachmentId;
    this.entriesState.update((entries) =>
      entries.filter((item) => item.localId !== entry.localId),
    );
    if (attachmentId) {
      this.attachmentIds.update((ids) =>
        ids.filter((id) => id !== attachmentId),
      );
      this.removed.emit(attachmentId);
    }
  }

  private async add(file: File): Promise<void> {
    if (this.disabled() || this.unavailableState()) return;
    this.sequence += 1;
    const localId = `${this.requestId()}-${this.sequence}`;
    let entry: AttachmentEntry = {
      localId,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      sha256: null,
      attachmentId: null,
      status: 'hashing',
      error: null,
    };
    this.upsert(entry);
    const rejection = this.shapeRejection(file);
    if (rejection) {
      this.upsert({ ...entry, status: 'rejected', error: rejection });
      return;
    }
    try {
      const sha256 = await sha256Hex(await file.arrayBuffer());
      entry = { ...entry, sha256, status: 'requesting' };
      this.upsert(entry);
      const intent = await this.client.requestAttachmentUpload(
        this.requestId(),
        {
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          sha256,
        },
      );
      entry = {
        ...entry,
        attachmentId: intent.body.attachmentId,
        status: 'uploading',
      };
      this.upsert(entry);
      await this.client.uploadToSignedUrl(intent.body, file);
      entry = { ...entry, status: 'completing' };
      this.upsert(entry);
      const completed = await this.client.completeAttachment(
        this.requestId(),
        intent.body.attachmentId,
      );
      entry = {
        ...entry,
        attachmentId: completed.body.attachmentId,
        sha256: completed.body.sha256 || sha256,
        status: 'done',
      };
      this.upsert(entry);
      this.attachmentIds.update((ids) =>
        ids.includes(entry.attachmentId as string)
          ? ids
          : [...ids, entry.attachmentId as string],
      );
      this.attached.emit(entry);
    } catch (error: unknown) {
      this.fail(entry, error);
    }
  }

  /** Pré-checagem de forma (accept/maxBytes): rejeição local sem requisição. */
  private shapeRejection(file: File): ErrorPresentation | null {
    const accepted = this.accept().includes(file.type);
    const withinSize = file.size <= this.maxBytes();
    if (accepted && withinSize) return null;
    return presentError({
      status: 400,
      error: {
        code: ATTACHMENT_INVALID,
        status: 400,
        message: ATTACHMENT_INVALID,
        context: { allowed: [...this.accept()], maxBytes: this.maxBytes() },
      },
    });
  }

  /** Falha do servidor: por arquivo (rejeita só ele) ou do serviço inteiro (indisponível). */
  private fail(entry: AttachmentEntry, error: unknown): void {
    const presentation = presentError(error);
    if (classifyError(error).code === SERVICE_UNAVAILABLE) {
      this.unavailableState.set(presentation);
      this.entriesState.update((entries) =>
        entries.filter((item) => item.localId !== entry.localId),
      );
      return;
    }
    this.upsert({ ...entry, status: 'rejected', error: presentation });
  }

  private upsert(entry: AttachmentEntry): void {
    this.entriesState.update((entries) => {
      const index = entries.findIndex((item) => item.localId === entry.localId);
      if (index < 0) return [...entries, entry];
      const next = entries.slice();
      next[index] = entry;
      return next;
    });
  }
}
