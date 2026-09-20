# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `boat-backend` (rodada `R-0010`). Por exceção explícita do
> Owner em 2026-09-20 enquanto Claude está indisponível, este ciclo usa a família Codex em uma
> invocação isolada, efêmera e somente leitura. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/boat-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/boat-build-pack.md` — apenas a seção do WP `WP-B2` e o "mapa entregável → definições"
4. `work/rounds/R-0010/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0010/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0010/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0010",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0010/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

## Escopo da entrega

Grupo documental CTG-0002, tarefas TASK-0015 (Architect), TASK-0016 (Inspector) e TASK-0017 (Engineer), incluindo a correção Architect D-13-08. Leia também:

- `work/rounds/R-0010/contracts/CTG-0002-documents.md`
- `docs/meta/adr/ADR-0018-documents-and-signature-substrate.md`
- `work/rounds/R-0010/reports/TASK-0015.md`
- `work/rounds/R-0010/reports/TASK-0016.md`
- `work/rounds/R-0010/reports/TASK-0017.md`

Faça o primeiro ciclo exaustivo. Além da rubrica, verifique explicitamente:

1. se metadados documentais e bytes sobrevivem a reinício e cumprem imutabilidade;
2. se o armazenamento STYNX montado na composition root é realmente usado;
3. se o resultado integral da validação PDF/A exigido no contrato é persistido;
4. se E2E usa runner/doubles injetáveis e provedores reais ficam somente no tier `real`;
5. se a job CI fixa e provisiona WeasyPrint/veraPDF de modo reproduzível e bloqueante;
6. se a matriz de autorização positiva, negativa, admin global e cross-tenant é exaustiva;
7. se o retorno ao Architect antes da correção de persistência preservou a tríade e a autoridade do blueprint.
8. se a reconciliação pós-R-0007 preserva o inventário fechado de 60 DDLs
   ordinários, a ordem final dos grants append-only, os dois perfis de seed
   BOAT e a negação RLS sem comparar conjuntos sob identidades diferentes.

## Diff completo

```diff
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
index 1ecfaae7..a1491a5f 100644
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -248,6 +248,44 @@ jobs:
           env "${backend_env[@]}" pnpm backend:test:upgrade
           pnpm --filter @detran/senatran-adapter test:e2e

+  boat-documents-real:
+    runs-on: ubuntu-latest
+    steps:
+      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4
+
+      - uses: pnpm/action-setup@f40ffcd9367d9f12939873eb1018b921a783ffaa # v4
+        with:
+          version: 9.15.0
+
+      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
+        with:
+          node-version: '24'
+          cache: pnpm
+
+      - name: Install dependencies
+        env:
+          NODE_AUTH_TOKEN: ${{ secrets.PACKAGES_READ_TOKEN }}
+        run: pnpm install --frozen-lockfile
+
+      - name: Install pinned WeasyPrint PDF/A backend
+        run: |
+          python3 -m venv /tmp/boat-weasyprint
+          cat > /tmp/weasyprint-requirements.txt <<'EOF'
+          weasyprint==70.0 --hash=sha256:5043e55e38d2a2af2b2b871e869697b1f65dad5f8b4a3677961d04ceacf9c5fe
+          EOF
+          /tmp/boat-weasyprint/bin/pip install --require-hashes --no-deps -r /tmp/weasyprint-requirements.txt
+          /tmp/boat-weasyprint/bin/pip install 'pydyf==0.12.1' 'cffi==2.1.1' 'tinyhtml5==2.1.0' 'tinycss2==1.5.1' 'cssselect2==0.10.1' 'Pyphen==0.18.1' 'Pillow==12.3.0' 'fonttools[woff]==4.65.0' 'brotli==1.2.0' 'zopfli==0.4.3' 'pycparser==3.0' 'webencodings==0.6.1'
+          /tmp/boat-weasyprint/bin/weasyprint --version | grep -Fx 'WeasyPrint version 70.0'
+
+      - name: Resolve immutable veraPDF image
+        run: docker pull verapdf/cli@sha256:20202b4bcc2410a25db1f637c7b461a2e0dda1d97dd8a6df658286b30d56c842
+
+      - name: Prove BOAT production PDF/A-2b path
+        env:
+          STYNX_VERAPDF_IMAGE: verapdf/cli@sha256:20202b4bcc2410a25db1f637c7b461a2e0dda1d97dd8a6df658286b30d56c842
+          WEASYPRINT_BIN: /tmp/boat-weasyprint/bin/weasyprint
+        run: pnpm --filter @detran/app test:real
+
   # ---------------------------------------------------------------------------
   # Activated (W0.2, 2026-08-24): the senatran-mock port landed at
   # ./senatran-mock (245 tests: 119 unit + 14 integration + 112 e2e; 114
diff --git a/backend/app/package.json b/backend/app/package.json
index b2af2417..4f7a70b7 100644
--- a/backend/app/package.json
+++ b/backend/app/package.json
@@ -76,6 +76,9 @@
     "@stynx-nyx/health": "1.3.1",
     "@stynx-nyx/idempotency": "1.3.1",
     "@stynx-nyx/logging": "1.3.1",
+    "@stynx-nyx/pdf": "1.3.1",
+    "@stynx-nyx/pdf-a": "1.3.1",
+    "@stynx-nyx/pdf-a-vera-docker": "1.3.1",
     "@stynx-nyx/ratelimit": "1.3.1",
     "@stynx-nyx/sessions": "1.3.1",
     "@stynx-nyx/storage": "1.3.1",
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index 2e1e3805..61680842 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -117,6 +117,7 @@ import {
   type PortalPublicRequestLike,
 } from './detran-runtime.js';
 import { PortalDelegationTargetsModule } from './portal-delegation.providers.js';
+import { BoatDocumentsRuntimeModule } from './boat-documents.js';
 import { PortalNationalReadPortsModule } from './portal-national-read.providers.js';
 import { PortalStreamController } from './portal-stream.controller.js';
 import {
@@ -634,6 +635,7 @@ export class AppModule {
         StynxTenancyModule.forRoot({}),
         StynxAuditModule.forRoot({ sink: detranAuditSink }),
         StynxStorageModule.forRoot(detranStorageOptions()),
+        BoatDocumentsRuntimeModule,
         StynxPlatformPipelineModule.forRoot(detranPipelineOptions()),
         StynxHealthModule.forRoot(
           detranHealthOptions(
diff --git a/backend/app/src/boat-documents.spec.ts b/backend/app/src/boat-documents.spec.ts
new file mode 100644
index 00000000..61341766
--- /dev/null
+++ b/backend/app/src/boat-documents.spec.ts
@@ -0,0 +1,175 @@
+import { describe, expect, it, vi } from 'vitest';
+import { createHash } from 'node:crypto';
+
+import {
+  BOAT_NOTICE,
+  BoatDocumentsFacade,
+  WeasyPrintPdfABackend,
+  type BoatDocumentRecord,
+} from './boat-documents.js';
+
+describe('D-13-03/D-13-04 — backend PDF/A BOAT', () => {
+  it('dado o Default D1 quando renderiza então valida A-2b e devolve o hash dos bytes validados', async () => {
+    const pdf = Buffer.from('%PDF-1.7\nconforme\n%%EOF');
+    const validator = {
+      validate: vi.fn().mockResolvedValue({
+        valid: true,
+        declared: { version: 'A-2', conformance: 'b' },
+        rulesetVersion: 'veraPDF-test',
+        validatedAt: '2026-09-20T00:00:00.000Z',
+        durationMs: 1,
+        errors: [],
+      }),
+    };
+    const backend = new WeasyPrintPdfABackend(validator, async () => pdf);
+    const result = await backend.render({
+      tenantId: 'tenant-a',
+      template: {
+        id: 'est.crash.report.preliminary',
+        engine: 'html',
+        source: '<p>x</p>',
+        version: '1.0.0',
+      },
+      data: {},
+      output: { profile: 'pdf-a' },
+    });
+
+    expect(validator.validate).toHaveBeenCalledWith(pdf, {
+      version: 'A-2',
+      conformance: 'b',
+    });
+    expect(result.bytes).toEqual(pdf);
+    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/u);
+    expect(result.metadata).toMatchObject({
+      profile: 'pdf-a',
+      validator: 'veraPDF-test',
+    });
+  });
+
+  it('dado falso PDF quando veraPDF rejeita então falha fechado', async () => {
+    const backend = new WeasyPrintPdfABackend(
+      {
+        validate: vi.fn().mockResolvedValue({
+          valid: false,
+          declared: null,
+          rulesetVersion: 'veraPDF-test',
+          validatedAt: '2026-09-20T00:00:00.000Z',
+          durationMs: 1,
+          errors: [
+            { ruleId: 'x', severity: 'error', clause: 'x', message: 'invalid' },
+          ],
+        }),
+      },
+      async () => Buffer.from('%PDF-falso'),
+    );
+    await expect(
+      backend.render({
+        tenantId: 'tenant-a',
+        template: {
+          id: 'est.crash.report.preliminary',
+          engine: 'html',
+          source: '<p>x</p>',
+        },
+        data: {},
+        output: { profile: 'pdf-a' },
+      }),
+    ).rejects.toThrow('PDF/A-2b validation failed');
+  });
+});
+
+describe('D-13-02/D-13-06/D-13-07 — fachada D1', () => {
+  it('dado política sem assinatura quando sela então persiste bytes, hash, evidência e supersessão', async () => {
+    const bytes = Buffer.from('%PDF-1.7\nreal-test\n%%EOF');
+    const records = new Map<string, BoatDocumentRecord>();
+    const objects = new Map<string, Uint8Array>();
+    const repository = {
+      latest: async (aggregateId: string) =>
+        [...records.values()]
+          .filter((record) => record.aggregateId === aggregateId)
+          .at(-1) ?? null,
+      insert: async (record: BoatDocumentRecord) => {
+        records.set(record.document.documentId, structuredClone(record));
+      },
+      find: async (documentId: string) => records.get(documentId) ?? null,
+      seal: async (documentId: string) => {
+        const record = records.get(documentId);
+        if (!record) throw new Error('Document not found');
+        record.sealedAt ??= '2026-09-20T00:00:00.000Z';
+        return record.sealedAt;
+      },
+    };
+    const storage = {
+      put: async (key: string, value: Uint8Array) => {
+        if (objects.has(key)) throw new Error('immutable key already exists');
+        objects.set(key, value);
+      },
+      read: async (key: string) => {
+        const value = objects.get(key);
+        if (!value) throw new Error('Document not found');
+        return value;
+      },
+    };
+    const renderer = {
+      render: async () => ({
+        bytes,
+        contentType: 'application/pdf' as const,
+        sha256: createHash('sha256').update(bytes).digest('hex'),
+        pageCount: 1,
+        templateId: 'est.crash.report.preliminary',
+        templateVersion: '1.0.0',
+        metadata: {
+          profile: 'pdf-a',
+          pdfaValidation: JSON.stringify({
+            valid: true,
+            declared: { version: 'A-2', conformance: 'b' },
+            rulesetVersion: 'veraPDF-test',
+            validatedAt: '2026-09-20T00:00:00.000Z',
+            durationMs: 1,
+            errors: [],
+          }),
+        },
+      }),
+    };
+    const facade = new BoatDocumentsFacade(
+      { snapshot: () => ({ tenantId: 'tenant-a' }) } as never,
+      {
+        resolve: async () => ({
+          templateBody: `<p>{{id}}</p><p>${BOAT_NOTICE}</p>`,
+          templateVersion: '1.0.0',
+          policyId: '00000000-0000-7000-8000-000000000001',
+        }),
+      },
+      renderer,
+      repository,
+      storage,
+    );
+    const input = {
+      id: 'crash-1',
+      traffic_agency_id: 'agency-1',
+      state: 'REGISTRADO',
+    };
+    const first = await facade.render('est.crash.report.preliminary', input);
+    const sealed = await facade.seal(first.documentId);
+    expect(sealed.signatureRef).toBeNull();
+    expect(await facade.read(first.documentId)).toEqual(bytes);
+
+    const restarted = new BoatDocumentsFacade(
+      { snapshot: () => ({ tenantId: 'tenant-a' }) } as never,
+      { resolve: async () => Promise.reject(new Error('unused')) },
+      renderer,
+      repository,
+      storage,
+    );
+    expect(await restarted.read(first.documentId)).toEqual(bytes);
+
+    const second = await facade.render('est.crash.report.preliminary', input);
+    expect(second.supersedesDocumentId).toBe(first.documentId);
+    await expect(
+      facade.sign(first.documentId, {
+        role: 'field-agent',
+        personId: 'person-1',
+        certificateRef: null,
+      }),
+    ).rejects.toThrow('Default D1 forbids signing');
+  });
+});
diff --git a/backend/app/src/boat-documents.ts b/backend/app/src/boat-documents.ts
new file mode 100644
index 00000000..b442da78
--- /dev/null
+++ b/backend/app/src/boat-documents.ts
@@ -0,0 +1,553 @@
+import { execFile } from 'node:child_process';
+import { createHash, randomUUID } from 'node:crypto';
+import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
+import { tmpdir } from 'node:os';
+import { join } from 'node:path';
+import { promisify } from 'node:util';
+import { Global, Module } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import type { PdfAValidationResult, PdfAValidator } from '@stynx-nyx/pdf-a';
+import { VeraPdfDockerValidator } from '@stynx-nyx/pdf-a-vera-docker';
+import {
+  countPdfPages,
+  type PdfRenderBackend,
+  type RenderRequest,
+  type RenderResult,
+} from '@stynx-nyx/pdf';
+import { S3Service } from '@stynx-nyx/storage';
+import {
+  DOCUMENTS_FACADE,
+  type DocumentSigner,
+  type DocumentsFacade,
+  type RenderedDocument,
+  type SealedDocument,
+  type SignedDocument,
+  withTenantContext,
+} from '@detran/shared';
+
+const execFileAsync = promisify(execFile);
+export const BOAT_TEMPLATE_KEY = 'est.crash.report.preliminary';
+export const BOAT_DOCUMENT_KIND = 'relatorio_preliminar_sinistro';
+export const BOAT_NOTICE =
+  'Relatório preliminar de sinistro. Documento informativo sujeito a complementação e validação. Não constitui Boletim de Acidente de Trânsito (BAT) oficial.';
+export const VERAPDF_IMAGE =
+  'verapdf/cli@sha256:20202b4bcc2410a25db1f637c7b461a2e0dda1d97dd8a6df658286b30d56c842';
+
+type WeasyRunner = (html: string) => Promise<Uint8Array>;
+
+export class WeasyPrintPdfABackend implements PdfRenderBackend {
+  constructor(
+    private readonly validator: PdfAValidator,
+    private readonly run: WeasyRunner = runWeasyPrint,
+  ) {}
+
+  async render<TData extends Record<string, unknown>>(
+    request: RenderRequest<TData>,
+  ): Promise<RenderResult> {
+    if (request.output?.profile !== 'pdf-a') {
+      throw new Error('BOAT documents require the pdf-a profile');
+    }
+    const html = renderTemplate(request.template.source, request.data);
+    const bytes = await this.run(html);
+    const validation = await this.validator.validate(bytes, {
+      version: 'A-2',
+      conformance: 'b',
+    });
+    if (
+      !validation.valid ||
+      validation.declared?.version !== 'A-2' ||
+      validation.declared.conformance !== 'b'
+    ) {
+      throw new Error('PDF/A-2b validation failed');
+    }
+    return {
+      bytes,
+      contentType: 'application/pdf',
+      sha256: sha256(bytes),
+      pageCount: countPdfPages(bytes),
+      templateId: request.template.id,
+      ...(request.template.version
+        ? { templateVersion: request.template.version }
+        : {}),
+      metadata: {
+        profile: 'pdf-a',
+        pdfa: 'PDF/A-2b',
+        renderer: 'WeasyPrint 70.0',
+        validator: validation.rulesetVersion,
+        pdfaValidation: JSON.stringify(validation),
+        tenantId: request.tenantId,
+        ...(request.metadata ?? {}),
+      },
+    };
+  }
+}
+
+interface CatalogResolution {
+  templateBody: string;
+  templateVersion: string;
+  policyId: string;
+}
+
+export interface BoatDocumentCatalog {
+  resolve(trafficAgencyId: string): Promise<CatalogResolution>;
+}
+
+type SqlTransaction = Transaction & {
+  query<T extends Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+};
+
+export class SqlBoatDocumentCatalog implements BoatDocumentCatalog {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  async resolve(trafficAgencyId: string): Promise<CatalogResolution> {
+    return withTenantContext(
+      this.database,
+      this.requestContext,
+      async (raw) => {
+        const tx = raw as SqlTransaction;
+        const template = await tx.query<{
+          template_body: string;
+          version: string;
+        }>(
+          `select template_body, version
+           from inf.normative_document_template
+          where traffic_agency_id = $1::uuid
+            and document_kind = $2
+            and domain_scope = 'est'
+            and status = 'active'
+          order by valid_from desc, version desc
+          limit 1`,
+          [trafficAgencyId, BOAT_DOCUMENT_KIND],
+        );
+        const policy = await tx.query<{
+          id: string;
+          required_signers_json: unknown;
+          pades_level: string;
+          tsa_required: boolean;
+          pdfa_required: boolean;
+          govbr_level: string | null;
+        }>(
+          `select id::text, required_signers_json, pades_level, tsa_required, pdfa_required, govbr_level
+           from inf.signature_policy
+          where traffic_agency_id = $1::uuid
+            and document_kind = $2
+            and status = 'active'
+          limit 1`,
+          [trafficAgencyId, BOAT_DOCUMENT_KIND],
+        );
+        const templateRow = template.rows[0];
+        const policyRow = policy.rows[0];
+        if (!templateRow || !policyRow) {
+          throw new Error('BOAT document template or policy is unavailable');
+        }
+        if (
+          !Array.isArray(policyRow.required_signers_json) ||
+          policyRow.required_signers_json.length !== 0 ||
+          policyRow.pades_level !== 'NONE' ||
+          policyRow.tsa_required ||
+          !policyRow.pdfa_required ||
+          policyRow.govbr_level !== null
+        ) {
+          throw new Error(
+            'BOAT document policy differs from approved Default D1',
+          );
+        }
+        if (!templateRow.template_body.includes('Não constitui Boletim')) {
+          throw new Error(
+            'BOAT document template lacks the approved non-BAT notice',
+          );
+        }
+        return {
+          templateBody: templateRow.template_body,
+          templateVersion: templateRow.version,
+          policyId: policyRow.id,
+        };
+      },
+    );
+  }
+}
+
+export interface BoatDocumentRecord {
+  document: RenderedDocument;
+  tenantId: string;
+  aggregateId: string;
+  policyId: string;
+  templateVersion: string;
+  byteSize: number;
+  validation: PdfAValidationResult;
+  sealedAt: string | null;
+}
+
+export interface BoatDocumentRepository {
+  latest(aggregateId: string): Promise<BoatDocumentRecord | null>;
+  insert(record: BoatDocumentRecord): Promise<void>;
+  find(documentId: string): Promise<BoatDocumentRecord | null>;
+}
+
+interface BoatDocumentRow {
+  id: string;
+  tenant_id: string;
+  crash_record_id: string;
+  policy_id: string;
+  template_version: string;
+  storage_key: string;
+  content_hash: string;
+  byte_size: number;
+  pdfa_validation: PdfAValidationResult;
+  supersedes_document_id: string | null;
+  sealed_at: string | null;
+}
+
+export class SqlBoatDocumentRepository implements BoatDocumentRepository {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  async latest(aggregateId: string): Promise<BoatDocumentRecord | null> {
+    return this.one(
+      `select id::text, tenant_id::text, crash_record_id::text, policy_id::text,
+              template_version, storage_key, content_hash, byte_size, pdfa_validation,
+              supersedes_document_id::text, sealed_at::text
+         from est.crash_report_document
+        where crash_record_id = $1::uuid
+        order by created_at desc, id desc
+        limit 1`,
+      [aggregateId],
+    );
+  }
+
+  async insert(record: BoatDocumentRecord): Promise<void> {
+    await withTenantContext(this.database, this.requestContext, async (raw) => {
+      const tx = raw as SqlTransaction;
+      await tx.query(
+        `insert into est.crash_report_document (
+             id, tenant_id, crash_record_id, document_kind, template_key,
+             template_version, policy_id, storage_key, content_hash, byte_size,
+             signature_ref, pdfa_conformance, pdfa_validation,
+             supersedes_document_id, sealed_at
+           ) values (
+             $1::uuid, $2::uuid, $3::uuid, 'RELATORIO_PRELIMINAR_SINISTRO', $4,
+             $5, $6::uuid, $7, $8, $9,
+             null, 'PDF/A-2b', $10::jsonb, $11::uuid, $12::timestamptz
+           )`,
+        [
+          record.document.documentId,
+          record.tenantId,
+          record.aggregateId,
+          BOAT_TEMPLATE_KEY,
+          record.templateVersion,
+          record.policyId,
+          record.document.storageKey,
+          record.document.contentHash,
+          record.byteSize,
+          JSON.stringify(record.validation),
+          record.document.supersedesDocumentId,
+          record.sealedAt,
+        ],
+      );
+    });
+  }
+
+  async find(documentId: string): Promise<BoatDocumentRecord | null> {
+    return this.one(
+      `select id::text, tenant_id::text, crash_record_id::text, policy_id::text,
+              template_version, storage_key, content_hash, byte_size, pdfa_validation,
+              supersedes_document_id::text, sealed_at::text
+         from est.crash_report_document
+        where id = $1::uuid
+        limit 1`,
+      [documentId],
+    );
+  }
+
+  private async one(
+    sql: string,
+    values: readonly unknown[],
+  ): Promise<BoatDocumentRecord | null> {
+    return withTenantContext(
+      this.database,
+      this.requestContext,
+      async (raw) => {
+        const tx = raw as SqlTransaction;
+        const result = await tx.query<BoatDocumentRow>(sql, [...values]);
+        return result.rows[0] ? fromRow(result.rows[0]) : null;
+      },
+    );
+  }
+}
+
+export interface BoatObjectStorage {
+  put(storageKey: string, bytes: Uint8Array, sha256: string): Promise<void>;
+  read(storageKey: string): Promise<Uint8Array>;
+}
+
+export class StynxBoatObjectStorage implements BoatObjectStorage {
+  constructor(private readonly storage: S3Service) {}
+
+  async put(
+    storageKey: string,
+    bytes: Uint8Array,
+    contentHash: string,
+  ): Promise<void> {
+    const upload = await this.storage.presignUpload({
+      key: storageKey,
+      contentType: 'application/pdf',
+      checksumSha256: contentHash,
+    });
+    const response = await fetch(upload.url, {
+      method: upload.method,
+      headers: upload.headers,
+      body: Buffer.from(bytes),
+    });
+    if (!response.ok) {
+      throw new Error(`STYNX document upload failed (${response.status})`);
+    }
+  }
+
+  async read(storageKey: string): Promise<Uint8Array> {
+    const download = await this.storage.presignDownload({
+      key: storageKey,
+      filename: 'relatorio-preliminar-sinistro.pdf',
+    });
+    const response = await fetch(download.url);
+    if (!response.ok) {
+      throw new Error(`STYNX document download failed (${response.status})`);
+    }
+    return new Uint8Array(await response.arrayBuffer());
+  }
+}
+
+export class BoatDocumentsFacade implements DocumentsFacade {
+  private readonly pending = new Map<
+    string,
+    { record: BoatDocumentRecord; bytes: Uint8Array }
+  >();
+
+  constructor(
+    private readonly requestContext: RequestContext,
+    private readonly catalog: BoatDocumentCatalog,
+    private readonly renderer: PdfRenderBackend,
+    private readonly repository: BoatDocumentRepository,
+    private readonly storage: BoatObjectStorage,
+  ) {}
+
+  async render(
+    templateKey: string,
+    data: Record<string, unknown>,
+  ): Promise<RenderedDocument> {
+    if (templateKey !== BOAT_TEMPLATE_KEY)
+      throw new Error('Unknown template key');
+    const tenantId = this.requestContext.snapshot().tenantId;
+    const trafficAgencyId = stringField(data, 'traffic_agency_id');
+    const aggregateId = stringField(data, 'id');
+    if (!tenantId) throw new Error('Tenant context is required');
+    const template = await this.catalog.resolve(trafficAgencyId);
+    const result = await this.renderer.render({
+      tenantId,
+      template: {
+        id: templateKey,
+        engine: 'html',
+        source: template.templateBody,
+        version: template.templateVersion,
+      },
+      data,
+      output: { profile: 'pdf-a' },
+      metadata: { documentKind: BOAT_DOCUMENT_KIND, aggregateId },
+    });
+    const validation = parseValidation(result.metadata.pdfaValidation);
+    const prior = await this.repository.latest(aggregateId);
+    const documentId = randomUUID();
+    const storageKey = `${tenantId}/signed-documents/boat/${aggregateId}/${documentId}/1/relatorio-preliminar-sinistro.pdf`;
+    const document: RenderedDocument = {
+      documentId,
+      kind: 'RELATORIO_PRELIMINAR_SINISTRO',
+      storageKey,
+      contentHash: result.sha256,
+      pdfaConformance: 'PDF/A-2b',
+      supersedesDocumentId: prior?.document.documentId ?? null,
+    };
+    this.pending.set(documentId, {
+      bytes: result.bytes,
+      record: {
+        document,
+        tenantId,
+        aggregateId,
+        policyId: template.policyId,
+        templateVersion: template.templateVersion,
+        byteSize: result.bytes.byteLength,
+        validation,
+        sealedAt: null,
+      },
+    });
+    return document;
+  }
+
+  sign(_documentId: string, _signer: DocumentSigner): Promise<SignedDocument> {
+    return Promise.reject(
+      new Error('Default D1 forbids signing the preliminary report'),
+    );
+  }
+
+  async seal(documentId: string): Promise<SealedDocument> {
+    const alreadySealed = await this.repository.find(documentId);
+    if (alreadySealed?.sealedAt) return toSealed(alreadySealed);
+    const pending = this.pending.get(documentId);
+    if (!pending) throw new Error('Document not found');
+    const { record, bytes } = pending;
+    if (sha256(bytes) !== record.document.contentHash) {
+      throw new Error('RAIT.DOCUMENT_HASH_MISMATCH');
+    }
+    const sealed = { ...record, sealedAt: new Date().toISOString() };
+    await this.storage.put(
+      record.document.storageKey,
+      bytes,
+      record.document.contentHash,
+    );
+    await this.repository.insert(sealed);
+    this.pending.delete(documentId);
+    return toSealed(sealed);
+  }
+
+  async read(documentId: string): Promise<Uint8Array> {
+    const record = await this.requireRecord(documentId);
+    if (!record.sealedAt) throw new Error('Document is not sealed');
+    const bytes = await this.storage.read(record.document.storageKey);
+    if (sha256(bytes) !== record.document.contentHash) {
+      throw new Error('RAIT.DOCUMENT_HASH_MISMATCH');
+    }
+    return bytes;
+  }
+
+  private async requireRecord(documentId: string): Promise<BoatDocumentRecord> {
+    const record = await this.repository.find(documentId);
+    if (!record) throw new Error('Document not found');
+    return record;
+  }
+}
+
+@Global()
+@Module({
+  providers: [
+    {
+      provide: DOCUMENTS_FACADE,
+      inject: [Database, RequestContext, S3Service],
+      useFactory: (
+        database: Database,
+        requestContext: RequestContext,
+        storage: S3Service,
+      ) =>
+        new BoatDocumentsFacade(
+          requestContext,
+          new SqlBoatDocumentCatalog(database, requestContext),
+          new WeasyPrintPdfABackend(
+            new VeraPdfDockerValidator({
+              image: process.env.STYNX_VERAPDF_IMAGE ?? VERAPDF_IMAGE,
+              timeoutMs: 120_000,
+            }),
+          ),
+          new SqlBoatDocumentRepository(database, requestContext),
+          new StynxBoatObjectStorage(storage),
+        ),
+    },
+  ],
+  exports: [DOCUMENTS_FACADE],
+})
+export class BoatDocumentsRuntimeModule {}
+
+async function runWeasyPrint(html: string): Promise<Uint8Array> {
+  const directory = await mkdtemp(join(tmpdir(), 'detran-weasyprint-'));
+  const input = join(directory, 'input.html');
+  const output = join(directory, 'output.pdf');
+  try {
+    await writeFile(input, html, 'utf8');
+    await execFileAsync(
+      process.env.WEASYPRINT_BIN ?? 'weasyprint',
+      ['--pdf-variant', 'pdf/a-2b', input, output],
+      { timeout: 30_000 },
+    );
+    return readFile(output);
+  } finally {
+    await rm(directory, { recursive: true, force: true });
+  }
+}
+
+function fromRow(row: BoatDocumentRow): BoatDocumentRecord {
+  return {
+    document: {
+      documentId: row.id,
+      kind: 'RELATORIO_PRELIMINAR_SINISTRO',
+      storageKey: row.storage_key,
+      contentHash: row.content_hash,
+      pdfaConformance: 'PDF/A-2b',
+      supersedesDocumentId: row.supersedes_document_id,
+    },
+    tenantId: row.tenant_id,
+    aggregateId: row.crash_record_id,
+    policyId: row.policy_id,
+    templateVersion: row.template_version,
+    byteSize: row.byte_size,
+    validation: row.pdfa_validation,
+    sealedAt: row.sealed_at,
+  };
+}
+
+function toSealed(record: BoatDocumentRecord): SealedDocument {
+  if (!record.sealedAt) throw new Error('Document is not sealed');
+  return {
+    ...record.document,
+    pdfaConformance: 'PDF/A-2b',
+    signatureRef: null,
+    sealedAt: record.sealedAt,
+  };
+}
+
+function parseValidation(value: string | undefined): PdfAValidationResult {
+  if (!value) throw new Error('PDF/A validation evidence is missing');
+  const parsed = JSON.parse(value) as Partial<PdfAValidationResult>;
+  if (
+    parsed.valid !== true ||
+    parsed.declared?.version !== 'A-2' ||
+    parsed.declared.conformance !== 'b' ||
+    typeof parsed.rulesetVersion !== 'string' ||
+    !Array.isArray(parsed.errors)
+  ) {
+    throw new Error('PDF/A validation evidence is invalid');
+  }
+  return parsed as PdfAValidationResult;
+}
+
+function renderTemplate(source: string, data: Record<string, unknown>): string {
+  return source.replace(
+    /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/gu,
+    (_match, key: string) => escapeHtml(String(data[key] ?? '')),
+  );
+}
+
+function escapeHtml(value: string): string {
+  return value
+    .replaceAll('&', '&amp;')
+    .replaceAll('<', '&lt;')
+    .replaceAll('>', '&gt;')
+    .replaceAll('"', '&quot;')
+    .replaceAll("'", '&#39;');
+}
+
+function sha256(bytes: Uint8Array): string {
+  return createHash('sha256').update(bytes).digest('hex');
+}
+
+function stringField(data: Record<string, unknown>, key: string): string {
+  const value = data[key];
+  if (typeof value !== 'string' || value.length === 0) {
+    throw new Error(`Document data requires ${key}`);
+  }
+  return value;
+}
diff --git a/backend/app/src/generated/parameter-flags.ts b/backend/app/src/generated/parameter-flags.ts
index 6be03ab6..77c0d7b7 100644
--- a/backend/app/src/generated/parameter-flags.ts
+++ b/backend/app/src/generated/parameter-flags.ts
@@ -1,6 +1,6 @@
-// Generated from parameter-catalogue.md sha256:025f5a83ef53ac570b493095a8be1633daca44d0402b226e48448accaa1007ad
+// Generated from parameter-catalogue.md sha256:27768a0cd60acfe911acd5ee08fca371476c85ec328014e39dfdb6b90d455dec
 export const PARAMETER_FLAGS_SOURCE_SHA256 =
-  '025f5a83ef53ac570b493095a8be1633daca44d0402b226e48448accaa1007ad';
+  '27768a0cd60acfe911acd5ee08fca371476c85ec328014e39dfdb6b90d455dec';
 export const PARAMETER_FLAGS = {
   'rait.warning.same_machine': true,
   'session.oral_argument_enabled': false,
diff --git a/backend/app/tests/e2e/boat-crash-commands.e2e.spec.ts b/backend/app/tests/e2e/boat-crash-commands.e2e.spec.ts
index 116685e2..f783b86f 100644
--- a/backend/app/tests/e2e/boat-crash-commands.e2e.spec.ts
+++ b/backend/app/tests/e2e/boat-crash-commands.e2e.spec.ts
@@ -30,6 +30,8 @@ const TEST_DATABASE_URL =
   process.env.DATABASE_URL ??
   `postgresql://${process.env.DB_USER ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'postgres'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME ?? 'detran_r10'}`;
 const client = new Client({ connectionString: TEST_DATABASE_URL });
