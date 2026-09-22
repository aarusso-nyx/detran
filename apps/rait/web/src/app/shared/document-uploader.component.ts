// DocumentUploader (contrato CTG-0002b §5.7; spec §5.2; [RN-RAIT-003]; fichas 009/020/021/024):
// `<form>` com `<select name="kind">` (tipos informados pela página — `RaitDocument['kind']` é
// string livre), `<input type="file">`, `<input type="checkbox" name="digitisedFromPaper">` e o
// botão `rait.common.attach`. NENHUM `kind` é marcado obrigatório pelo componente ([RN-RAIT-003]:
// nunca exige documento do órgão; obrigatoriedade é do formulário/CTG-0002c). Sem arquivo → erro
// inline (`aria-describedby`), sem `submitted`. Não devolve `RaitDocument`: o anexo é comando M8
// (`rait-document:attach-official` / `rait-case:protocol`) e o upload por URL assinada é
// OD-R12-023 — o uploader só emite o pedido (`DocumentUploadRequest`).
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import type { RaitDocumentOrigin } from '../data/models';

export interface DocumentUploadRequest {
  readonly kind: string;
  readonly origin: RaitDocumentOrigin;
  readonly digitisedFromPaper: boolean;
  readonly file: File;
}

const KIND_KEY = 'rait.common.documentKind';
const FILE_KEY = 'rait.common.file';
const DIGITISED_KEY = 'rait.common.digitised';
const ATTACH_KEY = 'rait.common.attach';
let nextId = 0;

@Component({
  selector: 'rait-document-uploader',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rait-document-uploader', '[attr.data-origin]': 'origin()' },
  template: `
    <form (submit)="onSubmit($event)" novalidate>
      <div class="rait-document-uploader__field">
        <label [for]="ids.kind">{{ kindKey | stynxTranslate }}</label>
        <select
          [id]="ids.kind"
          name="kind"
          [disabled]="disabled()"
          (change)="onKindChange($event)"
        >
          @for (option of kinds(); track option) {
            <option [value]="option" [selected]="option === kind()">
              {{ option }}
            </option>
          }
        </select>
      </div>
      <div class="rait-document-uploader__field">
        <label [for]="ids.file">{{ fileKey | stynxTranslate }}</label>
        <input
          [id]="ids.file"
          type="file"
          name="file"
          [disabled]="disabled()"
          [attr.aria-invalid]="missingFile() ? 'true' : null"
          [attr.aria-describedby]="missingFile() ? ids.fileError : null"
          (change)="onFileChange($event)"
        />
        @if (missingFile()) {
          <p
            [id]="ids.fileError"
            class="rait-document-uploader__error"
            role="alert"
          >
            {{ fileKey | stynxTranslate }}
          </p>
        }
      </div>
      <div class="rait-document-uploader__field">
        <input
          [id]="ids.digitised"
          type="checkbox"
          name="digitisedFromPaper"
          [checked]="digitisedFromPaper()"
          [disabled]="disabled()"
          (change)="onDigitisedChange($event)"
        />
        <label [for]="ids.digitised">{{ digitisedKey | stynxTranslate }}</label>
      </div>
      <button type="submit" [disabled]="disabled()">
        {{ attachKey | stynxTranslate }}
      </button>
    </form>
  `,
})
export class DocumentUploaderComponent {
  readonly origin = input.required<RaitDocumentOrigin>();
  /** Tipos do formulário chamador (`RaitDocument['kind']` é string livre). */
  readonly kinds = input.required<readonly string[]>();
  readonly disabled = input(false);
  readonly digitisedFromPaperDefault = input(false);
  readonly submitted = output<DocumentUploadRequest>();

  readonly kindKey = KIND_KEY;
  readonly fileKey = FILE_KEY;
  readonly digitisedKey = DIGITISED_KEY;
  readonly attachKey = ATTACH_KEY;

  private readonly instance = (nextId += 1);
  readonly ids = {
    kind: `rait-document-uploader-${this.instance}-kind`,
    file: `rait-document-uploader-${this.instance}-file`,
    fileError: `rait-document-uploader-${this.instance}-file-error`,
    digitised: `rait-document-uploader-${this.instance}-digitised`,
  };

  private readonly selectedKind = signal<string | null>(null);
  private readonly file = signal<File | null>(null);
  private readonly digitised = signal<boolean | null>(null);
  private readonly attempted = signal(false);

  readonly kind = computed(() => this.selectedKind() ?? this.kinds()[0] ?? '');
  readonly digitisedFromPaper = computed(
    () => this.digitised() ?? this.digitisedFromPaperDefault(),
  );
  readonly missingFile = computed(
    () => this.attempted() && this.file() === null,
  );

  onKindChange(event: Event): void {
    this.selectedKind.set((event.target as HTMLSelectElement).value);
  }

  onFileChange(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    this.file.set(files && files.length > 0 ? files[0] : null);
  }

  onDigitisedChange(event: Event): void {
    this.digitised.set((event.target as HTMLInputElement).checked);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attempted.set(true);
    const file = this.file();
    if (file === null || this.disabled()) return;
    this.submitted.emit({
      kind: this.kind(),
      origin: this.origin(),
      digitisedFromPaper: this.digitisedFromPaper(),
      file,
    });
  }
}
