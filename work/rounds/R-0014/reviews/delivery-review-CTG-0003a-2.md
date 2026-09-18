# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `portal-pwa` (rodada `R-0014`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/portal-build-pack.md` — apenas a seção do WP `WP-P4…P6` e o "mapa entregável → definições"
4. `work/rounds/R-0014/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0014/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0014/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0014/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Segundo ciclo — restrito ao achado único de `delivery-review-CTG-0003a`** (item 11: C-3a-99 e
C-3a-100 parciais). Avalie somente esta correção:

- TASK-0008 iteração 3 (`work/rounds/R-0014/reports/TASK-0008-iteration-3.md`): `axe` por estado em
  **todos os 11** compartilhados (matriz no relatório: badge 5 situações; card 4; triplet 4; wizard
  9 estados; prefilled 3; uploader 4; diálogo 3; assinatura 5; recibo 3; nota 2; explainer 2) e
  C-3a-100 (ciclo de `Tab` do `ConsequenceDialog`: Shift+Tab/Tab nas bordas, Escape devolve o foco;
  ordem de tabulação do `ActionTriplet`). A varredura apanhou um defeito real — `<input type="file">`
  sem nome acessível (axe `label` critical, `label-title-only` serious) — relatado, não acomodado.
- TASK-0009 iteração 3 (`reports/TASK-0009-iteration-3.md`): `AttachmentUploader` ganha `labelKey`
  opcional (rótulo da tela chamadora, chave existente) com fallback `aria-labelledby` na dica;
  `SignatureStep` passa `portal.forms.assinatura.method.upload` (chave existente). Nenhuma chave nova.
- `plan.md` §Pendências de cobertura marca o item como resolvido.

Gates (Engineer em primeiro plano, conferidos pelo maestro): `pnpm check` completo **EXIT 0**;
`pnpm --filter @detran/portal-web test` → **Test Files 50 passed, Tests 711 passed | 3 todo (714)**,
0 erros não tratados; typecheck/lint/build OK; `verify:parameter-catalogue` OK; `format:check` OK.

### Veredito anterior (delivery-review-CTG-0003a.json)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "REVIEW",
  "findings": [
    {
      "severity": "high",
      "item": 11,
      "file": "work/rounds/R-0014/plan.md",
      "line": 324,
      "claim": "A própria entrega registra C-3a-99 (axe em cada estado dos 11 compartilhados) e C-3a-100 (ciclo de Tab) como parcialmente cobertos, embora o contrato os exija integralmente e determine a conclusão antes do delivery-review.",
      "fix": "Completar os specs de axe por estado e de navegação Tab exigidos em C-3a-99/C-3a-100, executar o gate do app e atualizar a pendência como resolvida antes de novo delivery-review."
    }
  ],
  "notes": [
    "Os três testes todo restantes estão vinculados a OD-P54, OD-P59 e OD-P60; não constituem relaxamento de gate nesta entrega.",
    "Não encontrei chamada nacional fora da exceção de upload por URL assinada documentada."
  ]
}
```

### Diff das correções de produção (iteração 3)