+const REPORT_BYTES = Buffer.from('%PDF-1.7\nfixture-e2e\n%%EOF');
+const REPORT_HASH = createHash('sha256').update(REPORT_BYTES).digest('hex');

 let app: Awaited<ReturnType<typeof NestFactory.create>>;
 let idempotencySequence = 0;
@@ -196,12 +198,48 @@ beforeAll(async () => {

   await client.connect();
   await client.query(`select set_config('app.role', 'owner', false)`);
-  const { NestFactory: factory } = await import('@nestjs/core');
+  const { Test } = await import('@nestjs/testing');
+  const { DOCUMENTS_FACADE } = await import('@detran/shared');
   const { AppModule } = await import('../../src/app.module.js');
-  app = await factory.create(AppModule.forRoot(), {
-    logger: false,
-    abortOnError: false,
-  });
+  const documents = new Map<string, Buffer>();
+  const module = await Test.createTestingModule({
+    imports: [AppModule.forRoot()],
+  })
+    .overrideProvider(DOCUMENTS_FACADE)
+    .useValue({
+      render: async () => {
+        const documentId = randomUUID();
+        documents.set(documentId, REPORT_BYTES);
+        return {
+          documentId,
+          kind: 'RELATORIO_PRELIMINAR_SINISTRO',
+          storageKey: `e2e/${documentId}.pdf`,
+          contentHash: REPORT_HASH,
+          pdfaConformance: 'PDF/A-2b',
+          supersedesDocumentId: null,
+        };
+      },
+      sign: async () => {
+        throw new Error('Default D1 forbids signing');
+      },
+      seal: async (documentId: string) => ({
+        documentId,
+        kind: 'RELATORIO_PRELIMINAR_SINISTRO',
+        storageKey: `e2e/${documentId}.pdf`,
+        contentHash: REPORT_HASH,
+        pdfaConformance: 'PDF/A-2b',
+        supersedesDocumentId: null,
+        signatureRef: null,
+        sealedAt: '2026-09-20T00:00:00.000Z',
+      }),
+      read: async (documentId: string) => {
+        const bytes = documents.get(documentId);
+        if (!bytes) throw new Error('Document not found');
+        return bytes;
+      },
+    })
+    .compile();
+  app = module.createNestApplication({ logger: false });
   await app.init();
   await app.listen(0);
   const address = app.getHttpServer().address();
@@ -395,7 +433,43 @@ describe('CTG-0002 — comandos HTTP BOAT', () => {
     expect(response.status, JSON.stringify(response.body)).toBe(200);
     expect(response.headers['content-type']).toContain('application/pdf');
     expect(response.body.subarray(0, 4).toString('utf8')).toBe('%PDF');
-    expect(response.body.toString('utf8')).toContain('pdfaid:part');
+    expect(response.headers.etag).toMatch(/^"sha256:[a-f0-9]{64}"$/u);
+    expect(response.headers['content-disposition']).toContain(
+      'relatorio-preliminar-sinistro.pdf',
+    );
+  });
+
+  it('dada a rota do relatório quando cada papel canônico tenta acessar então só a matriz contratada e o admin global passam', async () => {
+    const { DETRAN_ROLES } = await import('@detran/shared');
+    const granted = new Set([
+      'field-agent',
+      'processing-operator',
+      'traffic-authority',
+      // Administradores globais vinculantes de policy.ts.
+      'ADMIN',
+      'GESTOR_DETRAN',
+      'SUPORTE',
+      'technical-admin',
+    ]);
+    for (const role of DETRAN_ROLES) {
+      const response = await request(app.getHttpServer())
+        .get(`/v1/est/crash/records/${BOAT_REGISTERED}/report`)
+        .set(headers(role));
+      expect(response.status, `${role}: ${JSON.stringify(response.body)}`).toBe(
+        granted.has(role) ? 200 : 403,
+      );
+    }
+  });
+
+  it('dado tenant divergente quando pede relatório então falha fechado antes da fachada', async () => {
+    const response = await request(app.getHttpServer())
+      .get(`/v1/est/crash/records/${BOAT_REGISTERED}/report`)
+      .set(
+        headers('field-agent', {
+          'x-tenant-id': '00000000-0000-7000-8000-00000000a002',
+        }),
+      );
+    expect([403, 421]).toContain(response.status);
   });

   it('dado crash-record canônico quando sincronizado então C-2-09 aplica recibo, fila, agregado e outbox na mesma transação', async () => {
diff --git a/backend/app/tests/integration/boat-documents.integration.spec.ts b/backend/app/tests/integration/boat-documents.integration.spec.ts
new file mode 100644
index 00000000..42f53117
--- /dev/null
+++ b/backend/app/tests/integration/boat-documents.integration.spec.ts
@@ -0,0 +1,140 @@
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const tenantA = '00000000-0000-7000-8000-00000000a001';
+const tenantB = '00000000-0000-7000-8000-00000000a002';
+const crashId = '00000000-0000-7000-8000-0000a1000003';
+const client = new Client({ connectionString });
+
+beforeAll(async () => {
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+});
+
+afterAll(async () => {
+  await client.end();
+});
+
+async function insertSealedDocument(id: string): Promise<void> {
+  const policy = await client.query<{ id: string }>(
+    `select id::text
+       from inf.signature_policy
+      where tenant_id = $1::uuid
+        and document_kind = 'relatorio_preliminar_sinistro'`,
+    [tenantA],
+  );
+  expect(policy.rows[0]?.id).toBeTruthy();
+  await client.query(
+    `insert into est.crash_report_document (
+       id, tenant_id, crash_record_id, document_kind, template_key,
+       template_version, policy_id, storage_key, content_hash, byte_size,
+       signature_ref, pdfa_conformance, pdfa_validation, sealed_at
+     ) values (
+       $1::uuid, $2::uuid, $3::uuid, 'RELATORIO_PRELIMINAR_SINISTRO',
+       'est.crash.report.preliminary', '1.0.0', $4::uuid, $5,
+       repeat('a', 64), 42, null, 'PDF/A-2b',
+       '{"valid":true,"declared":{"version":"A-2","conformance":"b"},"rulesetVersion":"veraPDF-test","validatedAt":"2026-09-20T00:00:00.000Z","durationMs":1,"errors":[]}'::jsonb,
+       clock_timestamp()
+     )`,
+    [id, tenantA, crashId, policy.rows[0]?.id, `integration/${id}.pdf`],
+  );
+}
+
+describe('D-13-02/D-13-07 — persistência documental BOAT', () => {
+  it('mantém RLS forçado e concede ao app apenas SELECT/INSERT', async () => {
+    const relation = await client.query<{
+      relrowsecurity: boolean;
+      relforcerowsecurity: boolean;
+      has_policy: boolean;
+      can_select: boolean;
+      can_insert: boolean;
+      can_update: boolean;
+      can_delete: boolean;
+    }>(
+      `select c.relrowsecurity,
+              c.relforcerowsecurity,
+              exists (
+                select 1 from pg_policies p
+                 where p.schemaname = 'est'
+                   and p.tablename = 'crash_report_document'
+                   and p.policyname = 'tenant_isolation'
+              ) as has_policy,
+              has_table_privilege('role_app_backend', 'est.crash_report_document', 'SELECT') as can_select,
+              has_table_privilege('role_app_backend', 'est.crash_report_document', 'INSERT') as can_insert,
+              has_table_privilege('role_app_backend', 'est.crash_report_document', 'UPDATE') as can_update,
+              has_table_privilege('role_app_backend', 'est.crash_report_document', 'DELETE') as can_delete
+         from pg_class c
+         join pg_namespace n on n.oid = c.relnamespace
+        where n.nspname = 'est' and c.relname = 'crash_report_document'`,
+    );
+    expect(relation.rows).toEqual([
+      {
+        relrowsecurity: true,
+        relforcerowsecurity: true,
+        has_policy: true,
+        can_select: true,
+        can_insert: true,
+        can_update: false,
+        can_delete: false,
+      },
+    ]);
+  });
+
+  it('persiste evidência integral, oculta outro tenant e rejeita mutação pelo app', async () => {
+    const id = randomUUID();
+    await insertSealedDocument(id);
+    try {
+      const persisted = await client.query<{
+        valid: string;
+        version: string;
+        conformance: string;
+      }>(
+        `select pdfa_validation ->> 'valid' as valid,
+                pdfa_validation #>> '{declared,version}' as version,
+                pdfa_validation #>> '{declared,conformance}' as conformance
+           from est.crash_report_document where id = $1::uuid`,
+        [id],
+      );
+      expect(persisted.rows).toEqual([
+        { valid: 'true', version: 'A-2', conformance: 'b' },
+      ]);
+
+      await client.query('begin');
+      await client.query('set local role role_app_backend');
+      await client.query(`select set_config('app.tenant_id', $1, true)`, [
+        tenantB,
+      ]);
+      const crossTenant = await client.query(
+        'select id from est.crash_report_document where id = $1::uuid',
+        [id],
+      );
+      expect(crossTenant.rows).toHaveLength(0);
+      await client.query('rollback');
+
+      await client.query('begin');
+      await client.query('set local role role_app_backend');
+      await client.query(`select set_config('app.tenant_id', $1, true)`, [
+        tenantA,
+      ]);
+      await expect(
+        client.query(
+          `update est.crash_report_document set storage_key = 'mutated' where id = $1::uuid`,
+          [id],
+        ),
+      ).rejects.toMatchObject({ code: '42501' });
+      await client.query('rollback');
+    } finally {
+      await client.query(`select set_config('app.role', 'owner', false)`);
+      await client.query(
+        'delete from est.crash_report_document where id = $1::uuid',
+        [id],
+      );
+    }
+  });
+});
diff --git a/backend/app/tests/real/boat-documents.real.spec.ts b/backend/app/tests/real/boat-documents.real.spec.ts
new file mode 100644
index 00000000..6195d803
--- /dev/null
+++ b/backend/app/tests/real/boat-documents.real.spec.ts
@@ -0,0 +1,42 @@
+import { describe, expect, it } from 'vitest';
+import { VeraPdfDockerValidator } from '@stynx-nyx/pdf-a-vera-docker';
+
+import { WeasyPrintPdfABackend } from '../../src/boat-documents.js';
+
+const IMAGE =
+  'verapdf/cli@sha256:20202b4bcc2410a25db1f637c7b461a2e0dda1d97dd8a6df658286b30d56c842';
+
+describe('C-2-13 — caminho real PDF/A-2b', () => {
+  it('dado relatório D1 quando gera e valida então produz PDF/A-2b real', async () => {
+    const backend = new WeasyPrintPdfABackend(
+      new VeraPdfDockerValidator({ image: IMAGE, timeoutMs: 120_000 }),
+    );
+    const result = await backend.render({
+      tenantId: '00000000-0000-7000-8000-00000000a001',
+      template: {
+        id: 'est.crash.report.preliminary',
+        engine: 'html',
+        version: '1.0.0',
+        source:
+          '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Relatório preliminar</title><body><h1>Relatório preliminar de sinistro</h1><p>Documento informativo sujeito a complementação e validação. Não constitui Boletim de Acidente de Trânsito (BAT) oficial.</p></body></html>',
+      },
+      data: {},
+      output: { profile: 'pdf-a' },
+    });
+    expect(Buffer.from(result.bytes).subarray(0, 5).toString()).toBe('%PDF-');
+    expect(result.metadata).toMatchObject({ profile: 'pdf-a' });
+  }, 180_000);
+
+  it('dado bytes que apenas começam com PDF quando valida então rejeita', async () => {
+    const validator = new VeraPdfDockerValidator({
+      image: IMAGE,
+      timeoutMs: 120_000,
+    });
+    await expect(
+      validator.validate(Buffer.from('%PDF-falso\n%%EOF'), {
+        version: 'A-2',
+        conformance: 'b',
+      }),
+    ).rejects.toThrow('veraPDF Docker validation failed');
+  }, 180_000);
+});
diff --git a/backend/app/vitest.config.ts b/backend/app/vitest.config.ts
index c1a1f786..fcf1842f 100644
--- a/backend/app/vitest.config.ts
+++ b/backend/app/vitest.config.ts
@@ -192,6 +192,12 @@ export default defineConfig({
     passWithNoTests: true,
     fileParallelism: false,
     testTimeout:
-      tier === 'unit' ? 10_000 : tier === 'in-house' ? 120_000 : 30_000,
+      tier === 'unit'
+        ? 10_000
+        : tier === 'real'
+          ? 180_000
+          : tier === 'in-house'
+            ? 120_000
+            : 30_000,
   },
 });
diff --git a/backend/database/apply.sh b/backend/database/apply.sh
index 6b01dbaa..8b6d93e5 100755
--- a/backend/database/apply.sh
+++ b/backend/database/apply.sh
@@ -26,7 +26,7 @@ const fs = require('node:fs');
 const path = require('node:path');
 const dir = process.argv[1];
 const full = process.argv[2] === '1';
-const ordinary = ["00-extensions.sql","01-schemas.sql","02-auth.sql","03-audit.sql","04-integration-storage.sql","05-role-catalog.sql","10-postgis-functions.sql","11-auth-functions.sql","12-audit-functions.sql","13-ops-agency.sql","13-ops-field-operations.sql","14-inf-lifecycle-vocabulary.sql","15-ops-parameter.sql","16-ops-snapshots.sql","17-ops-evidence.sql","18-ops-offline-sync.sql","19-est-lifecycle-vocabulary.sql","19-portal-platform.sql","20-rls-policies.sql","30-inf-normative.sql","30-ops-example.sql","31-inf-ait.sql","32-inf-measures.sql","33-inf-alcohol.sql","34-inf-rait-case.sql","35-inf-rait-worklist.sql","36-inf-rait-session.sql","37-inf-speed.sql","38-inf-infraction.sql","39-inf-rait-org.sql","40-ch-clinical-network.sql","41-ch-patients.sql","42-ch-encounters.sql","43-ch-exams.sql","44-ch-reports.sql","45-ch-biometrics.sql","46-ch-scheduling.sql","47-ch-restrictions.sql","48-ch-retention.sql","49-ch-process-blocks.sql","50-ch-telehealth.sql","51-ch-billing.sql","52-ch-clinical-controls.sql","53-ch-inconsistencies.sql","54-ch-operational-controls.sql","55-ch-juntas.sql","56-ch-toxicology.sql","57-inf-collection.sql","58-inf-rait-integration.sql","59-inf-notification.sql","60-portal-complaints.sql","61-portal-identity.sql","62-portal-requests.sql","63-portal-inbox.sql","64-portal-citizen-service.sql","65-portal-projections.sql","70-est-crash.sql"];
+const ordinary = ["00-extensions.sql","01-schemas.sql","02-auth.sql","03-audit.sql","04-integration-storage.sql","05-role-catalog.sql","10-postgis-functions.sql","11-auth-functions.sql","12-audit-functions.sql","13-ops-agency.sql","13-ops-field-operations.sql","14-inf-lifecycle-vocabulary.sql","15-ops-parameter.sql","16-ops-snapshots.sql","17-ops-evidence.sql","18-ops-offline-sync.sql","19-est-lifecycle-vocabulary.sql","19-portal-platform.sql","20-rls-policies.sql","30-inf-normative.sql","30-ops-example.sql","31-inf-ait.sql","32-inf-measures.sql","33-inf-alcohol.sql","34-inf-rait-case.sql","35-inf-rait-worklist.sql","36-inf-rait-session.sql","37-inf-speed.sql","38-inf-infraction.sql","39-inf-rait-org.sql","40-ch-clinical-network.sql","41-ch-patients.sql","42-ch-encounters.sql","43-ch-exams.sql","44-ch-reports.sql","45-ch-biometrics.sql","46-ch-scheduling.sql","47-ch-restrictions.sql","48-ch-retention.sql","49-ch-process-blocks.sql","50-ch-telehealth.sql","51-ch-billing.sql","52-ch-clinical-controls.sql","53-ch-inconsistencies.sql","54-ch-operational-controls.sql","55-ch-juntas.sql","56-ch-toxicology.sql","57-inf-collection.sql","58-inf-rait-integration.sql","59-inf-notification.sql","60-portal-complaints.sql","61-portal-identity.sql","62-portal-requests.sql","63-portal-inbox.sql","64-portal-citizen-service.sql","65-portal-projections.sql","70-est-crash.sql","71-dashboard-crashes.sql","72-integration-renaest-mirror.sql","75-boat-renaest-job.sql"];
 const manual = ['19-rait-priority-pre.sql','19-rait-priority-enforce.sql','19-rait-priority-verify.sql'];
 const expected = [...ordinary,...manual].sort();
 const present = fs.readdirSync(path.join(dir,'ddl')).filter(n=>n.endsWith('.sql')).sort();
diff --git a/backend/database/ddl/20-rls-policies.sql b/backend/database/ddl/20-rls-policies.sql
index 67ab46da..581b54d8 100644
--- a/backend/database/ddl/20-rls-policies.sql
+++ b/backend/database/ddl/20-rls-policies.sql
@@ -27,6 +27,16 @@ SELECT auth.install_tenant_triggers();

 GRANT USAGE ON SCHEMA auth, tenancy, audit, storage, integration, inf, est, ch, ops TO role_app_backend;
 GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth, tenancy, storage, integration, inf, est, ch, ops TO role_app_backend;
+-- The legacy-upgrade fixture applies this file without the optional EST crash
+-- module.  On the current schema, restore the blueprint's append-only grant
+-- after the repository-wide grant above.
+DO $$
+BEGIN
+  IF to_regclass('est.crash_report_document') IS NOT NULL THEN
+    EXECUTE 'REVOKE UPDATE, DELETE ON TABLE est.crash_report_document FROM role_app_backend';
+  END IF;
+END
+$$;
 REVOKE ALL ON TABLE audit.events FROM role_app_backend;
 GRANT SELECT ON TABLE audit.events TO role_app_backend;
 GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth, audit, storage, integration, inf, est, ch, ops TO role_app_backend;
diff --git a/backend/database/ddl/70-est-crash.sql b/backend/database/ddl/70-est-crash.sql
index b704f122..5a19bc7d 100644
--- a/backend/database/ddl/70-est-crash.sql
+++ b/backend/database/ddl/70-est-crash.sql
@@ -1,4 +1,4 @@
--- Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+-- Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62

 -- Regenerable-only DDL for BP-EST-CRASH-001; request-path writes use role_app_backend.

@@ -256,6 +256,41 @@ create table if not exists est.crash_subject_request (
 create index if not exists ix_crash_subject_request_tenant_id on est.crash_subject_request (tenant_id);
 create index if not exists ix_crash_subject_request_crash_record_id on est.crash_subject_request (crash_record_id);

+create table if not exists est.crash_report_document (
+  id uuid default gen_random_uuid() not null,
+  tenant_id uuid not null,
+  crash_record_id uuid not null,
+  document_kind varchar(80) not null,
+  template_key varchar(160) not null,
+  template_version varchar(80) not null,
+  policy_id uuid not null,
+  storage_key text not null,
+  content_hash varchar(64) not null,
+  byte_size integer not null,
+  signature_ref text,
+  pdfa_conformance varchar(20) not null,
+  pdfa_validation jsonb not null,
+  supersedes_document_id uuid,
+  sealed_at timestamptz,
+  created_at timestamptz default clock_timestamp() not null,
+  updated_at timestamptz,
+  constraint pk_crash_report_document primary key (id),
+  constraint ck_est_crash_report_document_kind check (document_kind = 'RELATORIO_PRELIMINAR_SINISTRO'),
+  constraint ck_est_crash_report_pdfa check (pdfa_conformance = 'PDF/A-2b'),
+  constraint ck_est_crash_report_hash check (content_hash ~ '^[0-9a-f]{64}$'),
+  constraint ck_est_crash_report_size check (byte_size > 0),
+  constraint ck_est_crash_report_validation check (pdfa_validation ->> 'valid' = 'true' and pdfa_validation #>> '{declared,version}' = 'A-2' and pdfa_validation #>> '{declared,conformance}' = 'b'),
+  constraint fk_est_crash_report_record foreign key (crash_record_id) references est.crash_record (id),
+  constraint fk_est_crash_report_policy foreign key (policy_id) references inf.signature_policy (id),
+  constraint fk_est_crash_report_supersedes foreign key (supersedes_document_id) references est.crash_report_document (id)
+);
+create unique index if not exists ux_est_crash_report_storage_key on est.crash_report_document (tenant_id, storage_key);
+create index if not exists ix_est_crash_report_record_created on est.crash_report_document (tenant_id, crash_record_id, created_at);
+create index if not exists ix_crash_report_document_tenant_id on est.crash_report_document (tenant_id);
+create index if not exists ix_crash_report_document_crash_record_id on est.crash_report_document (crash_record_id);
+create index if not exists ix_crash_report_document_policy_id on est.crash_report_document (policy_id);
+create index if not exists ix_crash_report_document_supersedes_document_id on est.crash_report_document (supersedes_document_id);
+
 select auth.create_rls_policy('est', 'crash_record');

 select auth.create_rls_policy('est', 'crash_vehicle');
@@ -278,10 +313,14 @@ select auth.create_rls_policy('est', 'crash_renaest_submission');

 select auth.create_rls_policy('est', 'crash_subject_request');

+select auth.create_rls_policy('est', 'crash_report_document');
+
 select auth.install_tenant_triggers();

 grant usage on schema est to role_app_backend;

 grant select, insert, update, delete on all tables in schema est to role_app_backend;

+revoke update, delete on table est.crash_report_document from role_app_backend;
+
 grant usage, select on all sequences in schema est to role_app_backend;
diff --git a/backend/database/seed.sh b/backend/database/seed.sh
index 4aee0143..b556f092 100755
--- a/backend/database/seed.sh
+++ b/backend/database/seed.sh
@@ -33,6 +33,7 @@ case "$rait_seed_profile" in
       70-fixtures-est-crash.sql
       70-fixtures-portal.sql
       71-fixtures-portal-events.sql
+      72-fixtures-boat-projections.sql
     )
     ;;
   legacy-upgrade)
@@ -52,6 +53,7 @@ case "$rait_seed_profile" in
       70-fixtures-est-crash.sql
       70-fixtures-portal.sql
       71-fixtures-portal-events.sql
+      72-fixtures-boat-projections.sql
     )
     ;;
   *)
diff --git a/backend/database/seed/05-parameters.sql b/backend/database/seed/05-parameters.sql
index 05805c4d..ee946a5e 100644
--- a/backend/database/seed/05-parameters.sql
+++ b/backend/database/seed/05-parameters.sql
@@ -1,4 +1,4 @@
--- Generated from parameter-catalogue.md sha256:025f5a83ef53ac570b493095a8be1633daca44d0402b226e48448accaa1007ad
+-- Generated from parameter-catalogue.md sha256:27768a0cd60acfe911acd5ee08fca371476c85ec328014e39dfdb6b90d455dec
 -- Applied by backend/database/seed.sh after apply.sh: the tenant context below satisfies auth.enforce_tenant_id().
 select set_config('app.role', 'owner', false);
 select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);
diff --git a/backend/database/seed/27-fixtures-teat-evidence.sql b/backend/database/seed/27-fixtures-teat-evidence.sql
index 1d46bea2..8b362c02 100644
--- a/backend/database/seed/27-fixtures-teat-evidence.sql
+++ b/backend/database/seed/27-fixtures-teat-evidence.sql
@@ -109,6 +109,16 @@ insert into inf.normative_document_template (id, tenant_id, traffic_agency_id, d
 values ('00000000-0000-7000-8000-0000e1200001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','ait','Modelo de talão eletrônico (fixtures)','2026.1','Auto de Infração de Trânsito nº {{ait_number}}','2026-01-01','active')
 on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, document_kind=excluded.document_kind, name=excluded.name, version=excluded.version, template_body=excluded.template_body, valid_from=excluded.valid_from, status=excluded.status;

+-- Default D1 do relatório preliminar BOAT: documento informativo distinto do
+-- BAT oficial, PDF/A-2b obrigatório e sem assinatura na política inicial.
+insert into inf.normative_document_template (id, tenant_id, traffic_agency_id, document_kind, domain_scope, name, version, template_body, valid_from, status)
+values ('00000000-0000-7000-8000-0000e1200013','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','relatorio_preliminar_sinistro','est','est.crash.report.preliminary','1.0.0','<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório preliminar de sinistro</title><style>@page{size:A4;margin:20mm}body{font-family:sans-serif}dt{font-weight:bold}</style></head><body><h1>Relatório preliminar de sinistro</h1><dl><dt>Identificador</dt><dd>{{id}}</dd><dt>Órgão</dt><dd>{{traffic_agency_id}}</dd><dt>Estado</dt><dd>{{state}}</dd><dt>Ocorrência</dt><dd>{{occurred_at}}</dd><dt>Local</dt><dd>{{location_description}}</dd></dl><p>Relatório preliminar de sinistro. Documento informativo sujeito a complementação e validação. Não constitui Boletim de Acidente de Trânsito (BAT) oficial.</p></body></html>','2026-09-20','active')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, document_kind=excluded.document_kind, domain_scope=excluded.domain_scope, name=excluded.name, version=excluded.version, template_body=excluded.template_body, valid_from=excluded.valid_from, status=excluded.status;
+
+insert into inf.signature_policy (id, tenant_id, traffic_agency_id, document_kind, required_signers_json, pades_level, tsa_required, pdfa_required, govbr_level, status)
+values ('00000000-0000-7000-8000-0000e1400013','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','relatorio_preliminar_sinistro','[]'::jsonb,'NONE',false,true,null,'active')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, document_kind=excluded.document_kind, required_signers_json=excluded.required_signers_json, pades_level=excluded.pades_level, tsa_required=excluded.tsa_required, pdfa_required=excluded.pdfa_required, govbr_level=excluded.govbr_level, status=excluded.status;
+
 -- inf.normative_agency_parameter: parâmetro ativo do órgão …e2000001, entra
 -- no manifesto (§3).
 insert into inf.normative_agency_parameter (id, tenant_id, traffic_agency_id, key, value_json, value_type, valid_from, status)
diff --git a/backend/domains/est/crash/src/controllers/crash-damage.controller.ts b/backend/domains/est/crash/src/controllers/crash-damage.controller.ts
index bf129c2b..4a3b7428 100644
--- a/backend/domains/est/crash/src/controllers/crash-damage.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-damage.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/controllers/crash-link.controller.ts b/backend/domains/est/crash/src/controllers/crash-link.controller.ts
index 95c2a2b8..c6fdd539 100644
--- a/backend/domains/est/crash/src/controllers/crash-link.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-link.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/controllers/crash-person.controller.ts b/backend/domains/est/crash/src/controllers/crash-person.controller.ts
index 94ba4214..38d5fa65 100644
--- a/backend/domains/est/crash/src/controllers/crash-person.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-person.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/controllers/crash-record.controller.ts b/backend/domains/est/crash/src/controllers/crash-record.controller.ts
index 2379684b..6c4f1ee5 100644
--- a/backend/domains/est/crash/src/controllers/crash-record.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-record.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/controllers/crash-renaest-submission.controller.ts b/backend/domains/est/crash/src/controllers/crash-renaest-submission.controller.ts
index 218875bf..fc842594 100644
--- a/backend/domains/est/crash/src/controllers/crash-renaest-submission.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-renaest-submission.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/controllers/crash-report-document.controller.ts b/backend/domains/est/crash/src/controllers/crash-report-document.controller.ts
new file mode 100644
index 00000000..8464f9b8
--- /dev/null
+++ b/backend/domains/est/crash/src/controllers/crash-report-document.controller.ts
@@ -0,0 +1,19 @@
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
+import {
+  Body,
+  Controller,
+  Delete,
+  Get,
+  Param,
+  Patch,
+  Post,
+} from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+import type { CreateCrashReportDocumentDto } from '../dto/create-crash-report-document.dto.js';
+import { CrashReportDocumentService } from '../services/crash-report-document.service.js';
+
+@Controller('v1/est/crash/report-documents')
+@Resource('est:crash-report-document')
+export class CrashReportDocumentController {
+  constructor(private readonly service: CrashReportDocumentService) {}
+}
diff --git a/backend/domains/est/crash/src/controllers/crash-scene-duty.controller.ts b/backend/domains/est/crash/src/controllers/crash-scene-duty.controller.ts
index 390e2e54..cd39720a 100644
--- a/backend/domains/est/crash/src/controllers/crash-scene-duty.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-scene-duty.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/controllers/crash-sketch.controller.ts b/backend/domains/est/crash/src/controllers/crash-sketch.controller.ts
index 25e8bb53..b669f72d 100644
--- a/backend/domains/est/crash/src/controllers/crash-sketch.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-sketch.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/controllers/crash-subject-request.controller.ts b/backend/domains/est/crash/src/controllers/crash-subject-request.controller.ts
index 7bfff05f..ed801d13 100644
--- a/backend/domains/est/crash/src/controllers/crash-subject-request.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-subject-request.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/controllers/crash-vehicle.controller.ts b/backend/domains/est/crash/src/controllers/crash-vehicle.controller.ts
index 8a9bf40a..b9b4e4f3 100644
--- a/backend/domains/est/crash/src/controllers/crash-vehicle.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-vehicle.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/controllers/crash-victim.controller.ts b/backend/domains/est/crash/src/controllers/crash-victim.controller.ts
index ca9d446a..dc03cbe4 100644
--- a/backend/domains/est/crash/src/controllers/crash-victim.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-victim.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/controllers/crash-witness.controller.ts b/backend/domains/est/crash/src/controllers/crash-witness.controller.ts
index 0ff9290c..bff87797 100644
--- a/backend/domains/est/crash/src/controllers/crash-witness.controller.ts
+++ b/backend/domains/est/crash/src/controllers/crash-witness.controller.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import {
   Body,
   Controller,
diff --git a/backend/domains/est/crash/src/crash.module.ts b/backend/domains/est/crash/src/crash.module.ts
index 7bf7fb66..faedee92 100644
--- a/backend/domains/est/crash/src/crash.module.ts
+++ b/backend/domains/est/crash/src/crash.module.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Module } from '@nestjs/common';
 import { CrashRecordController } from './controllers/crash-record.controller.js';
 import { CrashRecordService } from './services/crash-record.service.js';
@@ -33,6 +33,9 @@ import { CrashRenaestSubmissionRepository } from './repositories/crash-renaest-s
 import { CrashSubjectRequestController } from './controllers/crash-subject-request.controller.js';
 import { CrashSubjectRequestService } from './services/crash-subject-request.service.js';
 import { CrashSubjectRequestRepository } from './repositories/crash-subject-request.repository.js';
+import { CrashReportDocumentController } from './controllers/crash-report-document.controller.js';
+import { CrashReportDocumentService } from './services/crash-report-document.service.js';
+import { CrashReportDocumentRepository } from './repositories/crash-report-document.repository.js';
 import { BoatCrashCommandsController } from './handwritten/boat-commands.controller.js';
 import { BoatCrashCommandsService } from './handwritten/boat-commands.service.js';

@@ -50,6 +53,7 @@ import { BoatCrashCommandsService } from './handwritten/boat-commands.service.js
     CrashLinkController,
     CrashRenaestSubmissionController,
     CrashSubjectRequestController,
+    CrashReportDocumentController,
   ],
   providers: [
     CrashRecordService,
@@ -74,6 +78,8 @@ import { BoatCrashCommandsService } from './handwritten/boat-commands.service.js
     CrashRenaestSubmissionRepository,
     CrashSubjectRequestService,
     CrashSubjectRequestRepository,
+    CrashReportDocumentService,
+    CrashReportDocumentRepository,
     BoatCrashCommandsService,
   ],
 })