```diff
diff --git a/apps/portal/web/src/app/shared/attachment-uploader.component.ts b/apps/portal/web/src/app/shared/attachment-uploader.component.ts
new file mode 100644
index 0000000..970ed1d
--- /dev/null
+++ b/apps/portal/web/src/app/shared/attachment-uploader.component.ts
@@ -0,0 +1,272 @@
+// AttachmentUploader (contrato CTG-0003a §5.6; [UC-PORTAL-001] AC-3/3a; ADR-0018; [RN-PORTAL-104],
+// [RN-PORTAL-106], [RN-PORTAL-107] regra 3). Por arquivo: pré-checagem de forma (`accept`,
+// `maxBytes` — só orientam; o servidor prevalece) → SHA-256 no cliente → intenção de upload →
+// `PUT` na URL assinada (fetch puro, sem bearer) → `complete` → `done`. Erros por arquivo
+// (`ATTACHMENT_INVALID`, `ATTACHMENT_AGENCY_DOCUMENT`) rejeitam SÓ aquele arquivo;
+// `422 SERVICE_UNAVAILABLE` torna o componente inteiro indisponível, com canal alternativo, sem
+// retry automático nem id simulado (M15). O checklist é o `requirements[]` do servidor — não
+// existe lista de tipos de anexo no cliente. Anexo assinado presume-se autêntico: nenhum campo de
+// reconhecimento de firma ([RN-PORTAL-104]).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  type Signal,
+  computed,
+  inject,
+  input,
+  model,
+  output,
+  signal,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import { PortalErrorBannerComponent } from '../core/error-banner.component';
+import {
+  classifyError,
+  presentError,
+  type ErrorPresentation,
+} from '../core/error-boundary';
+import { sha256Hex } from '../data/idempotency-key';
+import { PortalClient } from '../data/portal.client';
+
+export type AttachmentStatus =
+  'hashing' | 'requesting' | 'uploading' | 'completing' | 'done' | 'rejected';
+
+export interface AttachmentEntry {
+  readonly localId: string;
+  readonly filename: string;
+  readonly mimeType: string;
+  readonly sizeBytes: number;
+  readonly sha256: string | null;
+  readonly attachmentId: string | null;
+  readonly status: AttachmentStatus;
+  readonly error: ErrorPresentation | null;
+}
+
+const ATTACHMENT_INVALID = 'PORTAL.ATTACHMENT_INVALID';
+const SERVICE_UNAVAILABLE = 'PORTAL.SERVICE_UNAVAILABLE';
+
+@Component({
+  selector: 'portal-attachment-uploader',
+  imports: [StynxTranslatePipe, PortalErrorBannerComponent],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-request-id]': 'requestId()' },
+  template: `
+    <div class="portal-attachment-uploader">
+      @if (checklist().length > 0) {
+        <ul class="portal-attachment-checklist" data-checklist>
+          @for (item of checklist(); track $index) {
+            <li>{{ item }}</li>
+          }
+        </ul>
+      }
+      <p [id]="hintId()" class="portal-attachment-hint">
+        {{ hintKey() | stynxTranslate }}
+      </p>
+      @if (unavailable(); as failure) {
+        <portal-error-banner [error]="failure" />
+      } @else {
+        @if (labelKey(); as key) {
+          <label [for]="inputId()">{{ key | stynxTranslate }}</label>
+        }
+        <input
+          type="file"
+          multiple
+          [id]="inputId()"
+          [accept]="acceptAttribute()"
+          [attr.aria-labelledby]="labelKey() ? null : hintId()"
+          [attr.aria-describedby]="hintId()"
+          [disabled]="disabled()"
+          (change)="onFilesSelected($event)"
+        />
+      }
+      @if (entries().length > 0) {
+        <ul class="portal-attachment-entries">
+          @for (entry of entries(); track entry.localId) {
+            <li
+              [attr.data-status]="entry.status"
+              [attr.data-attachment-id]="entry.attachmentId"
+            >
+              <span>{{ entry.filename }}</span>
+              @if (entry.error; as error) {
+                <portal-error-banner [error]="error" />
+              }
+              @if (entry.status === 'done' && entry.attachmentId) {
+                <button
+                  type="button"
+                  data-remove
+                  [disabled]="disabled()"
+                  (click)="remove(entry)"
+                >
+                  {{ 'portal.common.action.remove' | stynxTranslate }}
+                </button>
+              }
+            </li>
+          }
+        </ul>
+      }
+    </div>
+  `,
+})
+export class AttachmentUploaderComponent {
+  private readonly client = inject(PortalClient);
+  private readonly entriesState = signal<readonly AttachmentEntry[]>([]);
+  private readonly unavailableState = signal<ErrorPresentation | null>(null);
+  private sequence = 0;
+
+  readonly requestId = input.required<string>();
+  /** `forms/attachments.ts` `ATTACHMENT_ACCEPT`. */
+  readonly accept = input.required<readonly string[]>();
+  /** `ATTACHMENT_MAX_BYTES` (OD-P66). */
+  readonly maxBytes = input.required<number>();
+  /** `requirements[]` do servidor — nunca constante do cliente. */
+  readonly checklist = input<readonly string[]>([]);
+  /** `portal.forms.<form>.anexos_hint` | `.hint` | `.anexos`. */
+  readonly hintKey = input.required<string>();
+  /**
+   * Rótulo do campo de arquivo (nome acessível), chave da tela chamadora (ex.:
+   * `portal.forms.resposta_diligencia.anexos`); sem ela, o nome vem da própria dica
+   * (`aria-labelledby` = `hintId`).
+   */
+  readonly labelKey = input<string | null>(null);
+  readonly disabled = input(false);
+  readonly attachmentIds = model<readonly string[]>([]);
+  readonly entries: Signal<readonly AttachmentEntry[]> =
+    this.entriesState.asReadonly();
+  /** `422 SERVICE_UNAVAILABLE` do storage. */
+  readonly unavailable: Signal<ErrorPresentation | null> =
+    this.unavailableState.asReadonly();
+  readonly attached = output<AttachmentEntry>();
+  /** `attachmentId`. */
+  readonly removed = output<string>();
+
+  readonly acceptAttribute = computed(() => this.accept().join(','));
+  readonly hintId = computed(
+    () => `portal-attachment-hint-${this.requestId()}`,
+  );
+  readonly inputId = computed(
+    () => `portal-attachment-input-${this.requestId()}`,
+  );
+
+  onFilesSelected(event: Event): void {
+    const input = event.target as HTMLInputElement;
+    const files = Array.from(input.files ?? []);
+    for (const file of files) void this.add(file);
+    input.value = '';
+  }
+
+  remove(entry: AttachmentEntry): void {
+    const attachmentId = entry.attachmentId;
+    this.entriesState.update((entries) =>
+      entries.filter((item) => item.localId !== entry.localId),
+    );
+    if (attachmentId) {
+      this.attachmentIds.update((ids) =>
+        ids.filter((id) => id !== attachmentId),
+      );
+      this.removed.emit(attachmentId);
+    }
+  }
+
+  private async add(file: File): Promise<void> {
+    if (this.disabled() || this.unavailableState()) return;
+    this.sequence += 1;
+    const localId = `${this.requestId()}-${this.sequence}`;
+    let entry: AttachmentEntry = {
+      localId,
+      filename: file.name,
+      mimeType: file.type,
+      sizeBytes: file.size,
+      sha256: null,
+      attachmentId: null,
+      status: 'hashing',
+      error: null,
+    };
+    this.upsert(entry);
+    const rejection = this.shapeRejection(file);
+    if (rejection) {
+      this.upsert({ ...entry, status: 'rejected', error: rejection });
+      return;
+    }
+    try {
+      const sha256 = await sha256Hex(await file.arrayBuffer());
+      entry = { ...entry, sha256, status: 'requesting' };
+      this.upsert(entry);
+      const intent = await this.client.requestAttachmentUpload(
+        this.requestId(),
+        {
+          filename: file.name,
+          mimeType: file.type,
+          sizeBytes: file.size,
+          sha256,
+        },
+      );
+      entry = {
+        ...entry,
+        attachmentId: intent.body.attachmentId,
+        status: 'uploading',
+      };
+      this.upsert(entry);
+      await this.client.uploadToSignedUrl(intent.body, file);
+      entry = { ...entry, status: 'completing' };
+      this.upsert(entry);
+      const completed = await this.client.completeAttachment(
+        this.requestId(),
+        intent.body.attachmentId,
+      );
+      entry = {
+        ...entry,
+        attachmentId: completed.body.attachmentId,
+        sha256: completed.body.sha256 || sha256,
+        status: 'done',
+      };
+      this.upsert(entry);
+      this.attachmentIds.update((ids) =>
+        ids.includes(entry.attachmentId as string)
+          ? ids
+          : [...ids, entry.attachmentId as string],
+      );
+      this.attached.emit(entry);
+    } catch (error: unknown) {
+      this.fail(entry, error);
+    }
+  }
+
+  /** Pré-checagem de forma (accept/maxBytes): rejeição local sem requisição. */
+  private shapeRejection(file: File): ErrorPresentation | null {
+    const accepted = this.accept().includes(file.type);
+    const withinSize = file.size <= this.maxBytes();
+    if (accepted && withinSize) return null;
+    return presentError({
+      status: 400,
+      error: {
+        code: ATTACHMENT_INVALID,
+        status: 400,
+        message: ATTACHMENT_INVALID,
+        context: { allowed: [...this.accept()], maxBytes: this.maxBytes() },
+      },
+    });
+  }
+
+  /** Falha do servidor: por arquivo (rejeita só ele) ou do serviço inteiro (indisponível). */
+  private fail(entry: AttachmentEntry, error: unknown): void {
+    const presentation = presentError(error);
+    if (classifyError(error).code === SERVICE_UNAVAILABLE) {
+      this.unavailableState.set(presentation);
+      this.entriesState.update((entries) =>
+        entries.filter((item) => item.localId !== entry.localId),
+      );
+      return;
+    }
+    this.upsert({ ...entry, status: 'rejected', error: presentation });
+  }
+
+  private upsert(entry: AttachmentEntry): void {
+    this.entriesState.update((entries) => {
+      const index = entries.findIndex((item) => item.localId === entry.localId);
+      if (index < 0) return [...entries, entry];
+      const next = entries.slice();
+      next[index] = entry;
+      return next;
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/shared/signature-step.component.ts b/apps/portal/web/src/app/shared/signature-step.component.ts
new file mode 100644
index 0000000..f95c3b7
--- /dev/null
+++ b/apps/portal/web/src/app/shared/signature-step.component.ts
@@ -0,0 +1,176 @@
+// SignatureStep (contrato CTG-0003a §5.8; T02 §5 "passo guiado embutido"; [UC-PORTAL-019];
+// [RN-PORTAL-101] c; [RN-PORTAL-104]). Suficiência = `required === 'none'` ou
+// `ASSURANCE_ORDER[current] >= ASSURANCE_ORDER[required]` (mesma ordem do `assuranceGuard`; o
+// nível exigido vem do servidor pelo input `required` — nenhuma tabela ato → nível aqui).
+// Insuficiente → `AssuranceExplainer` + botão `portal.screens.t27.cmd.elevar` →
+// `SessionFacade.requestElevation` → `elevationRequested` (quem navega ao `redirectUrl` é o
+// chamador). `required === 'qualificada'` → nunca um caminho: banner
+// `portal.errors.assurance_qualified_never_required`. Suficiente → `govbr` (signatureRef:
+// `source_pending`, OD-P60) ou `upload` (documento assinado via `AttachmentUploader`).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  inject,
+  input,
+  output,
```