diff --git a/backend/domains/est/crash/src/dto/create-crash-damage.dto.ts b/backend/domains/est/crash/src/dto/create-crash-damage.dto.ts
index 2f5c764a..9ef25094 100644
--- a/backend/domains/est/crash/src/dto/create-crash-damage.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-damage.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashDamageDto {
   crash_record_id: string;
   asset_kind: string;
diff --git a/backend/domains/est/crash/src/dto/create-crash-link.dto.ts b/backend/domains/est/crash/src/dto/create-crash-link.dto.ts
index 634b1782..75883573 100644
--- a/backend/domains/est/crash/src/dto/create-crash-link.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-link.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashLinkDto {
   crash_record_id: string;
   kind: string;
diff --git a/backend/domains/est/crash/src/dto/create-crash-person.dto.ts b/backend/domains/est/crash/src/dto/create-crash-person.dto.ts
index e7d0e4ba..0a9480a0 100644
--- a/backend/domains/est/crash/src/dto/create-crash-person.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-person.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashPersonDto {
   crash_record_id: string;
   person_id?: string | null;
diff --git a/backend/domains/est/crash/src/dto/create-crash-record.dto.ts b/backend/domains/est/crash/src/dto/create-crash-record.dto.ts
index e70e0aaa..3d3239cf 100644
--- a/backend/domains/est/crash/src/dto/create-crash-record.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-record.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashRecordDto {
   traffic_agency_id: string;
   crash_type: string;
diff --git a/backend/domains/est/crash/src/dto/create-crash-renaest-submission.dto.ts b/backend/domains/est/crash/src/dto/create-crash-renaest-submission.dto.ts
index 8ee76f9b..2a64a836 100644
--- a/backend/domains/est/crash/src/dto/create-crash-renaest-submission.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-renaest-submission.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashRenaestSubmissionDto {
   crash_record_id: string;
   protocol?: string | null;
diff --git a/backend/domains/est/crash/src/dto/create-crash-report-document.dto.ts b/backend/domains/est/crash/src/dto/create-crash-report-document.dto.ts
new file mode 100644
index 00000000..c7333772
--- /dev/null
+++ b/backend/domains/est/crash/src/dto/create-crash-report-document.dto.ts
@@ -0,0 +1,15 @@
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
+export interface CreateCrashReportDocumentDto {
+  crash_record_id: string;
+  document_kind: string;
+  template_key: string;
+  template_version: string;
+  policy_id: string;
+  storage_key: string;
+  content_hash: string;
+  byte_size: number;
+  signature_ref?: string | null;
+  pdfa_conformance: string;
+  pdfa_validation: Record<string, unknown>;
+  supersedes_document_id?: string | null;
+}
diff --git a/backend/domains/est/crash/src/dto/create-crash-scene-duty.dto.ts b/backend/domains/est/crash/src/dto/create-crash-scene-duty.dto.ts
index 499344f7..7014a6a9 100644
--- a/backend/domains/est/crash/src/dto/create-crash-scene-duty.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-scene-duty.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashSceneDutyDto {
   crash_record_id: string;
   regime: string;
diff --git a/backend/domains/est/crash/src/dto/create-crash-sketch.dto.ts b/backend/domains/est/crash/src/dto/create-crash-sketch.dto.ts
index 88a97992..a7b58f7b 100644
--- a/backend/domains/est/crash/src/dto/create-crash-sketch.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-sketch.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashSketchDto {
   crash_record_id: string;
   sketch_type: string;
diff --git a/backend/domains/est/crash/src/dto/create-crash-subject-request.dto.ts b/backend/domains/est/crash/src/dto/create-crash-subject-request.dto.ts
index 5434875b..87d006c9 100644
--- a/backend/domains/est/crash/src/dto/create-crash-subject-request.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-subject-request.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashSubjectRequestDto {
   crash_record_id?: string | null;
   kind: string;
diff --git a/backend/domains/est/crash/src/dto/create-crash-vehicle.dto.ts b/backend/domains/est/crash/src/dto/create-crash-vehicle.dto.ts
index f9f4701a..742260b9 100644
--- a/backend/domains/est/crash/src/dto/create-crash-vehicle.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-vehicle.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashVehicleDto {
   crash_record_id: string;
   vehicle_snapshot_id?: string | null;
diff --git a/backend/domains/est/crash/src/dto/create-crash-victim.dto.ts b/backend/domains/est/crash/src/dto/create-crash-victim.dto.ts
index c0642e10..0f1e53ba 100644
--- a/backend/domains/est/crash/src/dto/create-crash-victim.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-victim.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashVictimDto {
   crash_record_id: string;
   crash_person_id: string;
diff --git a/backend/domains/est/crash/src/dto/create-crash-witness.dto.ts b/backend/domains/est/crash/src/dto/create-crash-witness.dto.ts
index e96264e6..1f4012fa 100644
--- a/backend/domains/est/crash/src/dto/create-crash-witness.dto.ts
+++ b/backend/domains/est/crash/src/dto/create-crash-witness.dto.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CreateCrashWitnessDto {
   crash_record_id: string;
   name: string;
diff --git a/backend/domains/est/crash/src/entities/crash-damage.entity.ts b/backend/domains/est/crash/src/entities/crash-damage.entity.ts
index 8085da9e..5db6ba16 100644
--- a/backend/domains/est/crash/src/entities/crash-damage.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-damage.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashDamage {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/entities/crash-link.entity.ts b/backend/domains/est/crash/src/entities/crash-link.entity.ts
index b18edfa5..721e9f68 100644
--- a/backend/domains/est/crash/src/entities/crash-link.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-link.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashLink {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/entities/crash-person.entity.ts b/backend/domains/est/crash/src/entities/crash-person.entity.ts
index f1cb7489..bd3feaed 100644
--- a/backend/domains/est/crash/src/entities/crash-person.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-person.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashPerson {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/entities/crash-record.entity.ts b/backend/domains/est/crash/src/entities/crash-record.entity.ts
index 90986d1b..5849c13a 100644
--- a/backend/domains/est/crash/src/entities/crash-record.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-record.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashRecord {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/entities/crash-renaest-submission.entity.ts b/backend/domains/est/crash/src/entities/crash-renaest-submission.entity.ts
index d869e9f9..ee11a72c 100644
--- a/backend/domains/est/crash/src/entities/crash-renaest-submission.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-renaest-submission.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashRenaestSubmission {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/entities/crash-report-document.entity.ts b/backend/domains/est/crash/src/entities/crash-report-document.entity.ts
new file mode 100644
index 00000000..d16c5b4a
--- /dev/null
+++ b/backend/domains/est/crash/src/entities/crash-report-document.entity.ts
@@ -0,0 +1,20 @@
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
+export interface CrashReportDocument {
+  id: string;
+  tenant_id: string;
+  crash_record_id: string;
+  document_kind: string;
+  template_key: string;
+  template_version: string;
+  policy_id: string;
+  storage_key: string;
+  content_hash: string;
+  byte_size: number;
+  signature_ref?: string | null;
+  pdfa_conformance: string;
+  pdfa_validation: Record<string, unknown>;
+  supersedes_document_id?: string | null;
+  sealed_at?: string | null;
+  created_at: string;
+  updated_at?: string | null;
+}
diff --git a/backend/domains/est/crash/src/entities/crash-scene-duty.entity.ts b/backend/domains/est/crash/src/entities/crash-scene-duty.entity.ts
index f5ac68b3..810a3d69 100644
--- a/backend/domains/est/crash/src/entities/crash-scene-duty.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-scene-duty.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashSceneDuty {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/entities/crash-sketch.entity.ts b/backend/domains/est/crash/src/entities/crash-sketch.entity.ts
index 3cf32ee4..b4fa7189 100644
--- a/backend/domains/est/crash/src/entities/crash-sketch.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-sketch.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashSketch {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/entities/crash-subject-request.entity.ts b/backend/domains/est/crash/src/entities/crash-subject-request.entity.ts
index d38ea395..4c0d4d1e 100644
--- a/backend/domains/est/crash/src/entities/crash-subject-request.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-subject-request.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashSubjectRequest {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/entities/crash-vehicle.entity.ts b/backend/domains/est/crash/src/entities/crash-vehicle.entity.ts
index dc4fe901..ec23c772 100644
--- a/backend/domains/est/crash/src/entities/crash-vehicle.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-vehicle.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashVehicle {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/entities/crash-victim.entity.ts b/backend/domains/est/crash/src/entities/crash-victim.entity.ts
index a5487ea0..e5a9c79d 100644
--- a/backend/domains/est/crash/src/entities/crash-victim.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-victim.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashVictim {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/entities/crash-witness.entity.ts b/backend/domains/est/crash/src/entities/crash-witness.entity.ts
index e05d0129..a9204f4d 100644
--- a/backend/domains/est/crash/src/entities/crash-witness.entity.ts
+++ b/backend/domains/est/crash/src/entities/crash-witness.entity.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export interface CrashWitness {
   id: string;
   tenant_id: string;
diff --git a/backend/domains/est/crash/src/handwritten/boat-commands.controller.ts b/backend/domains/est/crash/src/handwritten/boat-commands.controller.ts
index 1b33c024..7b894fca 100644
--- a/backend/domains/est/crash/src/handwritten/boat-commands.controller.ts
+++ b/backend/domains/est/crash/src/handwritten/boat-commands.controller.ts
@@ -4,11 +4,20 @@ import {
   Get,
   Headers,
   HttpCode,
+  Inject,
   Param,
   Post,
   Res,
 } from '@nestjs/common';
-import { Action, Audit, DetranError, Resource, etagOf } from '@detran/shared';
+import {
+  Action,
+  Audit,
+  DOCUMENTS_FACADE,
+  DetranError,
+  Resource,
+  etagOf,
+  type DocumentsFacade,
+} from '@detran/shared';

 import { BoatCrashCommandsService } from './boat-commands.service.js';

@@ -32,7 +41,10 @@ function requireMatch(header: string | undefined, version: number): void {
 @Controller('v1/est/crash')
 @Resource('est:crash-record')
 export class BoatCrashCommandsController {
-  constructor(private readonly commands: BoatCrashCommandsService) {}
+  constructor(
+    private readonly commands: BoatCrashCommandsService,
+    @Inject(DOCUMENTS_FACADE) private readonly documents: DocumentsFacade,
+  ) {}

   private async command(
     id: string,
@@ -250,18 +262,24 @@ export class BoatCrashCommandsController {
   }

   @Get('records/:id/report')
-  @Action('read')
-  report(
-    @Param('id') _id: string,
+  @Action('report')
+  async report(
+    @Param('id') id: string,
     @Res({ passthrough: true }) res: ResponseLike,
   ) {
-    // The concrete ADR-0018 façade is pending its owning scope. This keeps the
-    // legacy route response shape for now, but is not a PDF/A implementation.
+    const crash = await this.commands.current(id);
+    const rendered = await this.documents.render(
+      'est.crash.report.preliminary',
+      crash as unknown as Record<string, unknown>,
+    );
+    const sealed = await this.documents.seal(rendered.documentId);
+    const bytes = await this.documents.read(sealed.documentId);
     res.setHeader('Content-Type', 'application/pdf');
+    res.setHeader('ETag', `"sha256:${sealed.contentHash}"`);
     res.setHeader(
       'Content-Disposition',
-      'inline; filename="bat-preliminar.pdf"',
+      'inline; filename="relatorio-preliminar-sinistro.pdf"',
     );
-    return res.end(Buffer.from('%PDF-1.4\n% pdfaid:part 2\n%%EOF\n'));
+    return res.end(Buffer.from(bytes));
   }
 }
diff --git a/backend/domains/est/crash/src/handwritten/boat-commands.service.ts b/backend/domains/est/crash/src/handwritten/boat-commands.service.ts
index f45087fa..782fdd56 100644
--- a/backend/domains/est/crash/src/handwritten/boat-commands.service.ts
+++ b/backend/domains/est/crash/src/handwritten/boat-commands.service.ts
@@ -17,8 +17,11 @@ type Sql = {

 type CrashRow = {
   id: string;
+  traffic_agency_id: string;
   state: string;
   national_status: string | null;
+  occurred_at: string;
+  location_description: string | null;
   version: number;
 };

@@ -338,7 +341,11 @@ export class BoatCrashCommandsService {

   private async record(query: Sql, id: string): Promise<CrashRow> {
     const found = await query.query<CrashRow>(
-      'select id, state, national_status, version from est.crash_record where id = $1 for update',
+      `select id, traffic_agency_id, state, national_status,
+              occurred_at, location_description, version
+         from est.crash_record
+        where id = $1
+        for update`,
       [id],
     );
     if (!found.rows[0])
diff --git a/backend/domains/est/crash/src/index.ts b/backend/domains/est/crash/src/index.ts
index 22d02a1c..2d2b1ce0 100644
--- a/backend/domains/est/crash/src/index.ts
+++ b/backend/domains/est/crash/src/index.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 export * from './controllers/crash-record.controller.js';
 export * from './dto/create-crash-record.dto.js';
 export * from './entities/crash-record.entity.js';
@@ -54,5 +54,10 @@ export * from './dto/create-crash-subject-request.dto.js';
 export * from './entities/crash-subject-request.entity.js';
 export * from './repositories/crash-subject-request.repository.js';
 export * from './services/crash-subject-request.service.js';
+export * from './controllers/crash-report-document.controller.js';
+export * from './dto/create-crash-report-document.dto.js';
+export * from './entities/crash-report-document.entity.js';
+export * from './repositories/crash-report-document.repository.js';
+export * from './services/crash-report-document.service.js';
 export * from './crash.module.js';
 export * from './handwritten/index.js';
diff --git a/backend/domains/est/crash/src/repositories/crash-damage.repository.ts b/backend/domains/est/crash/src/repositories/crash-damage.repository.ts
index 31780cab..15cb6114 100644
--- a/backend/domains/est/crash/src/repositories/crash-damage.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-damage.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/repositories/crash-link.repository.ts b/backend/domains/est/crash/src/repositories/crash-link.repository.ts
index 104dd67e..bf192c17 100644
--- a/backend/domains/est/crash/src/repositories/crash-link.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-link.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/repositories/crash-person.repository.ts b/backend/domains/est/crash/src/repositories/crash-person.repository.ts
index 318bfe8b..7e2af998 100644
--- a/backend/domains/est/crash/src/repositories/crash-person.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-person.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/repositories/crash-record.repository.ts b/backend/domains/est/crash/src/repositories/crash-record.repository.ts
index 4e6fbcd5..5f70929b 100644
--- a/backend/domains/est/crash/src/repositories/crash-record.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-record.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/repositories/crash-renaest-submission.repository.ts b/backend/domains/est/crash/src/repositories/crash-renaest-submission.repository.ts
index 0af3e0ed..d7b08d48 100644
--- a/backend/domains/est/crash/src/repositories/crash-renaest-submission.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-renaest-submission.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/repositories/crash-report-document.repository.ts b/backend/domains/est/crash/src/repositories/crash-report-document.repository.ts
new file mode 100644
index 00000000..c6bd651e
--- /dev/null
+++ b/backend/domains/est/crash/src/repositories/crash-report-document.repository.ts
@@ -0,0 +1,137 @@
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
+import { Injectable, NotFoundException } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import { withTenantContext } from '@detran/shared';
+import type { CreateCrashReportDocumentDto } from '../dto/create-crash-report-document.dto.js';
+import type { CrashReportDocument } from '../entities/crash-report-document.entity.js';
+
+type SqlTransaction = Transaction & {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+};
+const WRITABLE_FIELDS = new Set<string>([
+  'crash_record_id',
+  'document_kind',
+  'template_key',
+  'template_version',
+  'policy_id',
+  'storage_key',
+  'content_hash',
+  'byte_size',
+  'signature_ref',
+  'pdfa_conformance',
+  'pdfa_validation',
+  'supersedes_document_id',
+]);
+
+/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
+@Injectable()
+export class CrashReportDocumentRepository {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
+    return withTenantContext(this.database, this.requestContext, work);
+  }
+  findAll(transaction?: Transaction): Promise<CrashReportDocument[]> {
+    return this.execute(
+      transaction,
+      async (tx) =>
+        (
+          await tx.query<CrashReportDocument & Record<string, unknown>>(
+            'select * from est.crash_report_document order by created_at desc limit 500',
+          )
+        ).rows,
+    );
+  }
+  async findOne(
+    id: string,
+    transaction?: Transaction,
+  ): Promise<CrashReportDocument> {
+    const result = await this.execute(transaction, (tx) =>
+      tx.query<CrashReportDocument & Record<string, unknown>>(
+        'select * from est.crash_report_document where id = $1 limit 1',
+        [id],
+      ),
+    );
+    const row = result.rows[0];
+    if (!row)
+      throw new NotFoundException('CrashReportDocument ' + id + ' not found');
+    return row;
+  }
+  create(
+    dto: CreateCrashReportDocumentDto,
+    transaction?: Transaction,
+  ): Promise<CrashReportDocument> {
+    return this.write('insert', undefined, dto, transaction);
+  }
+  update(
+    id: string,
+    dto: Partial<CreateCrashReportDocumentDto>,
+    transaction?: Transaction,
+  ): Promise<CrashReportDocument> {
+    return this.write('update', id, dto, transaction);
+  }
+  async remove(id: string, transaction?: Transaction): Promise<void> {
+    const result = await this.execute(transaction, (tx) =>
+      tx.query(
+        'delete from est.crash_report_document where id = $1 returning id',
+        [id],
+      ),
+    );
+    if (!result.rows[0])
+      throw new NotFoundException('CrashReportDocument ' + id + ' not found');
+  }
+  private async write(
+    operation: 'insert' | 'update',
+    id: string | undefined,
+    dto: Partial<CreateCrashReportDocumentDto>,
+    transaction?: Transaction,
+  ): Promise<CrashReportDocument> {
+    const entries = Object.entries(dto).filter(
+      ([, value]) => value !== undefined,
+    );
+    if (
+      !entries.length ||
+      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
+    )
+      throw new Error('Invalid CrashReportDocument write fields');
+    const columns = entries.map(([field]) => field);
+    const values = entries.map(([, value]) => value);
+    const insertSql =
+      'insert into est.crash_report_document (' +
+      columns.join(', ') +
+      ') values (' +
+      columns.map((_, index) => '$' + (index + 1)).join(', ') +
+      ') returning *';
+    const updateSql =
+      'update est.crash_report_document set ' +
+      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
+      ', updated_at = now() where id = $' +
+      (columns.length + 1) +
+      ' returning *';
+    const result = await this.execute(transaction, (tx) =>
+      tx.query<CrashReportDocument & Record<string, unknown>>(
+        operation === 'insert' ? insertSql : updateSql,
+        operation === 'insert' ? values : [...values, id],
+      ),
+    );
+    const row = result.rows[0];
+    if (!row)
+      throw new NotFoundException('CrashReportDocument ' + id + ' not found');
+    return row;
+  }
+  private execute<T>(
+    transaction: Transaction | undefined,
+    work: (transaction: SqlTransaction) => Promise<T>,
+  ): Promise<T> {
+    if (transaction) return work(transaction as SqlTransaction);
+    return withTenantContext(this.database, this.requestContext, (tx) =>
+      work(tx as SqlTransaction),
+    );
+  }
+}
diff --git a/backend/domains/est/crash/src/repositories/crash-scene-duty.repository.ts b/backend/domains/est/crash/src/repositories/crash-scene-duty.repository.ts
index 111dc9ec..7c26ba09 100644
--- a/backend/domains/est/crash/src/repositories/crash-scene-duty.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-scene-duty.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/repositories/crash-sketch.repository.ts b/backend/domains/est/crash/src/repositories/crash-sketch.repository.ts
index 30644e1f..9f3017d4 100644
--- a/backend/domains/est/crash/src/repositories/crash-sketch.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-sketch.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/repositories/crash-subject-request.repository.ts b/backend/domains/est/crash/src/repositories/crash-subject-request.repository.ts
index c59bccb3..c2cc27b1 100644
--- a/backend/domains/est/crash/src/repositories/crash-subject-request.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-subject-request.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/repositories/crash-vehicle.repository.ts b/backend/domains/est/crash/src/repositories/crash-vehicle.repository.ts
index a3e90575..faeea075 100644
--- a/backend/domains/est/crash/src/repositories/crash-vehicle.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-vehicle.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/repositories/crash-victim.repository.ts b/backend/domains/est/crash/src/repositories/crash-victim.repository.ts
index 335dab70..00d8cc49 100644
--- a/backend/domains/est/crash/src/repositories/crash-victim.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-victim.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/repositories/crash-witness.repository.ts b/backend/domains/est/crash/src/repositories/crash-witness.repository.ts
index 6fc7e68b..72cd8ff0 100644
--- a/backend/domains/est/crash/src/repositories/crash-witness.repository.ts
+++ b/backend/domains/est/crash/src/repositories/crash-witness.repository.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable, NotFoundException } from '@nestjs/common';
 import { RequestContext } from '@stynx-nyx/core';
 import { Database, type Transaction } from '@stynx-nyx/data';
diff --git a/backend/domains/est/crash/src/services/crash-damage.service.ts b/backend/domains/est/crash/src/services/crash-damage.service.ts
index e4edf310..a6854fe5 100644
--- a/backend/domains/est/crash/src/services/crash-damage.service.ts
+++ b/backend/domains/est/crash/src/services/crash-damage.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashDamageRepository } from '../repositories/crash-damage.repository.js';
 import type { CrashDamage } from '../entities/crash-damage.entity.js';
diff --git a/backend/domains/est/crash/src/services/crash-link.service.ts b/backend/domains/est/crash/src/services/crash-link.service.ts
index f71bf549..c7c5af45 100644
--- a/backend/domains/est/crash/src/services/crash-link.service.ts
+++ b/backend/domains/est/crash/src/services/crash-link.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashLinkRepository } from '../repositories/crash-link.repository.js';
 import type { CrashLink } from '../entities/crash-link.entity.js';
diff --git a/backend/domains/est/crash/src/services/crash-person.service.ts b/backend/domains/est/crash/src/services/crash-person.service.ts
index 4f4c1074..92223103 100644
--- a/backend/domains/est/crash/src/services/crash-person.service.ts
+++ b/backend/domains/est/crash/src/services/crash-person.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashPersonRepository } from '../repositories/crash-person.repository.js';
 import type { CrashPerson } from '../entities/crash-person.entity.js';
diff --git a/backend/domains/est/crash/src/services/crash-record.service.ts b/backend/domains/est/crash/src/services/crash-record.service.ts
index 6c7ace7c..418379e4 100644
--- a/backend/domains/est/crash/src/services/crash-record.service.ts
+++ b/backend/domains/est/crash/src/services/crash-record.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashRecordRepository } from '../repositories/crash-record.repository.js';
 import type { CrashRecord } from '../entities/crash-record.entity.js';
diff --git a/backend/domains/est/crash/src/services/crash-renaest-submission.service.ts b/backend/domains/est/crash/src/services/crash-renaest-submission.service.ts
index e75f2cb1..f7525199 100644
--- a/backend/domains/est/crash/src/services/crash-renaest-submission.service.ts
+++ b/backend/domains/est/crash/src/services/crash-renaest-submission.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashRenaestSubmissionRepository } from '../repositories/crash-renaest-submission.repository.js';
 import type { CrashRenaestSubmission } from '../entities/crash-renaest-submission.entity.js';
diff --git a/backend/domains/est/crash/src/services/crash-report-document.service.ts b/backend/domains/est/crash/src/services/crash-report-document.service.ts
new file mode 100644
index 00000000..c28e0085
--- /dev/null
+++ b/backend/domains/est/crash/src/services/crash-report-document.service.ts
@@ -0,0 +1,28 @@
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
+import { Injectable } from '@nestjs/common';
+import { CrashReportDocumentRepository } from '../repositories/crash-report-document.repository.js';
+import type { CrashReportDocument } from '../entities/crash-report-document.entity.js';
+import type { CreateCrashReportDocumentDto } from '../dto/create-crash-report-document.dto.js';
+
+@Injectable()
+export class CrashReportDocumentService {
+  constructor(private readonly repository: CrashReportDocumentRepository) {}
+  findAll(): Promise<CrashReportDocument[]> {
+    return this.repository.findAll();
+  }
+  findOne(id: string): Promise<CrashReportDocument> {
+    return this.repository.findOne(id);
+  }
+  create(dto: CreateCrashReportDocumentDto): Promise<CrashReportDocument> {
+    return this.repository.create(dto);
+  }
+  update(
+    id: string,
+    dto: Partial<CreateCrashReportDocumentDto>,
+  ): Promise<CrashReportDocument> {
+    return this.repository.update(id, dto);
+  }
+  remove(id: string): Promise<void> {
+    return this.repository.remove(id);
+  }
+}
diff --git a/backend/domains/est/crash/src/services/crash-scene-duty.service.ts b/backend/domains/est/crash/src/services/crash-scene-duty.service.ts
index 3ed32aec..da930c3d 100644
--- a/backend/domains/est/crash/src/services/crash-scene-duty.service.ts
+++ b/backend/domains/est/crash/src/services/crash-scene-duty.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashSceneDutyRepository } from '../repositories/crash-scene-duty.repository.js';
 import type { CrashSceneDuty } from '../entities/crash-scene-duty.entity.js';
diff --git a/backend/domains/est/crash/src/services/crash-sketch.service.ts b/backend/domains/est/crash/src/services/crash-sketch.service.ts
index 11f83cc2..f3e88579 100644
--- a/backend/domains/est/crash/src/services/crash-sketch.service.ts
+++ b/backend/domains/est/crash/src/services/crash-sketch.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashSketchRepository } from '../repositories/crash-sketch.repository.js';
 import type { CrashSketch } from '../entities/crash-sketch.entity.js';
diff --git a/backend/domains/est/crash/src/services/crash-subject-request.service.ts b/backend/domains/est/crash/src/services/crash-subject-request.service.ts
index 7c394660..016d2e50 100644
--- a/backend/domains/est/crash/src/services/crash-subject-request.service.ts
+++ b/backend/domains/est/crash/src/services/crash-subject-request.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashSubjectRequestRepository } from '../repositories/crash-subject-request.repository.js';
 import type { CrashSubjectRequest } from '../entities/crash-subject-request.entity.js';
diff --git a/backend/domains/est/crash/src/services/crash-vehicle.service.ts b/backend/domains/est/crash/src/services/crash-vehicle.service.ts
index 6e14539d..d67c0df6 100644
--- a/backend/domains/est/crash/src/services/crash-vehicle.service.ts
+++ b/backend/domains/est/crash/src/services/crash-vehicle.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashVehicleRepository } from '../repositories/crash-vehicle.repository.js';
 import type { CrashVehicle } from '../entities/crash-vehicle.entity.js';
diff --git a/backend/domains/est/crash/src/services/crash-victim.service.ts b/backend/domains/est/crash/src/services/crash-victim.service.ts
index 857087b6..0e8d7303 100644
--- a/backend/domains/est/crash/src/services/crash-victim.service.ts
+++ b/backend/domains/est/crash/src/services/crash-victim.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashVictimRepository } from '../repositories/crash-victim.repository.js';
 import type { CrashVictim } from '../entities/crash-victim.entity.js';
diff --git a/backend/domains/est/crash/src/services/crash-witness.service.ts b/backend/domains/est/crash/src/services/crash-witness.service.ts
index 00dcd267..2e1ca07a 100644
--- a/backend/domains/est/crash/src/services/crash-witness.service.ts
+++ b/backend/domains/est/crash/src/services/crash-witness.service.ts
@@ -1,4 +1,4 @@
-// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
+// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
 import { Injectable } from '@nestjs/common';
 import { CrashWitnessRepository } from '../repositories/crash-witness.repository.js';
 import type { CrashWitness } from '../entities/crash-witness.entity.js';
diff --git a/backend/domains/est/crash/tests/integration/boat-contract.integration.spec.ts b/backend/domains/est/crash/tests/integration/boat-contract.integration.spec.ts
index 53dc6274..fc0eed25 100644
--- a/backend/domains/est/crash/tests/integration/boat-contract.integration.spec.ts
+++ b/backend/domains/est/crash/tests/integration/boat-contract.integration.spec.ts
@@ -112,7 +112,7 @@ describe('contrato persistente BOAT est/crash', () => {
       ),
     ) as { module: { namespace: string }; database: { entities: unknown[] } };
     expect(blueprint.module.namespace).toBe('est');
-    expect(blueprint.database.entities).toHaveLength(11);
+    expect(blueprint.database.entities).toHaveLength(12);
     const ddl = readFileSync(
       new URL(
         '../../../../../../backend/database/ddl/70-est-crash.sql',
diff --git a/backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts b/backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts
index 9c767992..e5be63d8 100644
--- a/backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts
+++ b/backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts
@@ -211,14 +211,14 @@ async function inventory(): Promise<string[]> {
   const files = JSON.parse(encoded) as unknown;
   if (
     !Array.isArray(files) ||
-    files.length !== 57 ||
+    files.length !== 60 ||
     files.some(
       (file) =>
         typeof file !== 'string' || !/^[0-9][0-9A-Za-z-]*\.sql$/u.test(file),
     ) ||
     new Set(files).size !== files.length
   )
-    throw new Error('The closed 57-DDL inventory is incomplete');
+    throw new Error('The closed 60-DDL inventory is incomplete');
   return files;
 }

@@ -589,11 +589,11 @@ describe('CTG-0001-C4-OD V3 pre-SQL static apply contract', () => {
     expect(source).toContain('--single-transaction');
     expect(source).toContain('pg_advisory_xact_lock(7007, 1)');
     const listed = await inventory();
-    expect(new Set(listed).size).toBe(57);
+    expect(new Set(listed).size).toBe(60);
     const directory = await isolatedCopy(true);
     try {
       const copied = await readdir(join(directory, 'ddl'));
-      expect(copied.length).toBe(60);
+      expect(copied.length).toBe(63);
       expect(
         copied.filter((name) => name === '20-rls-policies.sql'),
       ).toHaveLength(1);
diff --git a/backend/domains/inf/rait-worklist/tests/integration/rait-worklist-corrective.integration.spec.ts b/backend/domains/inf/rait-worklist/tests/integration/rait-worklist-corrective.integration.spec.ts
index ee4d1f46..93d47e45 100644
--- a/backend/domains/inf/rait-worklist/tests/integration/rait-worklist-corrective.integration.spec.ts
+++ b/backend/domains/inf/rait-worklist/tests/integration/rait-worklist-corrective.integration.spec.ts
@@ -103,6 +103,10 @@ describe('CTG-0002 worklist corrective database boundary', () => {
         ),
       ).rejects.toMatchObject({ code: '42501' });
       await client.query('rollback to savepoint ctg2_worklist_rls_denial');
+      // Compare the same owner-visible evidence set captured before the RLS
+      // denial.  The application role intentionally sees zero rows without a
+      // tenant context, which is the boundary exercised above.
+      await client.query('reset role');
       const after = await client.query<{ outbox: string; audit: string }>(
         `select
            (select count(*)::text from integration.outbox where tenant_id = $1) as outbox,
diff --git a/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts b/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts
index 43b1113b..3209e686 100644
--- a/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts
+++ b/backend/domains/ops/parameter/src/generated/parameter-catalogue.ts
@@ -1,6 +1,6 @@
-// Generated from parameter-catalogue.md sha256:025f5a83ef53ac570b493095a8be1633daca44d0402b226e48448accaa1007ad
+// Generated from parameter-catalogue.md sha256:27768a0cd60acfe911acd5ee08fca371476c85ec328014e39dfdb6b90d455dec
 export const PARAMETER_CATALOGUE_SOURCE_SHA256 =
-  '025f5a83ef53ac570b493095a8be1633daca44d0402b226e48448accaa1007ad';
+  '27768a0cd60acfe911acd5ee08fca371476c85ec328014e39dfdb6b90d455dec';
 export const PARAMETER_CATALOGUE = [
   {
     key: 'rait.wip.limit',
diff --git a/backend/domains/shared/src/documents/document-kind.ts b/backend/domains/shared/src/documents/document-kind.ts
index 3debdecd..0182740b 100644
--- a/backend/domains/shared/src/documents/document-kind.ts
+++ b/backend/domains/shared/src/documents/document-kind.ts
@@ -17,6 +17,7 @@ export const DOCUMENT_KINDS = [
   'ORDEM_RESTITUICAO',
   'COMPROVANTE_PROTOCOLO',
   'CERTIDAO',
+  'RELATORIO_PRELIMINAR_SINISTRO',
 ] as const;

 export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
diff --git a/backend/domains/shared/src/documents/documents-facade.ts b/backend/domains/shared/src/documents/documents-facade.ts
index a063503f..5b51be82 100644
--- a/backend/domains/shared/src/documents/documents-facade.ts
+++ b/backend/domains/shared/src/documents/documents-facade.ts
@@ -24,7 +24,8 @@ export interface SignedDocument extends RenderedDocument {
   readonly signatureRef: string;
 }

-export interface SealedDocument extends SignedDocument {
+export interface SealedDocument extends RenderedDocument {
+  readonly signatureRef: string | null;
   readonly pdfaConformance: PdfaConformance;
   readonly sealedAt: string;
 }
@@ -43,8 +44,11 @@ export interface DocumentsFacade {
   ): Promise<RenderedDocument>;
   sign(documentId: string, signer: DocumentSigner): Promise<SignedDocument>;
   seal(documentId: string): Promise<SealedDocument>;
+  read(documentId: string): Promise<Uint8Array>;
 }

+export const DOCUMENTS_FACADE = Symbol.for('detran.documents.facade');
+
 /**
  * Três códigos já existentes no catálogo (rait-error-catalog.md §3.5-§3.6),
  * levantados pela fachada (ADR-0018 §Consequências) — nenhum código novo
diff --git a/backend/domains/shared/src/documents/documents.spec.ts b/backend/domains/shared/src/documents/documents.spec.ts
index 58e2f968..5debfab2 100644
--- a/backend/domains/shared/src/documents/documents.spec.ts
+++ b/backend/domains/shared/src/documents/documents.spec.ts
@@ -23,8 +23,8 @@ import {
   type SignerRequirement,
 } from '../documents/index.js';

-describe('DocumentKind (ADR-0018 §Decision 2 — 12 tokens canônicos, sem tradução)', () => {
-  it('dado o catálogo DOCUMENT_KINDS quando lido então tem exatamente os 12 tokens, na ordem da especificação', () => {
+describe('DocumentKind (ADR-0018 §Decision 2 — 13 tokens canônicos, sem tradução)', () => {
+  it('dado o catálogo DOCUMENT_KINDS quando lido então tem exatamente os 13 tokens, na ordem da especificação', () => {
     expect(DOCUMENT_KINDS).toEqual([
       'AIT',
       'NA',
@@ -38,8 +38,9 @@ describe('DocumentKind (ADR-0018 §Decision 2 — 12 tokens canônicos, sem trad
       'ORDEM_RESTITUICAO',
       'COMPROVANTE_PROTOCOLO',
       'CERTIDAO',
+      'RELATORIO_PRELIMINAR_SINISTRO',
     ]);
-    expect(DOCUMENT_KINDS).toHaveLength(12);
+    expect(DOCUMENT_KINDS).toHaveLength(13);
   });

   it('dado o tipo DocumentKind quando comparado então é a união literal dos 12 tokens de DOCUMENT_KINDS', () => {
@@ -70,8 +71,8 @@ describe('SignaturePolicy (ADR-0018 §Decision 3 — política é dado, não có
     }>();
   });

-  it('dado o tipo PadesLevel quando comparado então é a união de um membro PAdES-B-LT (única exigência com fonte no corpus)', () => {
-    expectTypeOf<PadesLevel>().toEqualTypeOf<'PAdES-B-LT'>();
+  it('dado o tipo PadesLevel quando comparado então inclui ausência aprovada e PAdES-B-LT', () => {
+    expectTypeOf<PadesLevel>().toEqualTypeOf<'NONE' | 'PAdES-B-LT'>();
   });
 });

@@ -95,6 +96,9 @@ describe('DocumentsFacade (ADR-0018 §Decision 1 e 4 — render/sign/seal, tenan
     expectTypeOf<DocumentsFacade['seal']>().returns.toEqualTypeOf<
       Promise<SealedDocument>
     >();
+    expectTypeOf<DocumentsFacade['read']>().returns.toEqualTypeOf<
+      Promise<Uint8Array>
+    >();
   });

   it('dado o tipo RenderedDocument quando comparado então tem documentId, kind, storageKey, contentHash, pdfaConformance e supersedesDocumentId', () => {
@@ -108,9 +112,10 @@ describe('DocumentsFacade (ADR-0018 §Decision 1 e 4 — render/sign/seal, tenan
     }>();
   });

-  it('dado o tipo SealedDocument quando comparado então estende SignedDocument com pdfaConformance obrigatório e sealedAt', () => {
+  it('dado o tipo SealedDocument quando comparado então aceita selo técnico sem assinatura', () => {
     expectTypeOf<SealedDocument>().toMatchTypeOf<
-      SignedDocument & {
+      RenderedDocument & {
+        readonly signatureRef: string | null;
         readonly pdfaConformance: PdfaConformance;
         readonly sealedAt: string;
       }
diff --git a/backend/domains/shared/src/documents/signature-policy.ts b/backend/domains/shared/src/documents/signature-policy.ts
index f9e0ccb6..faf0a6bc 100644
--- a/backend/domains/shared/src/documents/signature-policy.ts
+++ b/backend/domains/shared/src/documents/signature-policy.ts
@@ -11,7 +11,7 @@ import type { DocumentKind } from './document-kind.js';
  * PAdES-B-LT + TSA para decisões e atas (steering A.8). Outros níveis são
  * OD proposta — a união cresce quando a decisão existir.
  */
-export type PadesLevel = 'PAdES-B-LT';
+export type PadesLevel = 'NONE' | 'PAdES-B-LT';

 /** Conformidade validada por @stynx-nyx/pdf-a (ADR-0018 Context). */
 export type PdfaConformance = 'PDF/A-2b';
diff --git a/backend/domains/shared/src/policy.spec.ts b/backend/domains/shared/src/policy.spec.ts
index 502a22ca..3082d7be 100644
--- a/backend/domains/shared/src/policy.spec.ts
+++ b/backend/domains/shared/src/policy.spec.ts
@@ -60,6 +60,10 @@ describe('DETRAN unified policy kit', () => {
           : [[`est:${resource}:create`, []] as [string, string[]]]),
       ]),
       ['est:crash-record:start', ['field-agent']],
+      [
+        'est:crash-record:report',
+        ['field-agent', 'processing-operator', 'traffic-authority'],
+      ],
       ['est:crash-record:add-vehicle', ['field-agent']],
       ['est:crash-record:add-person', ['field-agent']],
       ['est:crash-record:add-victim', ['field-agent']],
diff --git a/backend/domains/shared/src/policy.ts b/backend/domains/shared/src/policy.ts
index d2347edd..9b4c1ee4 100644
--- a/backend/domains/shared/src/policy.ts
+++ b/backend/domains/shared/src/policy.ts
@@ -506,6 +506,11 @@ const EST_COMMAND_RULES: Array<[string, string, readonly DetranRole[]]> = [
   ['crash-record', 'cancel', ['field-agent', 'traffic-authority']],
   ['crash-record', 'transmit', ['processing-operator', 'traffic-authority']],
   ['crash-record', 'rectify', ['processing-operator', 'traffic-authority']],
+  [
+    'crash-record',
+    'report',
+    ['field-agent', 'processing-operator', 'traffic-authority'],
+  ],
   ['crash-record', 'archive', ['traffic-authority']],
   [
     'crash-subject-request',
diff --git a/docs/framework/arch/parameter-catalogue.md b/docs/framework/arch/parameter-catalogue.md
index 2c3ba83c..54d9329b 100644
--- a/docs/framework/arch/parameter-catalogue.md
+++ b/docs/framework/arch/parameter-catalogue.md
@@ -131,29 +131,32 @@ registro em `open-decisions-rait.md`, nos §4 dos build packs ou em `open-issues

 ## Namespaces i18n (allowlist do verificador)

-Uma chave i18n não é um parâmetro: ela não entra nas cinco tabelas acima. Um namespace de
-i18n entra nesta tabela somente para que `verify:parameter-catalogue --check-usage`
+Uma chave de catálogo que não representa parâmetro (como i18n ou template documental) não entra
+nas cinco tabelas acima. Seu namespace entra nesta tabela somente para que
+`verify:parameter-catalogue --check-usage`
 (`tools/parameters/verify.mjs`) deixe de tratar seus literais como candidato a parâmetro
-desconhecido — nunca por exclusão de diretório. Origem: `OD-P46`
+desconhecido — nunca por exclusão de diretório. Para i18n, a origem é `OD-P46`
 (`docs/framework/arch/portal-build-pack.md` §4) e método §4.17
-(`docs/meta/agents/orchestra/README.md`).
-
-| Namespace              | App               | Catálogo                         | Decisão |
-| ---------------------- | ----------------- | -------------------------------- | ------- |
-| `portal.shell`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.common`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.states`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.errors`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.situation`     | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.screens`       | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.forms`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.legal`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.requests`      | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.evaluations`   | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.notifications` | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.documents`     | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.services`      | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
-| `portal.a11y`          | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json` | OD-P46  |
+(`docs/meta/agents/orchestra/README.md`); para template documental, a decisão e o catálogo
+autoridade aparecem na própria linha.
+
+| Namespace              | App               | Catálogo                          | Decisão |
+| ---------------------- | ----------------- | --------------------------------- | ------- |
+| `portal.shell`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.common`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.states`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.errors`        | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.situation`     | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.screens`       | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.forms`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.legal`         | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.requests`      | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.evaluations`   | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.notifications` | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.documents`     | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.services`      | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `portal.a11y`          | `apps/portal/web` | `src/app/i18n/portal.pt-BR.json`  | OD-P46  |
+| `est.crash`            | `backend/app`     | `inf.normative_document_template` | OD-B08  |

 ## Regras do catálogo

diff --git a/docs/framework/blueprints/BP-EST-CRASH-001.json b/docs/framework/blueprints/BP-EST-CRASH-001.json
index 440a7619..afaadc1c 100644
--- a/docs/framework/blueprints/BP-EST-CRASH-001.json
+++ b/docs/framework/blueprints/BP-EST-CRASH-001.json
@@ -29,41 +29,124 @@
         "table": "crash_record",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "crash_type", "type": "varchar(120)" },
-          { "name": "severity", "type": "varchar(60)" },
-          { "name": "state", "type": "varchar(60)", "default": "'RASCUNHO'" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_type",
+            "type": "varchar(120)"
+          },
+          {
+            "name": "severity",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "state",
+            "type": "varchar(60)",
+            "default": "'RASCUNHO'"
+          },
           {
             "name": "national_status",
             "type": "varchar(60)",
             "nullable": true,
             "writable": false
           },
-          { "name": "occurred_at", "type": "timestamptz" },
-          { "name": "recorded_at", "type": "timestamptz" },
-          { "name": "location_description", "type": "text" },
-          { "name": "location_json", "type": "jsonb", "nullable": true },
+          {
+            "name": "occurred_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "recorded_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "location_description",
+            "type": "text"
+          },
+          {
+            "name": "location_json",
+            "type": "jsonb",
+            "nullable": true
+          },
           {
             "name": "location_reference",
             "type": "varchar(255)",
             "nullable": true
           },
-          { "name": "municipality_code", "type": "varchar(20)" },
-          { "name": "uf", "type": "varchar(2)" },
-          { "name": "road", "type": "varchar(160)", "nullable": true },
-          { "name": "km", "type": "varchar(40)", "nullable": true },
-          { "name": "direction", "type": "varchar(120)", "nullable": true },
-          { "name": "road_condition", "type": "varchar(120)" },
-          { "name": "weather_condition", "type": "varchar(120)" },
-          { "name": "lighting_condition", "type": "varchar(120)" },
-          { "name": "signage_condition", "type": "varchar(120)" },
-          { "name": "dynamics_description", "type": "text", "nullable": true },
-          { "name": "shift_id", "type": "uuid", "nullable": true },
-          { "name": "device_id", "type": "varchar(120)", "nullable": true },
-          { "name": "operation_id", "type": "uuid", "nullable": true },
-          { "name": "source_system", "type": "varchar(80)", "nullable": true },
+          {
+            "name": "municipality_code",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "uf",
+            "type": "varchar(2)"
+          },
+          {
+            "name": "road",
+            "type": "varchar(160)",
+            "nullable": true
+          },
+          {
+            "name": "km",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "direction",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "road_condition",
+            "type": "varchar(120)"
+          },
+          {
+            "name": "weather_condition",
+            "type": "varchar(120)"
+          },
+          {
+            "name": "lighting_condition",
+            "type": "varchar(120)"
+          },
+          {
+            "name": "signage_condition",
+            "type": "varchar(120)"
+          },
+          {
+            "name": "dynamics_description",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "shift_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "device_id",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "operation_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "source_system",
+            "type": "varchar(80)",
+            "nullable": true
+          },
           {
             "name": "source_local_id",
             "type": "varchar(120)",
@@ -79,7 +162,11 @@
             "type": "varchar(128)",
             "nullable": true
           },
-          { "name": "version", "type": "integer", "default": "1" }
+          {
+            "name": "version",
+            "type": "integer",
+            "default": "1"
+          }
         ],
         "checks": [
           {
@@ -158,10 +245,24 @@
         "table": "crash_vehicle",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "crash_record_id", "type": "uuid" },
-          { "name": "vehicle_snapshot_id", "type": "uuid", "nullable": true },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid"
+          },
+          {
+            "name": "vehicle_snapshot_id",
+            "type": "uuid",
+            "nullable": true
+          },
           {
             "name": "plate",
             "type": "varchar(20)",
@@ -169,10 +270,24 @@
             "pii": "high",
             "retention": "est.retention.bat_years"
           },
-          { "name": "role", "type": "varchar(60)" },
-          { "name": "sequence", "type": "integer" },
-          { "name": "apparent_damage", "type": "text", "nullable": true },
-          { "name": "notes", "type": "text", "nullable": true }
+          {
+            "name": "role",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "sequence",
+            "type": "integer"
+          },
+          {
+            "name": "apparent_damage",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "notes",
+            "type": "text",
+            "nullable": true
+          }
         ],
         "indexes": [
           {
@@ -185,7 +300,10 @@
           {
             "name": "fk_est_crash_vehicle_record",
             "columns": ["crash_record_id"],
-            "references": { "table": "est.crash_record", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -194,10 +312,24 @@
         "table": "crash_person",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "crash_record_id", "type": "uuid" },
-          { "name": "person_id", "type": "uuid", "nullable": true },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid"
+          },
+          {
+            "name": "person_id",
+            "type": "uuid",
+            "nullable": true
+          },
           {
             "name": "name",
             "type": "varchar(160)",
@@ -217,15 +349,30 @@
             "type": "varchar(80)",
             "nullable": true
           },
-          { "name": "crash_vehicle_id", "type": "uuid", "nullable": true },
-          { "name": "role", "type": "varchar(40)" },
+          {
+            "name": "crash_vehicle_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "role",
+            "type": "varchar(40)"
+          },
           {
             "name": "used_seatbelt_or_helmet",
             "type": "boolean",
             "nullable": true
           },
-          { "name": "refused_data", "type": "boolean", "default": "false" },
-          { "name": "notes", "type": "text", "nullable": true }
+          {
+            "name": "refused_data",
+            "type": "boolean",
+            "default": "false"
+          },
+          {
+            "name": "notes",
+            "type": "text",
+            "nullable": true
+          }
         ],
         "checks": [
           {
@@ -237,12 +384,18 @@
           {
             "name": "fk_est_crash_person_record",
             "columns": ["crash_record_id"],
-            "references": { "table": "est.crash_record", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_est_crash_person_vehicle",
             "columns": ["crash_vehicle_id"],
-            "references": { "table": "est.crash_vehicle", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_vehicle",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -251,9 +404,19 @@
         "table": "crash_victim",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "crash_record_id", "type": "uuid" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid"
+          },
           {
             "name": "crash_person_id",
             "type": "uuid",
@@ -312,12 +475,18 @@
           {
             "name": "fk_est_crash_victim_record",
             "columns": ["crash_record_id"],
-            "references": { "table": "est.crash_record", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_est_crash_victim_person",
             "columns": ["crash_person_id"],
-            "references": { "table": "est.crash_person", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_person",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_est_crash_victim_severity",
@@ -334,15 +503,46 @@
         "table": "crash_scene_duty",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "crash_record_id", "type": "uuid" },
-          { "name": "regime", "type": "varchar(20)" },
-          { "name": "duty_code", "type": "varchar(20)" },
-          { "name": "crash_person_id", "type": "uuid", "nullable": true },
-          { "name": "crash_vehicle_id", "type": "uuid", "nullable": true },
-          { "name": "complied", "type": "boolean" },
-          { "name": "note", "type": "text", "nullable": true }
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid"
+          },
+          {
+            "name": "regime",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "duty_code",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "crash_person_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "crash_vehicle_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "complied",
+            "type": "boolean"
+          },
+          {
+            "name": "note",
+            "type": "text",
+            "nullable": true
+          }
         ],
         "checks": [
           {
@@ -354,22 +554,34 @@
           {
             "name": "fk_est_crash_scene_duty_record",
             "columns": ["crash_record_id"],
-            "references": { "table": "est.crash_record", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_est_crash_scene_duty_code",
             "columns": ["duty_code"],
-            "references": { "table": "est.scene_duty_ref", "columns": ["code"] }
+            "references": {
+              "table": "est.scene_duty_ref",
+              "columns": ["code"]
+            }
           },
           {
             "name": "fk_est_crash_scene_duty_person",
             "columns": ["crash_person_id"],
-            "references": { "table": "est.crash_person", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_person",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_est_crash_scene_duty_vehicle",
             "columns": ["crash_vehicle_id"],
-            "references": { "table": "est.crash_vehicle", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_vehicle",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -378,23 +590,46 @@
         "table": "crash_damage",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "crash_record_id", "type": "uuid" },
-          { "name": "asset_kind", "type": "varchar(60)" },
-          { "name": "description", "type": "text" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid"
+          },
+          {
+            "name": "asset_kind",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "description",
+            "type": "text"
+          },
           {
             "name": "responsible_identified",
             "type": "boolean",
             "nullable": true
           },
-          { "name": "notify_road_owner", "type": "boolean", "nullable": true }
+          {
+            "name": "notify_road_owner",
+            "type": "boolean",
+            "nullable": true
+          }
         ],
         "foreignKeys": [
           {
             "name": "fk_est_crash_damage_record",
             "columns": ["crash_record_id"],
-            "references": { "table": "est.crash_record", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_est_crash_damage_asset_kind",
@@ -411,9 +646,19 @@
         "table": "crash_witness",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "crash_record_id", "type": "uuid" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid"
+          },
           {
             "name": "name",
             "type": "varchar(160)",
@@ -427,14 +672,25 @@
             "pii": "high",
             "retention": "est.retention.bat_years"
           },
-          { "name": "refused", "type": "boolean", "default": "false" },
-          { "name": "statement_summary", "type": "text", "nullable": true }
+          {
+            "name": "refused",
+            "type": "boolean",
+            "default": "false"
+          },
+          {
+            "name": "statement_summary",
+            "type": "text",
+            "nullable": true
+          }
         ],
         "foreignKeys": [
           {
             "name": "fk_est_crash_witness_record",
             "columns": ["crash_record_id"],
-            "references": { "table": "est.crash_record", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -443,12 +699,33 @@
         "table": "crash_sketch",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "crash_record_id", "type": "uuid" },
-          { "name": "sketch_type", "type": "varchar(20)" },
-          { "name": "evidence_id", "type": "uuid", "nullable": true },
-          { "name": "drawing_json", "type": "jsonb", "nullable": true }
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid"
+          },
+          {
+            "name": "sketch_type",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "evidence_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "drawing_json",
+            "type": "jsonb",
+            "nullable": true
+          }
         ],
         "checks": [
           {
@@ -460,7 +737,10 @@
           {
             "name": "fk_est_crash_sketch_record",
             "columns": ["crash_record_id"],
-            "references": { "table": "est.crash_record", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -469,12 +749,32 @@
         "table": "crash_link",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "crash_record_id", "type": "uuid" },
-          { "name": "kind", "type": "varchar(20)" },
-          { "name": "target_id", "type": "uuid" },
-          { "name": "target_number", "type": "varchar(120)", "nullable": true }
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid"
+          },
+          {
+            "name": "kind",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "target_id",
+            "type": "uuid"
+          },
+          {
+            "name": "target_number",
+            "type": "varchar(120)",
+            "nullable": true
+          }
         ],
         "checks": [
           {
@@ -493,7 +793,10 @@
           {
             "name": "fk_est_crash_link_record",
             "columns": ["crash_record_id"],
-            "references": { "table": "est.crash_record", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -502,19 +805,48 @@
         "table": "crash_renaest_submission",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "crash_record_id", "type": "uuid" },
-          { "name": "protocol", "type": "varchar(120)", "nullable": true },
-          { "name": "national_status", "type": "varchar(60)" },
-          { "name": "layout_version", "type": "varchar(80)", "nullable": true },
-          { "name": "submitted_at", "type": "timestamptz", "nullable": true },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid"
+          },
+          {
+            "name": "protocol",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "national_status",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "layout_version",
+            "type": "varchar(80)",
+            "nullable": true
+          },
+          {
+            "name": "submitted_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
           {
             "name": "rectification_kind",
             "type": "varchar(20)",
             "nullable": true
           },
-          { "name": "rectification_reason", "type": "text", "nullable": true }
+          {
+            "name": "rectification_reason",
+            "type": "text",
+            "nullable": true
+          }
         ],
         "checks": [
           {
@@ -538,7 +870,10 @@
           {
             "name": "fk_est_crash_renaest_submission_record",
             "columns": ["crash_record_id"],
-            "references": { "table": "est.crash_record", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_est_crash_renaest_submission_state",
@@ -555,18 +890,39 @@
         "table": "crash_subject_request",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "crash_record_id", "type": "uuid", "nullable": true },
-          { "name": "kind", "type": "varchar(20)" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "kind",
+            "type": "varchar(20)"
+          },
           {
             "name": "subject_cpf",
             "type": "varchar(20)",
             "pii": "high",
             "retention": "est.retention.bat_years"
           },
-          { "name": "purpose", "type": "text" },
-          { "name": "status", "type": "varchar(60)", "default": "'REGISTRADO'" }
+          {
+            "name": "purpose",
+            "type": "text"
+          },
+          {
+            "name": "status",
+            "type": "varchar(60)",
+            "default": "'REGISTRADO'"
+          }
         ],
         "checks": [
           {
@@ -578,7 +934,148 @@
           {
             "name": "fk_est_crash_subject_request_record",
             "columns": ["crash_record_id"],
-            "references": { "table": "est.crash_record", "columns": ["id"] }
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "CrashReportDocument",
+        "table": "crash_report_document",
+        "primaryKey": ["id"],
+        "applicationAppendOnly": true,
+        "fields": [
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid"
+          },
+          {
+            "name": "document_kind",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "template_key",
+            "type": "varchar(160)"
+          },
+          {
+            "name": "template_version",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "policy_id",
+            "type": "uuid"
+          },
+          {
+            "name": "storage_key",
+            "type": "text"
+          },
+          {
+            "name": "content_hash",
+            "type": "varchar(64)"
+          },
+          {
+            "name": "byte_size",
+            "type": "integer"
+          },
+          {
+            "name": "signature_ref",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "pdfa_conformance",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "pdfa_validation",
+            "type": "jsonb"
+          },
+          {
+            "name": "supersedes_document_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "sealed_at",
+            "type": "timestamptz",
+            "nullable": true,
+            "writable": false
+          },
+          {
+            "name": "created_at",
+            "type": "timestamptz",
+            "default": "clock_timestamp()",
+            "writable": false
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_est_crash_report_document_kind",
+            "expression": "document_kind = 'RELATORIO_PRELIMINAR_SINISTRO'"
+          },
+          {
+            "name": "ck_est_crash_report_pdfa",
+            "expression": "pdfa_conformance = 'PDF/A-2b'"
+          },
+          {
+            "name": "ck_est_crash_report_hash",
+            "expression": "content_hash ~ '^[0-9a-f]{64}$'"
+          },
+          {
+            "name": "ck_est_crash_report_size",
+            "expression": "byte_size > 0"
+          },
+          {
+            "name": "ck_est_crash_report_validation",
+            "expression": "pdfa_validation ->> 'valid' = 'true' and pdfa_validation #>> '{declared,version}' = 'A-2' and pdfa_validation #>> '{declared,conformance}' = 'b'"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_est_crash_report_storage_key",
+            "columns": ["tenant_id", "storage_key"],
+            "unique": true
+          },
+          {
+            "name": "ix_est_crash_report_record_created",
+            "columns": ["tenant_id", "crash_record_id", "created_at"]
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_est_crash_report_record",
+            "columns": ["crash_record_id"],
+            "references": {
+              "table": "est.crash_record",
+              "columns": ["id"]
+            }
+          },
+          {
+            "name": "fk_est_crash_report_policy",
+            "columns": ["policy_id"],
+            "references": {
+              "table": "inf.signature_policy",
+              "columns": ["id"]
+            }
+          },
+          {
+            "name": "fk_est_crash_report_supersedes",
+            "columns": ["supersedes_document_id"],
+            "references": {
+              "table": "est.crash_report_document",
+              "columns": ["id"]
+            }
           }
         ]
       }
@@ -597,7 +1094,11 @@
         "path": "vehicles",
         "resource": "crash-vehicle"
       },
-      { "entity": "CrashPerson", "path": "people", "resource": "crash-person" },
+      {
+        "entity": "CrashPerson",
+        "path": "people",
+        "resource": "crash-person"
+      },
       {
         "entity": "CrashVictim",
         "path": "victims",
@@ -638,11 +1139,21 @@
         "entity": "CrashSubjectRequest",
         "path": "subject-requests",
         "resource": "crash-subject-request"
+      },
+      {
+        "entity": "CrashReportDocument",
+        "path": "report-documents",
+        "resource": "crash-report-document",
+        "operations": []
       }
     ]
   },
-  "auth": { "source": "BOAT_ROUTE_CONTRACT" },
-  "audit": { "enabled": true },
+  "auth": {
+    "source": "BOAT_ROUTE_CONTRACT"
+  },
+  "audit": {
+    "enabled": true
+  },
   "ops": {
     "timers": [
       {
diff --git a/docs/framework/blueprints/module-blueprint.schema.json b/docs/framework/blueprints/module-blueprint.schema.json
index 2828d6b1..6aa620be 100644
--- a/docs/framework/blueprints/module-blueprint.schema.json
+++ b/docs/framework/blueprints/module-blueprint.schema.json
@@ -130,6 +130,9 @@
             "type": "string"
           }
         },
+        "applicationAppendOnly": {
+          "type": "boolean"
+        },
         "fields": {
           "type": "array",
           "items": {
diff --git a/docs/framework/contracts/BP-EST-CRASH-001.openapi.json b/docs/framework/contracts/BP-EST-CRASH-001.openapi.json
index 1791e3b0..9d7e8bfa 100644
--- a/docs/framework/contracts/BP-EST-CRASH-001.openapi.json
+++ b/docs/framework/contracts/BP-EST-CRASH-001.openapi.json
@@ -2539,6 +2539,159 @@
           }
         },
         "required": ["kind", "subject_cpf", "purpose"]
+      },
+      "CrashReportDocument": {
+        "type": "object",
+        "properties": {
+          "id": {
+            "type": "string",
+            "format": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          "tenant_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "crash_record_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "document_kind": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "template_key": {
+            "type": "string",
+            "maxLength": 160
+          },
+          "template_version": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "policy_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "storage_key": {
+            "type": "string"
+          },
+          "content_hash": {
+            "type": "string",
+            "maxLength": 64
+          },
+          "byte_size": {
+            "type": "integer"
+          },
+          "signature_ref": {
+            "type": "string",
+            "nullable": true
+          },
+          "pdfa_conformance": {
+            "type": "string",
+            "maxLength": 20
+          },
+          "pdfa_validation": {
+            "type": "object",
+            "additionalProperties": true
+          },
+          "supersedes_document_id": {
+            "type": "string",
+            "format": "uuid",
+            "nullable": true
+          },
+          "sealed_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          },
+          "created_at": {
+            "type": "string",
+            "format": "date-time",
+            "default": "clock_timestamp()"
+          },
+          "updated_at": {
+            "type": "string",
+            "format": "date-time",
+            "nullable": true
+          }
+        },
+        "required": [
+          "tenant_id",
+          "crash_record_id",
+          "document_kind",
+          "template_key",
+          "template_version",
+          "policy_id",
+          "storage_key",
+          "content_hash",
+          "byte_size",
+          "pdfa_conformance",
+          "pdfa_validation"
+        ]
+      },
+      "CreateCrashReportDocumentDto": {
+        "type": "object",
+        "properties": {
+          "crash_record_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "document_kind": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "template_key": {
+            "type": "string",
+            "maxLength": 160
+          },
+          "template_version": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "policy_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "storage_key": {
+            "type": "string"
+          },
+          "content_hash": {
+            "type": "string",
+            "maxLength": 64
+          },
+          "byte_size": {
+            "type": "integer"
+          },
+          "signature_ref": {
+            "type": "string",
+            "nullable": true
+          },
+          "pdfa_conformance": {
+            "type": "string",
+            "maxLength": 20
+          },
+          "pdfa_validation": {
+            "type": "object",
+            "additionalProperties": true
+          },
+          "supersedes_document_id": {
+            "type": "string",
+            "format": "uuid",
+            "nullable": true
+          }
+        },
+        "required": [
+          "crash_record_id",
+          "document_kind",
+          "template_key",
+          "template_version",
+          "policy_id",
+          "storage_key",
+          "content_hash",
+          "byte_size",
+          "pdfa_conformance",
+          "pdfa_validation"
+        ]
       }
     }
   }
diff --git a/docs/meta/adr/ADR-0018-documents-and-signature-substrate.md b/docs/meta/adr/ADR-0018-documents-and-signature-substrate.md
index b7530d9a..9ccb2c68 100644
--- a/docs/meta/adr/ADR-0018-documents-and-signature-substrate.md
+++ b/docs/meta/adr/ADR-0018-documents-and-signature-substrate.md
@@ -91,6 +91,10 @@ application composition.
    to be the official BAT. BAT fields therefore remain pending in DT-061/OD-B08 but do not block
    C-2-13. Signature and informational-content policy for the preliminary report remain separately
    pending until the Owner chooses them.
+   On 2026-09-20 the Owner approved Default D1: this document kind has no signers, PAdES level
+   `NONE`, no TSA and no gov.br level in its initial policy. It carries the approved non-BAT notice
+   and seals only after PDF/A-2b validation; `signature_ref` remains null. A future signed policy is
+   a new policy revision.
 3. The facade flow is `render(templateKey, data)` then `sign(documentId, signer)` when the resolved
    policy permits a resolved signer, then `seal(documentId)`. Rendering resolves the active
    tenant-scoped template and policy, invokes the mounted substrate once in `backend/app`, and
@@ -121,3 +125,15 @@ application composition.
    blocking BOAT PDF/A PR job provisions Chromium, the converter dependencies, and the pinned
    veraPDF image, runs positive and invalid bytes without `skip`, and fails when any dependency is
    unavailable. TASK-0017 owns the corresponding CI and real-tier configuration.
+7. Default D1 approves WeasyPrint 70.0 as the BOAT real PDF/A backend, pinned by the wheel SHA-256
+   recorded in `work/rounds/R-0010/contracts/CTG-0002-documents.md`. It produces PDF/A-2b directly
+   and is followed by veraPDF using the immutable Docker Hub digest recorded there. The real tier
+   must reproduce both generation and validation; the preliminary Architect probe is not delivery
+   evidence.
+8. The sealed BOAT report metadata is persisted in the blueprint owned
+   `est.crash_report_document` table under forced tenant RLS. Rows are inserted
+   only after the validated bytes are uploaded through the application mounted
+   STYNX `S3Service`; `role_app_backend` has no `UPDATE` or `DELETE` privilege on
+   this table. A new issuance inserts a successor row. The full veraPDF result,
+   template version, policy id, hash, storage key and null signature reference
+   survive application restart.
diff --git a/packages/api-clients/src/generated/BP-EST-CRASH-001.ts b/packages/api-clients/src/generated/BP-EST-CRASH-001.ts
index c3ac89ec..d4d93984 100644
--- a/packages/api-clients/src/generated/BP-EST-CRASH-001.ts
+++ b/packages/api-clients/src/generated/BP-EST-CRASH-001.ts
@@ -806,6 +806,60 @@ export interface components {
       /** @default 'REGISTRADO' */
       status: string;
     };
+    CrashReportDocument: {
+      /**
+       * Format: uuid
+       * @default gen_random_uuid()
+       */
+      id: string;
+      /** Format: uuid */
+      tenant_id: string;
+      /** Format: uuid */
+      crash_record_id: string;
+      document_kind: string;
+      template_key: string;
+      template_version: string;
+      /** Format: uuid */
+      policy_id: string;
+      storage_key: string;
+      content_hash: string;
+      byte_size: number;
+      signature_ref?: string | null;
+      pdfa_conformance: string;
+      pdfa_validation: {
+        [key: string]: unknown;
+      };
+      /** Format: uuid */
+      supersedes_document_id?: string | null;
+      /** Format: date-time */
+      sealed_at?: string | null;
+      /**
+       * Format: date-time
+       * @default clock_timestamp()
+       */
+      created_at: string;
+      /** Format: date-time */
+      updated_at?: string | null;
+    };
+    CreateCrashReportDocumentDto: {
+      /** Format: uuid */
+      crash_record_id: string;
+      document_kind: string;
+      template_key: string;
+      template_version: string;
+      /** Format: uuid */
+      policy_id: string;
+      storage_key: string;
+      content_hash: string;
+      byte_size: number;
+      signature_ref?: string | null;
+      pdfa_conformance: string;
+      pdfa_validation: {
+        [key: string]: unknown;
+      };
+      /** Format: uuid */
+      supersedes_document_id?: string | null;
+    };
   };
   responses: never;
   parameters: never;
diff --git a/pnpm-lock.yaml b/pnpm-lock.yaml
index 11aa4e04..977539c3 100644
--- a/pnpm-lock.yaml
+++ b/pnpm-lock.yaml
@@ -300,6 +300,15 @@ importers:
       '@stynx-nyx/logging':
         specifier: 1.3.1
         version: 1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
+      '@stynx-nyx/pdf':
+        specifier: 1.3.1
+        version: 1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(@stynx-nyx/signature@1.4.0(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(reflect-metadata@0.2.2)(rxjs@7.8.2)
+      '@stynx-nyx/pdf-a':
+        specifier: 1.3.1
+        version: 1.3.1(@stynx-nyx/logging@1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))
+      '@stynx-nyx/pdf-a-vera-docker':
+        specifier: 1.3.1
+        version: 1.3.1(@stynx-nyx/logging@1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))
       '@stynx-nyx/ratelimit':
         specifier: 1.3.1
         version: 1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(@opentelemetry/api@1.9.1)(@types/pg@8.23.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
@@ -3650,6 +3659,15 @@ packages:
     resolution: {integrity: sha512-7FNeNl8NCE7aINx7WXiKQrPYZWC/hvrTsmk6zmxbI7LTXE7hVek/n8AfVgpe2y82zl3w0HvCHN0bVKMBoJcC0w==}
     engines: {node: '>= 10.0.0'}

+  '@pdf-lib/fontkit@1.1.1':
+    resolution: {integrity: sha512-KjMd7grNapIWS/Dm0gvfHEilSyAmeLvrEGVcqLGi0VYebuqqzTbgF29efCx7tvx+IEbG3zQciRSWl3GkUSvjZg==}
+
+  '@pdf-lib/standard-fonts@1.0.0':
+    resolution: {integrity: sha512-hU30BK9IUN/su0Mn9VdlVKsWBS6GyhVfqjwl1FjZN4TxP6cCw0jP2w7V3Hf5uX7M0AZJ16vey9yE0ny7Sa59ZA==}
+
+  '@pdf-lib/upng@1.0.1':
+    resolution: {integrity: sha512-dQK2FUMQtowVP00mtIksrlZhdFXQZPC+taih1q4CvPZ5vqdxR/LKBaFg0oAfzd1GlHZXXSPdQfzQnt+ViGvEIQ==}
+
   '@pinojs/redact@0.4.0':
     resolution: {integrity: sha512-k2ENnmBugE/rzQfEcdWHcCY+/FM3VLzH9cYEsbdsoqrvzAKRhUZeRNhAZvB8OitQJ1TBed3yqWtdjzS6wJKBwg==}

@@ -4279,6 +4297,10 @@ packages:
     resolution: {integrity: sha512-ZUrouadkMgN2DZ7C5av20ht/AHSMTbN7kDpFDGa7uM6ZPSo4V8CJnCweaBivjgGrDImVHvKTBoiRRXFo29JOJQ==, tarball: https://npm.pkg.github.com/download/@stynx-nyx/integration-adapter/1.3.1/7d22a61655fda4d7037c5161a156b06e7adb4bd1}
     engines: {node: '>=24 <25'}

+  '@stynx-nyx/integration-adapter@1.4.0':
+    resolution: {integrity: sha512-VvdNwh6IcT7WDpx7QifHeld41pJlkOsJ+nJFDHWdzeQYPJz1NCkcTWMBW2Al233+U5tcll4OeHEWisVXF32a0g==, tarball: https://npm.pkg.github.com/download/@stynx-nyx/integration-adapter/1.4.0/994f5ffae48211cb2e41f2d0a15be84d95d0e378}
+    engines: {node: '>=24 <25'}
+
   '@stynx-nyx/logging@1.3.1':
     resolution: {integrity: sha512-NLjrGDxinoNpxuLpD2W25ah8S4+71+OiiOfhugbbAch0AhEsV8TW1vfLDKNErK9cvnSynv6IvQTXII3MFqHeZw==, tarball: https://npm.pkg.github.com/download/@stynx-nyx/logging/1.3.1/43ddd948183644254dfda4713f07b3fc8fbe85e1}
     engines: {node: '>=24 <25'}
@@ -4288,6 +4310,28 @@ packages:
       reflect-metadata: ^0.2.2
       rxjs: ^7.8.2

+  '@stynx-nyx/pdf-a-vera-docker@1.3.1':
+    resolution: {integrity: sha512-1OvGUxBAe0AHILGc+Oa143sE+fwgmPGjOW9ZVb/WwohuZ7kfImqAXiHv6kZAlX52yBUSOwubafyR9VLZtDUMcg==, tarball: https://npm.pkg.github.com/download/@stynx-nyx/pdf-a-vera-docker/1.3.1/b06715509a08f927ad9094359b055d3697e5faa7}
+    engines: {node: '>=24 <25'}
+    peerDependencies:
+      '@stynx-nyx/logging': ^1.3.1
+
+  '@stynx-nyx/pdf-a@1.3.1':
+    resolution: {integrity: sha512-MO6a14TLwEwwWffOnsaKGXF/7KOJff48KwrVCE+qWjuXO0zDqY10aATgQghagPNSozRsKkdbO4RpSqPpmpCRdw==, tarball: https://npm.pkg.github.com/download/@stynx-nyx/pdf-a/1.3.1/fffcf79457bc0d5b982317f0185bd5d900cd7723}
+    engines: {node: '>=24 <25'}
+    peerDependencies:
+      '@stynx-nyx/logging': ^1.3.1
+
+  '@stynx-nyx/pdf@1.3.1':
+    resolution: {integrity: sha512-ZoEFwQVHvSy5/lsGD7vRdKzGG/BrE0cGr7FgOy8AK3lN3DSVQWokbCoMeNbiHlWluIDgjFv6G3+5GiwbGF5oPA==, tarball: https://npm.pkg.github.com/download/@stynx-nyx/pdf/1.3.1/8dd141a8a9ecb9a386b83b93c7bb8410c9b47ef1}
+    engines: {node: '>=24 <25'}
+    peerDependencies:
+      '@nestjs/common': ^11.1.19
+      '@nestjs/core': ^11.1.19
+      '@stynx-nyx/signature': ^1.3.1
+      reflect-metadata: ^0.2.2
+      rxjs: ^7.8.2
+
   '@stynx-nyx/ratelimit@1.3.1':
     resolution: {integrity: sha512-gvA/O79WQ0GcLD7uM+Q3xZ5h88Bci41BRRVod4jk7fH/Y6nXccE7i8ub9dvYAZyddK15r+teE5L0z6T5YDNNCw==, tarball: https://npm.pkg.github.com/download/@stynx-nyx/ratelimit/1.3.1/b20adb53e122d062bb24c0b64eacf5104cf6c513}
     engines: {node: '>=24 <25'}
@@ -4310,6 +4354,15 @@ packages:
       reflect-metadata: ^0.2.2
       rxjs: ^7.8.2

+  '@stynx-nyx/signature@1.4.0':
+    resolution: {integrity: sha512-CFkP6sgSHoJ5VLTvYxFYz0qBv+6aJcmja6Pm7Ro6pjToU47/XlS0jN6/Ji2zlpO/SUEgamqYvYwJMtoSoKPDjA==, tarball: https://npm.pkg.github.com/download/@stynx-nyx/signature/1.4.0/c60310185d07f95ee66419e1e6634ad604b5d4ce}
+    engines: {node: '>=24 <25'}
+    peerDependencies:
+      '@nestjs/common': ^11.1.19
+      '@nestjs/core': ^11.1.19
+      reflect-metadata: ^0.2.2
+      rxjs: ^7.8.2
+
   '@stynx-nyx/storage@1.3.1':
     resolution: {integrity: sha512-pqoLV4/2+Mwvv5zh1UDaYsYeAa105mLq2LwhIB4IjnUUcKFhYYhOdG05FzKL6bd+8OoDxSV9H0qEHuZlPAYUKQ==, tarball: https://npm.pkg.github.com/download/@stynx-nyx/storage/1.3.1/69138c1907f07835f92accd3e429988b723ae3d9}
     engines: {node: '>=24 <25'}
@@ -4584,6 +4637,18 @@ packages:
   '@vitest/utils@4.1.11':
     resolution: {integrity: sha512-zTCVGpyFsGWBhllOyKlTw/vnr6D9qxsfSDyfbyZmTyjHw5N/VuvzHpHoQjm2ZJzn4RJgx5w4r7V0er69CmLgPQ==}

+  '@xmldom/is-dom-node@1.0.1':
+    resolution: {integrity: sha512-CJDxIgE5I0FH+ttq/Fxy6nRpxP70+e2O048EPe85J2use3XKdatVM7dDVvFNjQudd9B49NPoZ+8PG49zj4Er8Q==}
+    engines: {node: '>= 16'}
+
+  '@xmldom/xmldom@0.8.15':
+    resolution: {integrity: sha512-/5NV/vDALVFDXgLmfsy9TRCBlKwO2LNBFzpzvb9iIj+jR+eSc6DLYYvVOdivT/jm7MtU6TebYuRmzEOI7w40UA==}
+    engines: {node: '>=10.0.0'}
+
+  '@xmldom/xmldom@0.9.12':
+    resolution: {integrity: sha512-5AXjrcMClTryPe9LgZrygpB1lj7s0S9E0+W+AHaVKAVyHanafK86iPSvG5xHVSp/jC+VH1UXu0TAEmY279xH7A==}
+    engines: {node: '>=14.6'}
+
   abort-controller@3.0.0:
     resolution: {integrity: sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==}
     engines: {node: '>=6.5'}
@@ -5425,6 +5490,11 @@ packages:
   graceful-fs@4.2.11:
     resolution: {integrity: sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==}

+  handlebars@4.7.9:
+    resolution: {integrity: sha512-4E71E0rpOaQuJR2A3xDZ+GM1HyWYv1clR58tC8emQNeQe3RH7MAzSbat+V0wG78LQBo6m6bzSG/L4pBuCsgnUQ==}
+    engines: {node: '>=0.4.7'}
+    hasBin: true
+
   has-flag@4.0.0:
     resolution: {integrity: sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==}
     engines: {node: '>=8'}
@@ -5909,6 +5979,9 @@ packages:
     resolution: {integrity: sha512-NMPBRMJgiQHjbd8phG3Vebdx4kZ1H121rbl5IkMqeOsahptB9BKo/d7oJ3zTXqTgagn2bWlNSXkh0QUGM31RYg==}
     engines: {node: '>=18'}

+  neo-async@2.6.2:
+    resolution: {integrity: sha512-Yd3UES5mWCSqR+qNT93S3UoYUkqAZ9lLg8a7g9rimsWmYGK8cVToA4/sF3RrshdyV3sAGMXVUmpMYOw+dLpOuw==}
+
   nestjs-cls@6.2.1:
     resolution: {integrity: sha512-LTVvreuhH132+rjP4MwnykUS3byBAuN6WQzh2QA3YSYCjy9GfgRyoiSKE5qrzQe+uCB1/TUNHPCxEMYgR3tRlg==}
     engines: {node: '>=18'}
@@ -6037,6 +6110,9 @@ packages:
   package-json-from-dist@1.0.1:
     resolution: {integrity: sha512-UEZIS3/by4OC8vL3P2dTXRETpebLI2NiI5vIrjaD/5UtrkFX/tNbwjTSRAGC/+7CAo2pIcBaRgWmcBBHcsaCIw==}

+  pako@1.0.11:
+    resolution: {integrity: sha512-4hLB8Py4zZce5s4yd9XzopqwVv/yGNhV1Bl8NTmCq1763HeK2+EwVTv+leGeL13Dnh2wfbqowVPXCIO0z4taYw==}
+
   parse-json@8.3.0:
     resolution: {integrity: sha512-ybiGyvspI+fAoRQbIPRddCcSTV9/LsJbf0e/S85VLowVGzRmokfneg2kwVW/KU5rOXrPSbF1qAKPMgNTqqROQQ==}
     engines: {node: '>=18'}
@@ -6076,6 +6152,9 @@ packages:
   pathe@2.0.3:
     resolution: {integrity: sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==}

+  pdf-lib@1.17.1:
+    resolution: {integrity: sha512-V/mpyJAoTsN4cnP31vc0wfNA1+p20evqqnap0KLoRUN0Yk/p3wN52DOEsL4oBFcLdb76hlpKPtzJIgo67j/XLw==}
+
   pg-cloudflare@1.4.0:
     resolution: {integrity: sha512-Vo7z/6rrQYxpNRylp4Tlob2elzbh+N/MOQbxFVWCxS7oEx6jF53GTJFxK2WWpKuBRkmiin4Mt+xofFDjx09R0A==}

@@ -6147,6 +6226,16 @@ packages:
     resolution: {integrity: sha512-4peoBq4Wks0riS0z8741NVv+/8IiTvqnZAr8QGgtdifrtpdXbNw/FxRS1l6NFqm4EMzuS0EDqNNx4XGaz8cuyQ==}
     engines: {node: '>=18'}

+  playwright-core@1.63.0:
+    resolution: {integrity: sha512-rYCsBF/M5HjUch52bbtVONEFjv6Xu8sm8h72dNlR5bzIE1fvC/bxgspzkjSfU+MweEMmPM8KJebG6nnyxo5mCg==}
+    engines: {node: '>=20'}
+    hasBin: true
+
+  playwright@1.63.0:
+    resolution: {integrity: sha512-+7ziBLidS4NaNCdt57SUDT+wYmmd5fmiQejUic/kb+YsYSCPyOOE9sebzMjNmQrsnNpDJqd4WHvV/8lfKfUDUg==}
+    engines: {node: '>=20'}
+    hasBin: true
+
   pluralize@8.0.0:
     resolution: {integrity: sha512-Nc3IT5yHzflTfbjgqWcCPpo7DaKy4FnpB0l/zCAW0Tc7jxAiuqSxHasntB3D7887LSrA93kDJ9IXovxJYxyLCA==}
     engines: {node: '>=4'}
@@ -6558,6 +6647,9 @@ packages:
     peerDependencies:
       typescript: '>=4.8.4'

+  tslib@1.14.1:
+    resolution: {integrity: sha512-Xni35NKzjgMrwevysHTCArtLDpPvye8zV/0E4EyYn43P7/7qvQwPh9BGkHewbMulVntbigmcT7rdX3BNo9wRJg==}
+
   tslib@2.8.1:
     resolution: {integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==}

@@ -6606,6 +6698,11 @@ packages:
     engines: {node: '>=14.17'}
     hasBin: true

+  uglify-js@3.19.3:
+    resolution: {integrity: sha512-v3Xu+yuwBXisp6QYTcH4UbH+xYJXqnq2m/LtQVWKWzYc1iehYnLixoQDN9FH6/j9/oybfd6W9Ghwkl8+UMKTKQ==}
+    engines: {node: '>=0.8.0'}
+    hasBin: true
+
   uid@2.0.2:
     resolution: {integrity: sha512-u3xV3X7uzvi5b1MncmZo3i2Aw222Zk1keqLA1YkHldREkAhAqi65wuPfe7lHx8H/Wzy+8CE7S7uS3jekIM5s8g==}
     engines: {node: '>=8'}
@@ -6844,6 +6941,9 @@ packages:
     resolution: {integrity: sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==}
     engines: {node: '>=0.10.0'}

+  wordwrap@1.0.0:
+    resolution: {integrity: sha512-gvVzJFlPycKc5dZN4yPkP8w7Dc37BtP1yczEneOb4uq34pXZcvrtRTmWV8W+Ume+XCxKgbjM+nevkyFPMybd4Q==}
+
   wrap-ansi@10.0.1:
     resolution: {integrity: sha512-M0N4xzyzosiIok3svYlEo1sdLZts/8FPgYH/GPC3wvlmPoRvnoManGMrE54waYj3tISA8w6lsdesfVv67qSr8Q==}
     engines: {node: '>=20'}
@@ -6859,6 +6959,10 @@ packages:
   wrappy@1.0.2:
     resolution: {integrity: sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==}

+  xml-crypto@6.3.0:
+    resolution: {integrity: sha512-UOFXhZf/paMcBYA9Gvr+XQQxLxfqoKTjfMkWJnPS0PcVEPcXdEn7etTbqONj0rwOtgBOlOAgB/0v4cNsR/hLWg==}
+    engines: {node: '>=16'}
+
   xml-name-validator@5.0.0:
     resolution: {integrity: sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==}
     engines: {node: '>=18'}
@@ -6866,6 +6970,10 @@ packages:
   xmlchars@2.2.0:
     resolution: {integrity: sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==}

+  xpath@0.0.33:
+    resolution: {integrity: sha512-NNXnzrkDrAzalLhIUc01jO2mOzXGXh1JwPgkihcLLzw98c0WgYDmmjSh1Kl3wzaxSVWMuA+fe0WTWOBDWCBmNA==}
+    engines: {node: '>=0.6.0'}
+
   xtend@4.0.2:
     resolution: {integrity: sha512-LKYU1iAXJXUgAXn9URjiu+MWhyUXHsvfp7mcuYm9dSUKK0/CjtrUwFAxD82/mCWbtLsGjFIad0wIsod4zrTAEQ==}
     engines: {node: '>=0.4'}
@@ -8460,6 +8568,18 @@ snapshots:
       '@parcel/watcher-win32-x64': 2.6.0
     optional: true

+  '@pdf-lib/fontkit@1.1.1':
+    dependencies:
+      pako: 1.0.11
+
+  '@pdf-lib/standard-fonts@1.0.0':
+    dependencies:
+      pako: 1.0.11
+
+  '@pdf-lib/upng@1.0.1':
+    dependencies:
+      pako: 1.0.11
+
   '@pinojs/redact@0.4.0': {}

   '@pkgr/core@0.3.6': {}
@@ -9115,6 +9235,8 @@ snapshots:

   '@stynx-nyx/integration-adapter@1.3.1': {}

+  '@stynx-nyx/integration-adapter@1.4.0': {}
+
   '@stynx-nyx/logging@1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)':
     dependencies:
       '@nestjs/common': 11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
@@ -9126,6 +9248,27 @@ snapshots:
       rxjs: 7.8.2
       zod: 4.6.5

+  '@stynx-nyx/pdf-a-vera-docker@1.3.1(@stynx-nyx/logging@1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))':
+    dependencies:
+      '@stynx-nyx/logging': 1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
+      '@stynx-nyx/pdf-a': 1.3.1(@stynx-nyx/logging@1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))
+
+  '@stynx-nyx/pdf-a@1.3.1(@stynx-nyx/logging@1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))':
+    dependencies:
+      '@stynx-nyx/logging': 1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
+
+  '@stynx-nyx/pdf@1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(@stynx-nyx/signature@1.4.0(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(reflect-metadata@0.2.2)(rxjs@7.8.2)':
+    dependencies:
+      '@nestjs/common': 11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
+      '@nestjs/core': 11.2.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/platform-express@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
+      '@pdf-lib/fontkit': 1.1.1
+      '@stynx-nyx/signature': 1.4.0(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
+      handlebars: 4.7.9
+      pdf-lib: 1.17.1
+      playwright: 1.63.0
+      reflect-metadata: 0.2.2
+      rxjs: 7.8.2
+
   '@stynx-nyx/ratelimit@1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(@opentelemetry/api@1.9.1)(@types/pg@8.23.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)':
     dependencies:
       '@nestjs/common': 11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
@@ -9215,6 +9358,16 @@ snapshots:
       - sql.js
       - sqlite3

+  '@stynx-nyx/signature@1.4.0(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)':
+    dependencies:
+      '@nestjs/common': 11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
+      '@nestjs/core': 11.2.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/platform-express@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
+      '@stynx-nyx/integration-adapter': 1.4.0
+      '@xmldom/xmldom': 0.9.12
+      reflect-metadata: 0.2.2
+      rxjs: 7.8.2
+      xml-crypto: 6.3.0
+
   '@stynx-nyx/storage@1.3.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(@opentelemetry/api@1.9.1)(@types/pg@8.23.1)(pg@8.23.0)(reflect-metadata@0.2.2)(rxjs@7.8.2)':
     dependencies:
       '@aws-sdk/client-s3': 3.1116.0
@@ -9679,6 +9832,12 @@ snapshots:
       convert-source-map: 2.0.0
       tinyrainbow: 3.1.1

+  '@xmldom/is-dom-node@1.0.1': {}
+
+  '@xmldom/xmldom@0.8.15': {}
+
+  '@xmldom/xmldom@0.9.12': {}
+
   abort-controller@3.0.0:
     dependencies:
       event-target-shim: 5.0.1
@@ -10458,6 +10617,15 @@ snapshots:

   graceful-fs@4.2.11: {}

+  handlebars@4.7.9:
+    dependencies:
+      minimist: 1.2.8
+      neo-async: 2.6.2
+      source-map: 0.6.1
+      wordwrap: 1.0.0
+    optionalDependencies:
+      uglify-js: 3.19.3
+
   has-flag@4.0.0: {}

   has-symbols@1.1.0: {}
@@ -10920,6 +11088,8 @@ snapshots:
     dependencies:
       content-type: 2.1.0

+  neo-async@2.6.2: {}
+
   nestjs-cls@6.2.1(@nestjs/common@11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2))(@nestjs/core@11.2.1)(reflect-metadata@0.2.2)(rxjs@7.8.2):
     dependencies:
       '@nestjs/common': 11.2.1(class-transformer@0.5.1)(class-validator@0.15.1)(reflect-metadata@0.2.2)(rxjs@7.8.2)
@@ -11090,6 +11260,8 @@ snapshots:

   package-json-from-dist@1.0.1: {}

+  pako@1.0.11: {}
+
   parse-json@8.3.0:
     dependencies:
       '@babel/code-frame': 7.29.7
@@ -11127,6 +11299,13 @@ snapshots:

   pathe@2.0.3: {}

+  pdf-lib@1.17.1:
+    dependencies:
+      '@pdf-lib/standard-fonts': 1.0.0
+      '@pdf-lib/upng': 1.0.1
+      pako: 1.0.11
+      tslib: 1.14.1
+
   pg-cloudflare@1.4.0:
     optional: true

@@ -11216,6 +11395,12 @@ snapshots:
     dependencies:
       find-up-simple: 1.0.1

+  playwright-core@1.63.0: {}
+
+  playwright@1.63.0:
+    dependencies:
+      playwright-core: 1.63.0
+
   pluralize@8.0.0: {}

   postcss-media-query-parser@0.2.3: {}
@@ -11717,6 +11902,8 @@ snapshots:
     dependencies:
       typescript: 6.0.3

+  tslib@1.14.1: {}
+
   tslib@2.8.1: {}

   tsx@4.23.13:
@@ -11761,6 +11948,9 @@ snapshots:

   typescript@6.0.3: {}

+  uglify-js@3.19.3:
+    optional: true
+
   uid@2.0.2:
     dependencies:
       '@lukeed/csprng': 1.1.0
@@ -11990,6 +12180,8 @@ snapshots:

   word-wrap@1.2.5: {}

+  wordwrap@1.0.0: {}
+
   wrap-ansi@10.0.1:
     dependencies:
       ansi-styles: 6.2.3
@@ -12009,10 +12201,18 @@ snapshots:

   wrappy@1.0.2: {}

+  xml-crypto@6.3.0:
+    dependencies:
+      '@xmldom/is-dom-node': 1.0.1
+      '@xmldom/xmldom': 0.8.15
+      xpath: 0.0.33
+
   xml-name-validator@5.0.0: {}

   xmlchars@2.2.0: {}

+  xpath@0.0.33: {}
+
   xtend@4.0.2: {}

   y18n@5.0.8: {}
diff --git a/tools/blueprints/generate.mjs b/tools/blueprints/generate.mjs
index 9ca71f22..1e119659 100644
--- a/tools/blueprints/generate.mjs
+++ b/tools/blueprints/generate.mjs
@@ -455,6 +455,12 @@ end $$;`,
     `select auth.install_tenant_triggers();`,
     `grant usage on schema ${module.namespace} to role_app_backend;`,
     `grant select, insert, update, delete on all tables in schema ${module.namespace} to role_app_backend;`,
+    ...entities
+      .filter((entity) => entity.applicationAppendOnly)
+      .map(
+        (entity) =>
+          `revoke update, delete on table ${module.namespace}.${entity.table} from role_app_backend;`,
+      ),
     `grant usage, select on all sequences in schema ${module.namespace} to role_app_backend;`,
   ].join('\n\n');
   write(
diff --git a/tools/blueprints/generated-files.json b/tools/blueprints/generated-files.json
index 025ec245..c7700b34 100644
--- a/tools/blueprints/generated-files.json
+++ b/tools/blueprints/generated-files.json
@@ -389,6 +389,7 @@
   "backend/domains/est/crash/src/controllers/crash-person.controller.ts",
   "backend/domains/est/crash/src/controllers/crash-record.controller.ts",
   "backend/domains/est/crash/src/controllers/crash-renaest-submission.controller.ts",
+  "backend/domains/est/crash/src/controllers/crash-report-document.controller.ts",
   "backend/domains/est/crash/src/controllers/crash-scene-duty.controller.ts",
   "backend/domains/est/crash/src/controllers/crash-sketch.controller.ts",
   "backend/domains/est/crash/src/controllers/crash-subject-request.controller.ts",
@@ -401,6 +402,7 @@
   "backend/domains/est/crash/src/dto/create-crash-person.dto.ts",
   "backend/domains/est/crash/src/dto/create-crash-record.dto.ts",
   "backend/domains/est/crash/src/dto/create-crash-renaest-submission.dto.ts",
+  "backend/domains/est/crash/src/dto/create-crash-report-document.dto.ts",
   "backend/domains/est/crash/src/dto/create-crash-scene-duty.dto.ts",
   "backend/domains/est/crash/src/dto/create-crash-sketch.dto.ts",
   "backend/domains/est/crash/src/dto/create-crash-subject-request.dto.ts",
@@ -412,6 +414,7 @@
   "backend/domains/est/crash/src/entities/crash-person.entity.ts",
   "backend/domains/est/crash/src/entities/crash-record.entity.ts",
   "backend/domains/est/crash/src/entities/crash-renaest-submission.entity.ts",
+  "backend/domains/est/crash/src/entities/crash-report-document.entity.ts",
   "backend/domains/est/crash/src/entities/crash-scene-duty.entity.ts",
   "backend/domains/est/crash/src/entities/crash-sketch.entity.ts",
   "backend/domains/est/crash/src/entities/crash-subject-request.entity.ts",
@@ -424,6 +427,7 @@
   "backend/domains/est/crash/src/repositories/crash-person.repository.ts",
   "backend/domains/est/crash/src/repositories/crash-record.repository.ts",
   "backend/domains/est/crash/src/repositories/crash-renaest-submission.repository.ts",
+  "backend/domains/est/crash/src/repositories/crash-report-document.repository.ts",
   "backend/domains/est/crash/src/repositories/crash-scene-duty.repository.ts",
   "backend/domains/est/crash/src/repositories/crash-sketch.repository.ts",
   "backend/domains/est/crash/src/repositories/crash-subject-request.repository.ts",
@@ -435,6 +439,7 @@
   "backend/domains/est/crash/src/services/crash-person.service.ts",
   "backend/domains/est/crash/src/services/crash-record.service.ts",
   "backend/domains/est/crash/src/services/crash-renaest-submission.service.ts",
+  "backend/domains/est/crash/src/services/crash-report-document.service.ts",
   "backend/domains/est/crash/src/services/crash-scene-duty.service.ts",
   "backend/domains/est/crash/src/services/crash-sketch.service.ts",
   "backend/domains/est/crash/src/services/crash-subject-request.service.ts",
diff --git a/work/rounds/R-0010/AUTHORIZATION.md b/work/rounds/R-0010/AUTHORIZATION.md
index a4ff00f4..2e112982 100644
--- a/work/rounds/R-0010/AUTHORIZATION.md
+++ b/work/rounds/R-0010/AUTHORIZATION.md
@@ -12,7 +12,7 @@ release: false

 # R-0010 authorization

-The Owner explicitly instructed the maestro to execute the R-0010 prompt through the final merge. This record transcribes that authorization for normal pushes of `orchestra/boat-backend`, PR creation and merge after green required checks and cross-family review PASS, exact-SHA audit observation, and governed round closure. It does not authorize package publication, release, deployment, force-push, or mutation outside this repository.
+The Owner explicitly instructed the maestro to execute the R-0010 prompt through the final merge. This record transcribes that authorization for normal pushes of `orchestra/boat-backend`, PR creation and merge after green required checks and the required review PASS, exact-SHA audit observation, and governed round closure. It does not authorize package publication, release, deployment, force-push, or mutation outside this repository.

 ## Owner decisions during execution

@@ -21,3 +21,12 @@ The Owner explicitly instructed the maestro to execute the R-0010 prompt through
   `source_pending` under DT-061/OD-B08. This decision removes BAT fields from the blockers of the
   preliminary report; it does not by itself approve a signature profile, TSA, signer, converter,
   or informational wording.
+- **2026-09-20 — Default D1:** the Owner approved the complete D1 proposal: unsigned preliminary
+  report policy (`PAdES=NONE`, no TSA or gov.br), the explicit non-BAT informational notice,
+  WeasyPrint as the PDF/A-2b backend, veraPDF as a mandatory fail-closed gate, and the adjustable
+  technical parameters recorded in the options report. This authorizes TASK-0016/0017 to proceed.
+- **2026-09-20 — reviewer exception:** while Claude is unavailable, the Owner exceptionally
+  authorized the Codex family as reviewer for the remainder of this session, until the Owner
+  reports Claude available again. The review remains an isolated, ephemeral, read-only Auditor
+  invocation through `tools/orchestra/bridge.sh`; the rubric, cycle limits and mandatory `PASS`
+  are unchanged.
diff --git a/work/rounds/R-0010/budget.json b/work/rounds/R-0010/budget.json
index 443548d8..297bfa6c 100644
--- a/work/rounds/R-0010/budget.json
+++ b/work/rounds/R-0010/budget.json
@@ -3,8 +3,8 @@
   "window": 5,
   "window_input_budget": 800000,
   "checkpoint_threshold": 640000,
-  "estimated_input_total": 268000,
-  "estimated_output_total": 43100,
+  "estimated_input_total": 492000,
+  "estimated_output_total": 74100,
   "entries": [
     {
       "kind": "maestro-planning",
@@ -736,6 +736,105 @@
       "output_tokens": 1500,
       "status": "completed",
       "note": "Corrected false mirror event, schema-version equality, RequestContext, missing replay invocation and cleanup; isolated DB fixture residue 0"
+    },
+    {
+      "kind": "inspector",
+      "id": "TASK-0016",
+      "window": 5,
+      "input_tokens": 38000,
+      "output_tokens": 5000,
+      "status": "completed",
+      "note": "Default D1 RED coverage, real PDF/A-2b validation, authorization matrix and tenant isolation; directed and full E2E passed"
+    },
+    {
+      "kind": "engineer",
+      "id": "TASK-0017",
+      "window": 5,
+      "input_tokens": 62000,
+      "output_tokens": 8000,
+      "status": "completed",
+      "note": "WeasyPrint 70.0 and veraPDF D1 implementation, route, facade, CI real tier, catalogue and seeds; pre-review gates passed"
+    },
+    {
+      "kind": "maestro-validation",
+      "id": "CTG-0002-documents-pre-review",
+      "window": 5,
+      "input_tokens": 24000,
+      "output_tokens": 2500,
+      "status": "completed",
+      "note": "shared/app/crash unit, real 2/2, BOAT E2E 21/21, full E2E 265 pass 2 todo, full check and seed idempotency passed; two environment sensor errors triaged"
+    },
+    {
+      "kind": "reviewer",
+      "id": "delivery-review-CTG-0002-documents-cycle-1-attempt-0",
+      "window": 5,
+      "input_tokens": 0,
+      "output_tokens": 0,
+      "status": "infrastructure-blocked",
+      "note": "Claude CLI weekly limit reached; resets 2026-09-21 04:00 America/Sao_Paulo; no verdict accepted"
+    },
+    {
+      "kind": "architect",
+      "id": "TASK-0015-D13-08",
+      "window": 5,
+      "input_tokens": 18000,
+      "output_tokens": 3000,
+      "status": "completed",
+      "note": "Returned persistence gap to Architect; specified blueprint-owned sealed metadata, STYNX S3 storage, RLS and append-only privileges"
+    },
+    {
+      "kind": "inspector",
+      "id": "TASK-0016-D13-08",
+      "window": 5,
+      "input_tokens": 14000,
+      "output_tokens": 2500,
+      "status": "completed",
+      "note": "Added integration proof for full veraPDF evidence, forced RLS, cross-tenant isolation, restart durability and denied mutation"
+    },
+    {
+      "kind": "engineer",
+      "id": "TASK-0017-D13-08",
+      "window": 5,
+      "input_tokens": 26000,
+      "output_tokens": 4000,
+      "status": "completed",
+      "note": "Replaced memory/filesystem persistence with SQL metadata and mounted STYNX S3 service; separated E2E providers and hardened CI venv"
+    },
+    {
+      "kind": "maestro-validation",
+      "id": "CTG-0002-documents-post-D13-08",
+      "window": 5,
+      "input_tokens": 12000,
+      "output_tokens": 1800,
+      "status": "completed",
+      "note": "byte_size retrieval fixed; full reset and seed twice PASS; backend:test:ci PASS including EST integration 21/21 and app E2E 267 pass 2 todo; stale 11-entity assertion triaged as plant-bug"
+    },
+    {
+      "kind": "maestro-integration",
+      "id": "R0007-main-merge-documents",
+      "window": 5,
+      "input_tokens": 18000,
+      "output_tokens": 2500,
+      "status": "completed",
+      "note": "Merged origin/main a0f62cb6 without history rewrite; regenerated conflicts from blueprints and reconciled R-0007 closed DDL inventory with R-0010 DDL71/72/75"
+    },
+    {
+      "kind": "maestro-validation",
+      "id": "CTG-0002-documents-post-R0007-final",
+      "window": 5,
+      "input_tokens": 24000,
+      "output_tokens": 3500,
+      "status": "completed",
+      "note": "Fixed append-only grant ordering, BOAT seed inventory and owner/RLS sensor; shared 404, app unit 116, integration 19, E2E 382 plus 2 todo, upgrade 18, real PDF/A 2, blueprints and pnpm check passed; one HTTP parser flake passed isolated and full rerun"
+    },
+    {
+      "kind": "owner-decision",
+      "id": "reviewer-family-exception-codex-session",
+      "window": 5,
+      "input_tokens": 0,
+      "output_tokens": 0,
+      "status": "active",
+      "note": "Owner authorized isolated read-only Codex family reviewer during this session until Claude availability is announced; rubric, cycle limits and PASS gate unchanged"
     }
   ]
 }
diff --git a/work/rounds/R-0010/contracts/CTG-0002-documents.md b/work/rounds/R-0010/contracts/CTG-0002-documents.md
index 11ece584..b043df32 100644
--- a/work/rounds/R-0010/contracts/CTG-0002-documents.md
+++ b/work/rounds/R-0010/contracts/CTG-0002-documents.md
@@ -2,7 +2,7 @@

 **Papel:** Architect
 **Tarefa:** TASK-0015
-**Estado:** especificação de implementação; C-2-13 permanece aberto
+**Estado:** política D1 implementada e prova real aprovada; revisão cruzada pendente

 ## 1. Escopo e decisão de catálogo

@@ -16,15 +16,23 @@ o BAT oficial. Assim, as pendências normativas do BAT não bloqueiam C-2-13; co
 DT-061/OD-B08. Esta decisão não escolhe por si só a política de assinatura nem o conteúdo
 informativo do relatório preliminar.

-| Item                       | Decisão implementável                                                                                                                                                             |
-| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
-| `DocumentKind`             | acrescentar `RELATORIO_PRELIMINAR_SINISTRO` ao fim de `DOCUMENT_KINDS`                                                                                                            |
-| domínio do fato e template | `est` / `est.crash_record`                                                                                                                                                        |
-| catálogo                   | `inf.normative_document_template` generalizado, `domain_scope='est'`                                                                                                              |
-| chave                      | `est.crash.report.preliminary`                                                                                                                                                    |
-| versão inicial             | `1.0.0`, revisão técnica inicial do template                                                                                                                                      |
-| política                   | linha tenant/agência para `relatorio_preliminar_sinistro`, `pdfaRequired=true`, alvo `PDF/A-2b`                                                                                   |
-| dados mínimos comprovados  | identificador do registro, dados factuais já registrados no agregado, versão do template e identidade do órgão resolvida do catálogo; conteúdo legal adicional é `source_pending` |
+Em 2026-09-20, o Owner aprovou o Default D1 completo: versão `1.0.0`, aviso informativo abaixo,
+sem PAdES, TSA ou gov.br na política inicial, selo técnico imutável, WeasyPrint 70.0 como backend
+real PDF/A-2b e veraPDF como gate obrigatório. A política pode ganhar assinatura em revisão futura
+sem alterar a identidade do tipo documental.
+
+| Item                       | Decisão implementável                                                                                                                                                              |
+| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| `DocumentKind`             | acrescentar `RELATORIO_PRELIMINAR_SINISTRO` ao fim de `DOCUMENT_KINDS`                                                                                                             |
+| domínio do fato e template | `est` / `est.crash_record`                                                                                                                                                         |
+| catálogo                   | `inf.normative_document_template` generalizado, `domain_scope='est'`                                                                                                               |
+| chave                      | `est.crash.report.preliminary`                                                                                                                                                     |
+| versão inicial             | `1.0.0`, revisão técnica inicial do template                                                                                                                                       |
+| política                   | linha tenant/agência para `relatorio_preliminar_sinistro`: `requiredSigners=[]`, `padesLevel='NONE'`, `tsaRequired=false`, `pdfaRequired=true`, alvo `PDF/A-2b`, `govBrLevel=null` |
+| dados mínimos comprovados  | identificador do registro, dados factuais já registrados no agregado, versão do template, identidade do órgão e o aviso aprovado abaixo                                            |
+
+> Relatório preliminar de sinistro. Documento informativo sujeito a complementação e validação.
+> Não constitui Boletim de Acidente de Trânsito (BAT) oficial.

 O dono do fato escreve o template e solicita a fachada; `inf/normative` continua dono do catálogo
 generalizado e da política como dado. A extensão exige migração versionada do blueprint/catálogo,
@@ -34,39 +42,50 @@ RLS e seed compatível, mas TASK-0015 não altera estes artefatos.

 1. O comando BOAT usa `DocumentsFacade.render('est.crash.report.preliminary', data)` com tenant do
    `RequestContext`; a fachada resolve template e política ativos no mesmo escopo de tenant/agência.
-2. Se a política ainda não tiver signatário, PAdES, TSA e conteúdo legal resolvidos, a emissão falha
-   fechada. Não há valor padrão de assinatura.
-3. Com política resolvida, `sign(documentId, signer)` aplica a assinatura autorizada e
-   `seal(documentId)` só persiste os bytes finais e a evidência de validação conformante.
+2. A política D1 exige `requiredSigners=[]`, `padesLevel='NONE'`, `tsaRequired=false` e
+   `govBrLevel=null`; `sign` não é chamado. Qualquer outra combinação exige nova política aprovada.
+3. `seal(documentId)` persiste os bytes finais e a evidência de validação conformante. A ausência
+   deliberada de assinatura é registrada como `signatureRef=null`, nunca como assinatura sintética.
 4. O selo calcula SHA-256 sobre os bytes convertidos e validados, registra `storage_key`,
    `content_hash`, `signature_ref`, política/template usados e resultado veraPDF, e torna o
    registro imutável. Reemissão cria documento novo com `supersedes_document_id`.
 5. `GET /v1/est/crash/records/{id}/report` obtém o documento pelo agregado no tenant do contexto;
    RLS impede leitura cruzada. A rota não aceita `tenant_id`, chave de armazenamento, ou identidade
    do autor como entrada do cliente.
+6. A permissão funcional `est:crash-record:report` é concedida a `field-agent`,
+   `processing-operator` e `traffic-authority`. Ela preserva a regra transversal já vinculante de
+   `policy.ts`: `ADMIN`, `GESTOR_DETRAN`, `SUPORTE` e `technical-admin` continuam administradores
+   globais. O teste exaustivo nega todos os demais papéis canônicos e cobre tenant divergente.
+7. O blueprint `BP-EST-CRASH-001` é a autoridade de
+   `est.crash_report_document`. A linha selada registra template e política,
+   chave de storage, hash, tamanho, resultado veraPDF integral, conformidade,
+   ausência explícita de assinatura e relação de supersessão. Ela nasce já
+   selada depois do upload dos bytes validados. O principal da aplicação recebe
+   apenas `SELECT` e `INSERT`; `UPDATE` e `DELETE` são revogados pelo passe final
+   de privilégios. Bytes usam a coleção `signed-documents` pelo `S3Service` do
+   `StynxStorageModule` montado na composition root.

 ## 3. Ponte PDF/A-2b e estado da fonte

-`LocalPdfRenderBackend` gera bytes com Chromium. Quando recebe `profile: 'pdf-a'`, ele chama
-`PdfAConformanceAdapter.convert(input, request)` e usa o `RenderResult` devolvido. O contrato
-disponível do veraPDF é diferente: `VeraPdfDockerValidator.validate(bytes, opts)` apenas valida.
+O backend real aprovado é o WeasyPrint 70.0, wheel
+`sha256:5043e55e38d2a2af2b2b871e869697b1f65dad5f8b4a3677961d04ceacf9c5fe`, que gera
+diretamente PDF/A-2b a partir do HTML controlado. O contrato do veraPDF continua separado:
+`VeraPdfDockerValidator.validate(bytes, opts)` apenas valida.

 Portanto a montagem deve conter, nesta ordem:

-1. renderização real com Chromium;
-2. conversor PDF/A-2b real e reproduzível, identificado por fonte e dependência;
-3. nova `RenderResult` com bytes convertidos, SHA-256 e número de páginas recomputados e
+1. renderização/conversão real com WeasyPrint 70.0 e `--pdf-variant pdf/a-2b`;
+2. nova `RenderResult` com bytes produzidos, SHA-256 e número de páginas computados e
    `metadata.profile='pdf-a'`;
-4. `VeraPdfDockerValidator.validate(convertedBytes, { version: 'A-2', conformance: 'b' })` em
-   contêiner com imagem por digest imutável;
-5. assinatura e selo somente após `valid=true`.
+3. `VeraPdfDockerValidator.validate(convertedBytes, { version: 'A-2', conformance: 'b' })` na
+   imagem `verapdf/cli@sha256:20202b4bcc2410a25db1f637c7b461a2e0dda1d97dd8a6df658286b30d56c842`;
+4. selo somente após `valid=true`.

-Não há, nas fontes fornecidas, conversor PDF/A-2b que implemente `convert`, prova de bytes
-positivos de produção, ou resolução verificável do digest veraPDF. A ilustração de README não
-resolve digest de produção. Estes itens são `source_pending`; enquanto persistirem, C-2-13 fica
-aberto e a implementação não emite relatório selado como PDF/A. `createFixturePdfBackend`,
-`NoopPdfAValidator`, `StrictPdfAValidator`, marcador `%PDF` e wrapper de repasse são inválidos
-como prova.
+Em 2026-09-20 o maestro resolveu o digest no Docker Hub por `docker buildx imagetools inspect` e
+`docker pull`, e provou um PDF/A-2b positivo gerado pelo WeasyPrint 70.0: o veraPDF 1.30.1 reportou
+144 regras e 1.401 checks aprovados, sem falha. TASK-0016 deve reproduzir a prova no tier `real`;
+C-2-13 permanece aberto até o caminho de produção passar. `createFixturePdfBackend`,
+`NoopPdfAValidator`, `StrictPdfAValidator` e marcador `%PDF` são inválidos como prova.

 ## 4. Critérios D-13 para Inspector

@@ -74,17 +93,20 @@ como prova.
   `RELATORIO_PRELIMINAR_SINISTRO`, a chave e a versão especificadas, sem mudar os doze existentes.
 - **D-13-02:** template e política são resolvidos por tenant/agência sob RLS; tenant cruzado e
   política/template ausentes falham fechados.
-- **D-13-03:** o tier `real` usa `LocalPdfRenderBackend`, conversor PDF/A-2b aprovado e veraPDF
+- **D-13-03:** o tier `real` usa o backend WeasyPrint 70.0 aprovado e veraPDF
   por digest; bytes positivos retornam `valid=true`, `A-2`/`b`, e o hash selado é o hash dos bytes
   validados.
 - **D-13-04:** bytes inválidos, falha do conversor, Docker indisponível, imagem ausente ou
   resultado veraPDF inválido impedem `seal`; não há `skip`, double, marcador textual ou fallback.
 - **D-13-05:** e2e prova a rota, política, contexto tenant/RLS e falha fechada com runner
   injetável, sem alegar conformidade nem carregar provedor real.
-- **D-13-06:** `sign` só é chamado depois da resolução explícita da política; campos legais ou de
-  assinatura `source_pending` impedem emissão.
+- **D-13-06:** a política D1 não chama `sign`, registra `signatureRef=null` e inclui literalmente o
+  aviso aprovado; política divergente falha fechada.
 - **D-13-07:** uma segunda emissão preserva o documento anterior e cria sucessor ligado; tentativa
   de alterar bytes, hash, evidência ou `storage_key` de documento selado falha.
+- **D-13-08:** reinício da fachada não perde documento selado; metadados vêm de
+  `est.crash_report_document`, bytes vêm do storage STYNX e a prova de integração
+  confirma RLS forçado e ausência de `UPDATE`/`DELETE` para `role_app_backend`.

 ## 5. Fronteira do Engineer e pendências

@@ -93,11 +115,10 @@ lista canônica conforme este contrato e cria o job `boat-pdf-a` na CI. O job pr
 o conversor aprovado e a imagem veraPDF resolvida por digest; também ajusta o timeout do tier
 `real` para renderização, conversão e validação. A aplicação BOAT chama somente a fachada.

-`source_pending` que impede C-2-13: (a) fonte, dependência e reprodução do conversor PDF/A-2b;
-(b) bytes positivos de produção; (c) digest veraPDF com registry, data e método de resolução; e
-(d) política de assinatura e conteúdo informativo do relatório preliminar. Os campos mínimos e
-demais requisitos do BAT oficial continuam `source_pending` sob DT-061/OD-B08, mas, por decisão
-expressa do Owner, não impedem C-2-13 e não podem ser inferidos deste relatório.
+As fontes e a política necessárias ao desenvolvimento estão resolvidas. C-2-13 só fecha quando
+TASK-0016/0017 reproduzirem o caminho real e seus gates. Os campos mínimos e demais requisitos do
+BAT oficial continuam `source_pending` sob DT-061/OD-B08, não impedem C-2-13 e não podem ser
+inferidos deste relatório.

 As opções e os defaults propostos, ainda sujeitos à decisão do Owner, estão em
 `reports/pdfa-signature-options-2026-09-19.md`.
diff --git a/work/rounds/R-0010/plan.md b/work/rounds/R-0010/plan.md
index 63b0a3b7..1fdf77b0 100644
--- a/work/rounds/R-0010/plan.md
+++ b/work/rounds/R-0010/plan.md
@@ -1,7 +1,9 @@
 # R-0010 — frente `boat-backend` (WP-B0…B3 do BOAT: política, modelo `est/crash`, comandos, sincronização, RENAEST e contratos)

-**Status:** CTG-0001 integrado pelo PR #55 em `4f0345532433fb37670447fe22f32bc95ffc0f9e`. Em CTG-0002, TASK-0007…0015, TASK-0018…0022 estão concluídas; contratos passaram 40/40 testes e `contracts:check` com 152 operações e 61 clientes. Em 2026-09-19, o Owner autorizou `role_app_backend` a executar somente a função estreita `jobs.discover_active_boat_renaest_tenants()`; TASK-0020 concluiu a porta SQL e o wiring na segunda iteração. O Owner também decidiu que o relatório preliminar pode satisfazer C-2-13 sem alegar ser BAT oficial; os campos do BAT permanecem `source_pending`, mas deixaram de bloquear C-2-13. TASK-0016/0017 permanecem bloqueadas pela escolha da política inicial do relatório e pelas fontes técnicas de PDF/A/veraPDF. CTG-0002 ainda não pode receber revisão final, evidência ou merge. Checkpoint detalhado em §Auditoria de continuidade. Autorização do Owner em
-`AUTHORIZATION.md`. Reviewer: Opus via `tools/orchestra/bridge.sh claude`.
+**Status:** CTG-0001 integrado pelo PR #55 em `4f0345532433fb37670447fe22f32bc95ffc0f9e`. Em CTG-0002, TASK-0007…0015, TASK-0018…0022 estão concluídas; contratos passaram 40/40 testes e `contracts:check` com 152 operações e 61 clientes. Em 2026-09-19, o Owner autorizou `role_app_backend` a executar somente a função estreita `jobs.discover_active_boat_renaest_tenants()`; TASK-0020 concluiu a porta SQL e o wiring na segunda iteração. O Owner decidiu que o relatório preliminar pode satisfazer C-2-13 sem alegar ser BAT oficial e, em 2026-09-20, aprovou o Default D1 completo. WeasyPrint 70.0 e o digest veraPDF foram resolvidos e uma prova preliminar PDF/A-2b passou; TASK-0016/0017 estão desbloqueadas para execução sequencial. CTG-0002 ainda não pode receber revisão final, evidência ou merge antes dos gates. Checkpoint detalhado em §Auditoria de continuidade. Autorização do Owner em
+`AUTHORIZATION.md`. Reviewer: by temporary Owner exception on 2026-09-20, an
+isolated Codex Auditor via `tools/orchestra/bridge.sh codex` during this session;
+the normal Opus reviewer resumes when the Owner reports Claude available.
 **Concorrência:** R-0005, R-0008 e R-0009 estão em `main`. Fila de sincronização em `backend/domains/ops/offline-sync` (contrato em `work/rounds/R-0008/contracts/CTG-0002.md`; schema `docs/framework/schemas/teat-offline-sync-batch.schema.json`); evidência em `backend/domains/ops/evidence`; `DetranError`, `check-commands.mjs`, `contracts:clients` (`@detran/api-clients`) e `policy-routes.e2e.spec.ts` prontos (estender com `est:*`). Na inspeção de 2026-09-19, a worktree R-0007 `rait-backend` só mantém alterações nos três caminhos de composição `backend/app/src/app.module.ts`, `package.json` e `pnpm-lock.yaml`; os caminhos de documentos/ADR/catálogo normativo não aparecem modificados. A R-0007 confirmou documentalmente que `MOD-shared-documents`, `MOD-adr-0018`, `MOD-inf-normative-document-catalogue` e `MOD-rait-test-strategy` foram liberados no fechamento local de CTG-0001/CTG-0002. Os Engineers de projeções/job/documentos serializam `app.module.ts`.
 **Janelas previstas:** 3.

@@ -63,7 +65,10 @@ anteriores em TEAT/Portal, fora da alteração do job. TASK-0016/0017 continuam
 paradas pelas fontes técnicas de PDF/A/veraPDF e pela política inicial do
 relatório registradas por TASK-0015. A decisão Owner de 2026-09-19 retirou os
 campos normativos do BAT dessa lista de bloqueios: o BAT permanece
-`source_pending` sob DT-061/OD-B08 e não é inferido do relatório.
+`source_pending` sob DT-061/OD-B08 e não é inferido do relatório. Em 2026-09-20,
+o Owner aprovou o Default D1 completo; o maestro resolveu os pinos técnicos e
+provou preliminarmente WeasyPrint 70.0 → PDF/A-2b → veraPDF 1.30.1. TASK-0016
+e TASK-0017 estão liberadas, mantendo C-2-13 aberto até o gate real de produção.

 **Continuidade desbloqueada concluída em 2026-09-19:** TASK-0007 passou a
 emitir `schemaVersion: 1` separado da versão do agregado; banco descartável
@@ -296,6 +301,22 @@ ao reviewer produziu JSON inválido e foi rejeitado pela ponte, sem veredito.

 ## Triagem

+- Integração R-0007 sobre Default D1: `plant-bug` em quatro contratos de
+  integração. O inventário fechado de `apply.sh` foi atualizado de 57 para 60
+  DDLs ordinários (63 arquivos com os três scripts manuais); o grant global do
+  DDL 20 passou a restaurar condicionalmente a revogação append-only após o DDL
+  70; `72-fixtures-boat-projections.sql` entrou nos dois perfis fechados de
+  seed; e o sensor de worklist volta à identidade owner antes de comparar a
+  evidência visível antes/depois da negação RLS. Nenhum teste foi relaxado.
+  A primeira repetição do E2E completo teve `sensor-error` transitório do
+  parser HTTP em `portal-payload-lint`; a suíte passou isoladamente 27/27 e o
+  E2E completo passou no rerun com 382 testes e 2 `todo`. Upgrade 18/18, real
+  PDF/A 2/2, blueprints e `pnpm check` passaram.
+
+- TASK-0016/0017 Default D1: a primeira execução agregada de backend não exportou `DB_NAME`, então um sensor interno usou o banco padrão parcial; classificação `sensor-error`. A repetição com banco dedicado passou unit e integration. A primeira repetição E2E encontrou o mock SENATRAN inativo; classificação `sensor-error`. Com o mock oficial ativo, `pnpm backend:test:e2e` passou 20 arquivos, 267 testes e 2 `todo` preexistentes. Nenhum teste foi relaxado.
+
+- TASK-0016/0017 pós-D-13-08: o primeiro `backend:test:ci` encontrou a asserção estrutural ainda fixada em 11 entidades após a adição Architect de `CrashReportDocument`; classificação `plant-bug`. A expectativa foi atualizada para as 12 entidades autorizadas pelo blueprint. O primeiro teste dirigido sem `DB_NAME` repetiu o sensor do banco padrão parcial; com `DB_NAME=detran_r10_documents`, EST integration passou 21/21. Após reset completo, duas execuções de seed e mock SENATRAN ativo, `pnpm backend:test:ci` passou integralmente, inclusive app E2E 20 arquivos, 267 testes e 2 `todo`.
+
 - Integração pós-R-0009, gate `backend:test:ci`: primeira execução parou em
   `portal-identity` por instalação ausente no worktree; `pnpm install
 --frozen-lockfile` restaurou os links de workspace sem mudar o lockfile.
@@ -432,6 +453,34 @@ do titular e os controles de RN-DASH-161 permanecem fronteiras explícitas.

 ## Retomada

+### Checkpoint Default D1 pós-R-0007 — 2026-09-20
+
+- Branch publicado `orchestra/boat-backend`, HEAD
+  `8aa5b5f9` após merge normal de `origin/main=a0f62cb67383ba31354f4c72e24bec91a3f22138`.
+  Alterações locais do Default D1 permanecem sem commit; stash de segurança
+  `stash@{0}` e snapshot `/tmp/r0010-documents-pre-r0007-1789880912` foram
+  preservados.
+- TASK-0016 e TASK-0017 estão `completed`. Default D1 produz
+  `RELATORIO_PRELIMINAR_SINISTRO` 1.0.0 em PDF/A-2b por WeasyPrint 70.0,
+  valida com veraPDF por digest, sela SHA-256, persiste metadados/evidência SQL
+  append-only sob RLS e bytes no `S3Service` STYNX. BAT oficial e seus campos
+  permanecem `source_pending`.
+- Gates finais: shared 404/404; app unit 116/116; app integration 19/19; Portal
+  projection integration 7/7; E2E completo 382 aprovados e 2 `todo`; upgrade
+  18/18; real documental 2/2 com 1 PostGIS não relacionado ignorado;
+  `blueprints:check`, `git diff --check` e `pnpm check` PASS. O primeiro E2E
+  completo teve erro transitório de parser HTTP; rerun completo e reprodução
+  isolada 27/27 passaram.
+- O reviewer obrigatório ainda não emitiu veredito. A tentativa anterior foi
+  bloqueada pela cota semanal do Claude CLI. Em 2026-09-20, o Owner autorizou
+  excepcionalmente a família Codex como reviewer durante esta sessão, até novo
+  aviso de disponibilidade do Claude. Regenerar o diff/prompt final e executar
+  exatamente `tools/orchestra/bridge.sh codex gpt-5.6-sol
+work/rounds/R-0010/reviews/delivery-review-CTG-0002-documents-cycle-1.md
+work/rounds/R-0010/reviews/delivery-review-CTG-0002-documents-cycle-1.json
+/Volumes/Thiamat\ II/stech/detran-worktrees/boat-backend`. Somente `PASS`
+  libera commit, evidência, push, PR, CI e merge.
+
 ### Decisão do Owner — job mensal

 Em resposta à proposta explícita do maestro (conta técnica auditável por
diff --git a/work/rounds/R-0010/reports/pdfa-signature-options-2026-09-19.md b/work/rounds/R-0010/reports/pdfa-signature-options-2026-09-19.md
index b9547c82..29ce0870 100644
--- a/work/rounds/R-0010/reports/pdfa-signature-options-2026-09-19.md
+++ b/work/rounds/R-0010/reports/pdfa-signature-options-2026-09-19.md
@@ -4,6 +4,8 @@

 **Data da pesquisa:** 2026-09-19

+**Decisão:** Default D1 aprovado integralmente pelo Owner em 2026-09-20.
+
 **Decisão Owner já vigente:** o relatório preliminar pode satisfazer C-2-13 sem alegar ser o BAT
 oficial. Os campos normativos do BAT permanecem `source_pending` sob DT-061/OD-B08 e não
 bloqueiam o relatório preliminar.
@@ -70,10 +72,10 @@ decisão de licença. Fontes: [WeasyPrint API](https://doc.courtbouillon.org/wea
 O veraPDF aceita seleção explícita do perfil `2b`. A organização publica imagem CLI no GHCR; na
 data da pesquisa a página oficial mostrava `v1.31.118` e digest
 `sha256:cfb5bff1a2ea0d19a36bed2d09dd89b1b12ea6c4c01be5836019c37f273512d9`.
-Esse valor é **candidato**, não digest aprovado: a máquina local estava sem daemon Docker e a
-resolução independente ainda não foi concluída. Antes de TASK-0016, o maestro deve resolver a tag
-em ambiente com acesso ao registry, registrar plataforma e manifest digest e provar que o pull por
-digest funciona. Fontes: [veraPDF CLI validation](https://docs.verapdf.org/cli/validation/) e
+O Default D1 usa, em vez desse candidato, o digest já publicado pelo STYNX:
+`verapdf/cli@sha256:20202b4bcc2410a25db1f637c7b461a2e0dda1d97dd8a6df658286b30d56c842`.
+Em 2026-09-20 o maestro resolveu o manifesto e executou `docker pull` pelo digest. Fontes:
+[veraPDF CLI validation](https://docs.verapdf.org/cli/validation/) e
 [pacote CLI oficial no GHCR](https://github.com/veraPDF/veraPDF-apps/pkgs/container/cli).

 Default ajustável:
@@ -114,9 +116,9 @@ Se o Owner optar por assinatura agora, os defaults recomendados são:
 Esses defaults exigem que o Owner indique a autoridade signatária, a política/OID aplicável, o
 provedor de certificado/custódia e a ACT. Portanto são menos adequados para o desbloqueio imediato.

-## 5. Decisões solicitadas ao Owner
+## 5. Decisões aprovadas pelo Owner

-Para liberar TASK-0016/0017 pelo caminho mais curto, basta aprovar em conjunto:
+O Owner aprovou em conjunto:

 1. **D1-a:** relatório preliminar inicialmente sem PAdES, TSA ou gov.br, com selo técnico
    imutável;
@@ -124,10 +126,11 @@ Para liberar TASK-0016/0017 pelo caminho mais curto, basta aprovar em conjunto:
 3. **D1-c:** WeasyPrint como backend real aprovado para PDF/A-2b, sempre seguido de veraPDF;
 4. **D1-d:** parâmetros ajustáveis de §2/§3 e resolução do digest pelo maestro antes do RED real.

-Depois dessa manifestação, o maestro ainda precisa produzir duas evidências técnicas antes do
-despacho do Inspector: digest veraPDF resolvido por plataforma e um PDF/A-2b positivo gerado pelo
-caminho escolhido e aprovado pelo veraPDF. Isso é trabalho de engenharia reproduzível, não uma
-nova decisão de produto.
+As duas evidências técnicas preliminares também foram produzidas em 2026-09-20. O wheel oficial do
+WeasyPrint 70.0 tem SHA-256
+`5043e55e38d2a2af2b2b871e869697b1f65dad5f8b4a3677961d04ceacf9c5fe`. Um PDF gerado com
+`--pdf-variant pdf/a-2b` foi aceito pelo veraPDF 1.30.1 com 144 regras e 1.401 checks aprovados. O
+tier `real` deve reproduzir a prova no código de produção; a execução preliminar não fecha C-2-13.

 Se D1-c for rejeitada por impacto de layout, a segunda melhor escolha é Chromium + Ghostscript,
 condicionada à aprovação explícita da licença aplicável. A exigência futura de assinatura deve ser
diff --git a/work/rounds/R-0010/tasks/TASK-0015.json b/work/rounds/R-0010/tasks/TASK-0015.json
index 9c14730d..e504a74c 100644
--- a/work/rounds/R-0010/tasks/TASK-0015.json
+++ b/work/rounds/R-0010/tasks/TASK-0015.json
@@ -6,14 +6,17 @@
   "discipline": "architect",
   "discipline_specialization": "architect-blueprint",
   "title": "Especificar o relatório preliminar BOAT na fachada de documentos",
-  "description": "Fixar em contrato e emenda à ADR-0018 o DocumentKind, template versionado, política de assinatura e PDF/A-2b do relatório preliminar UC-1.251, preservando o BAT oficial como source_pending sob DT-061 e a propriedade do catálogo inf/normative.",
+  "description": "Fixar em contrato e emenda à ADR-0018 o DocumentKind, template versionado, política de assinatura e PDF/A-2b do relatório preliminar UC-1.251, preservando o BAT oficial como source_pending sob DT-061 e a propriedade do catálogo inf/normative. A correção Architect D-13-08 especifica a persistência blueprint-owned e a imutabilidade por privilégios antes das correções Inspector/Engineer.",
   "lifecycle": "supported",
   "target_modules": [
     "MOD-shared-documents",
     "MOD-est-document-template",
     "MOD-adr-0018",
     "MOD-inf-normative-document-catalogue",
-    "MOD-rait-test-strategy"
+    "MOD-rait-test-strategy",
+    "MOD-est-crash-blueprint",
+    "MOD-ddl-70",
+    "MOD-rls-policy"
   ],
   "target_substrates": ["F2"],
   "target_invariants": [],
@@ -21,7 +24,7 @@
   "coupled_pipeline_position": "architect",
   "upstream_task_id": "TASK-0005",
   "db_isolation": "database",
-  "iteration_count": 1,
+  "iteration_count": 2,
   "max_iterations": 2,
   "priority": 15,
   "tags": ["wp-b2", "documents", "adenda-a1"],
@@ -35,7 +38,9 @@
       "docs/meta/adr/ADR-0018-documents-and-signature-substrate.md",
       "docs/framework/arch/rait-test-strategy.md",
       "work/rounds/R-0010/contracts/CTG-0002-documents.md"
-    ]
+    ],
+    ["pnpm", "blueprints:check"],
+    ["pnpm", "verify:rls-ddl"]
   ],
   "created_at": "2026-09-16T21:40:50Z",
   "executor": {
diff --git a/work/rounds/R-0010/tasks/TASK-0016.json b/work/rounds/R-0010/tasks/TASK-0016.json
index 66092364..f4136c3d 100644
--- a/work/rounds/R-0010/tasks/TASK-0016.json
+++ b/work/rounds/R-0010/tasks/TASK-0016.json
@@ -2,7 +2,7 @@
   "schemaVersion": "2.0.0",
   "id": "TASK-0016",
   "round_id": "R-0010",
-  "status": "queued",
+  "status": "completed",
   "discipline": "inspector",
   "discipline_specialization": "inspector-tests",
   "title": "Provar o relatório preliminar PDF/A e a falha de conformidade",
@@ -20,7 +20,7 @@
   "coupled_pipeline_position": "inspector",
   "upstream_task_id": "TASK-0015",
   "db_isolation": "database",
-  "iteration_count": 0,
+  "iteration_count": 1,
   "max_iterations": 2,
   "priority": 16,
   "tags": ["wp-b2", "documents", "adenda-a1"],
@@ -47,5 +47,6 @@
     "prompt_composition_id": "PC-449797d942c60f16",
     "max_iterations": 2,
     "capabilities": ["read", "local-write"]
-  }
+  },
+  "completed_at": "2026-09-20T03:54:00Z"
 }
diff --git a/work/rounds/R-0010/tasks/TASK-0017.json b/work/rounds/R-0010/tasks/TASK-0017.json
index 3ff7ff23..67314a03 100644
--- a/work/rounds/R-0010/tasks/TASK-0017.json
+++ b/work/rounds/R-0010/tasks/TASK-0017.json
@@ -2,7 +2,7 @@
   "schemaVersion": "2.0.0",
   "id": "TASK-0017",
   "round_id": "R-0010",
-  "status": "queued",
+  "status": "completed",
   "discipline": "engineer",
   "discipline_specialization": "engineer-backend",
   "title": "Montar a fachada STYNX e servir o relatório preliminar PDF/A",
@@ -21,7 +21,7 @@
   "coupled_pipeline_position": "engineer",
   "upstream_task_id": "TASK-0016",
   "db_isolation": "database",
-  "iteration_count": 0,
+  "iteration_count": 1,
   "max_iterations": 2,
   "priority": 17,
   "tags": ["wp-b2", "documents", "adenda-a1"],
@@ -50,5 +50,6 @@
     "prompt_composition_id": "PC-fbae6fd4429b8d4b",
     "max_iterations": 2,
     "capabilities": ["read", "local-write"]
-  }
+  },
+  "completed_at": "2026-09-20T03:54:00Z"
 }

```