### Specs de a11y adicionados (amostra: consequence-dialog e attachment-uploader)

```ts
describe('ConsequenceDialogComponent — a11y (C-3a-99)', () => {
  it('dado aberto sem marcar o checkbox então nenhuma violação axe serious/critical', async () => {
    const fixture = await setupOpen();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado aberto com o checkbox marcado (confirmar habilitado) então nenhuma violação axe serious/critical', async () => {
    const fixture = await setupOpen();
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    );
    checkbox.click();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado document efeitos_sne aberto então nenhuma violação axe serious/critical', async () => {
    const fixture = await setupOpen('efeitos_sne');
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-100; delivery-review-CTG-0003a.json item 11).
// jsdom não avança o foco sozinho ao pressionar Tab (sem comportamento nativo de navegação
// sequencial); o teste posiciona o foco manualmente (como se o Tab anterior já tivesse chegado
// ali) e despacha o `KeyboardEvent` real que `ConsequenceDialogComponent.onKeydown` intercepta
// (`(keydown)` no painel, evento com `bubbles: true` para subir do controle até o host).
describe('ConsequenceDialogComponent — ciclo de Tab (C-3a-100)', () => {
  function tab(
    target: HTMLElement,
    options: { shiftKey?: boolean } = {},
  ): void {
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: options.shiftKey ?? false,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  it('dado foco no primeiro controle (checkbox, confirmar desabilitado) quando Shift+Tab então o foco vai ao último (cancelar)', async () => {
    const fixture = await setupOpen();
    const host: HTMLElement = fixture.nativeElement;
    const checkbox: HTMLInputElement = host.querySelector(
      'input[type="checkbox"]',
    )!;
    const cancelButton: HTMLButtonElement =
      host.querySelector('[data-cancel]')!;
    checkbox.focus();
    expect(document.activeElement).toBe(checkbox);
    tab(checkbox, { shiftKey: true });
    expect(document.activeElement).toBe(cancelButton);
  });

  it('dado foco no último controle (confirmar, habilitado) quando Tab então o foco volta ao primeiro (checkbox)', async () => {
    const fixture = await setupOpen();
    const host: HTMLElement = fixture.nativeElement;
    const checkbox: HTMLInputElement = host.querySelector(
      'input[type="checkbox"]',
    )!;
    checkbox.click();
    fixture.detectChanges();
    const confirmButton: HTMLButtonElement =
      host.querySelector('[data-confirm]')!;
    confirmButton.focus();
    expect(document.activeElement).toBe(confirmButton);
    tab(confirmButton);
    expect(document.activeElement).toBe(checkbox);
  });

  it('dado Escape com o foco dentro do diálogo então cancelled emitido e o foco volta ao elemento que abriu', async () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const fixture = await setupOpen();
    const cancelled: void[] = [];
    (fixture.componentInstance as any).cancelled.subscribe(() =>
      cancelled.push(undefined),
    );
    const dialog: HTMLElement =
      fixture.nativeElement.querySelector('[role="dialog"]');
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(cancelled).toHaveLength(1);
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
});
// ---- attachment-uploader
describe('AttachmentUploaderComponent — a11y (C-3a-99)', () => {
  it('dado o estado inicial (sem entradas) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado uma entrada rejected (attachment_invalid) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup();
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(input, new File(['x'], 'a.txt', { type: 'text/plain' }));
    await waitFor(fixture, () =>
      (fixture.nativeElement.textContent as string).includes(
        catalog['portal.errors.attachment_invalid'],
      ),
    );
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado uma entrada done então nenhuma violação axe serious/critical', async () => {
    const { fixture, client } = await setup();
    const attachmentId = '00000000-0000-7000-8000-0000aa000001';
    client.requestAttachmentUpload.mockResolvedValueOnce({
      body: {
        attachmentId,
        uploadUrl: 'https://storage.invalid/x',
        method: 'PUT',
        headers: {},
        expiresAt: null,
      },
      etag: null,
    });
    client.completeAttachment.mockResolvedValueOnce({
      body: { attachmentId, sha256: 'x'.repeat(64) },
      etag: null,
    });
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(input, new File(['a'], 'a.pdf', { type: 'application/pdf' }));
    await waitFor(
      fixture,
      () => client.completeAttachment.mock.calls.length > 0,
    );
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado 422 SERVICE_UNAVAILABLE (componente inteiro indisponível) então nenhuma violação axe serious/critical', async () => {
    const { fixture, client } = await setup();
    client.requestAttachmentUpload.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
        unavailableReason: 'documento_assinado_pendente_r0014',
      }),
      name: 'HttpErrorResponse',
    });
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(input, new File(['a'], 'a.pdf', { type: 'application/pdf' }));
    await waitFor(
      fixture,
      () => (fixture.componentInstance as any).unavailable() !== null,
    );
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});
```
