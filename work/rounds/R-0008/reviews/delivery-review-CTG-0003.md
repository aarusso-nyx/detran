# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `teat-backend` (rodada `R-0008`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/teat-build-pack.md` — apenas a seção do WP `WP-T2` e o "mapa entregável → definições"
4. `work/rounds/R-0008/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0008/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0008/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0008",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0008/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

## Nota do maestro — delivery-review CTG-0003 (ciclo 1, exaustivo)

Grupo CTG-0003 = TASK-0001 (contrato `work/rounds/R-0008/contracts/CTG-0003.md`, adendas §12/§13 do maestro), TASK-0006 (Inspector, 2 iterações), TASK-0007 (Engineer, 2 iterações). Relatórios `reports/TASK-0006.md`, `TASK-0007.md`; triagens em `plan.md`. Entrega: evidência (intenção → upload → conclusão, validação, vínculo, custódia, pacote probatório, purga; requisições de acesso a bodycam create/approve/deny/deliver; projeção de bodycam nas leituras manuscritas), snapshots (`POST external-queries` atrás de `SNAPSHOT_QUERY_PORTS`, sem HTTP no módulo), normativo (generate/publish/retire/validate de pacote, `content` assinado local, `sync-metadata`, catálogo publish/retire com `DetranError`), portas `EvidenceStoragePort` (local no perfil de teste) e `PackageSignerPort`, regras `policy.ts` §7, seed `27-fixtures-teat-evidence.sql`, wiring `backend/app/src/teat-evidence.providers.ts`/`teat-snapshots.providers.ts`. Deltas do maestro (Architect): gerador registra controladores manuscritos antes dos gerados (todos os módulos regenerados), `zod` nos três blueprints (`pnpm install`). Decisões OD-T51…T59 em CTG-0003 §13 (T54 códigos HTTP, T55 `metadata_json`, T56 `validate` idempotente, T57 `traffic_agency_id`, T58 `aggregate.version`, T59 limite do modelo). Gates (Engineer iteração 2): ops-evidence unit 36 / integration 5; ops-snapshots 7 / 2; inf-normative 17 / 3; inf-ait integration 24; app e2e 73/73; shared 165/165; `verify:decorators` 858, `blueprints:check`, `contracts:check`, `format:check` verdes; `pnpm check` + `backend:test:ci` completos em execução no envio (registrados antes do commit). Anexos: A stat; B diff dos manuscritos/testes/política/app/seed/blueprints (blocos); C gerados; relatórios.

## Anexo A — `git diff --stat`

```text
 backend/app/src/app.module.ts                      |   4 +
 backend/app/src/teat-evidence.providers.ts         |  78 ++++
 backend/app/src/teat-snapshots.providers.ts        |  25 ++
 .../tests/e2e/teat-evidence-normative.e2e.spec.ts  | 378 ++++++++++++++++++
 backend/database/ddl/16-ops-snapshots.sql          |   2 +-
 backend/database/ddl/17-ops-evidence.sql           |   2 +-
 backend/database/ddl/30-inf-normative.sql          |   2 +-
 .../database/seed/27-fixtures-teat-evidence.sql    | 125 ++++++
 backend/domains/inf/normative/package.json         |   1 +
 .../mobile-normative-package.controller.ts         |   2 +-
 .../normative-agency-parameter.controller.ts       |   2 +-
 .../controllers/normative-catalog.controller.ts    |   2 +-
 .../normative-document-template.controller.ts      |   2 +-
 .../controllers/normative-framing.controller.ts    |   2 +-
 .../normative-metrological-table.controller.ts     |   2 +-
 .../normative-validation-rule.controller.ts        |   2 +-
 .../src/controllers/signature-policy.controller.ts |   2 +-
 .../src/dto/create-mobile-normative-package.dto.ts |   2 +-
 .../dto/create-normative-agency-parameter.dto.ts   |   2 +-
 .../src/dto/create-normative-catalog.dto.ts        |   2 +-
 .../dto/create-normative-document-template.dto.ts  |   2 +-
 .../src/dto/create-normative-framing.dto.ts        |   2 +-
 .../dto/create-normative-metrological-table.dto.ts |   2 +-
 .../dto/create-normative-validation-rule.dto.ts    |   2 +-
 .../src/dto/create-signature-policy.dto.ts         |   2 +-
 .../entities/mobile-normative-package.entity.ts    |   2 +-
 .../entities/normative-agency-parameter.entity.ts  |   2 +-
 .../src/entities/normative-catalog.entity.ts       |   2 +-
 .../entities/normative-document-template.entity.ts |   2 +-
 .../src/entities/normative-framing.entity.ts       |   2 +-
 .../normative-metrological-table.entity.ts         |   2 +-
 .../entities/normative-validation-rule.entity.ts   |   2 +-
 .../src/entities/signature-policy.entity.ts        |   2 +-
 .../inf/normative/src/handwritten/events.ts        | 153 ++++++++
 .../handwritten/generate-package.command.spec.ts   | 246 ++++++++++++
 .../src/handwritten/generate-package.command.ts    | 139 +++++++
 .../inf/normative/src/handwritten/manifest.ts      | 103 +++++
 .../src/handwritten/normative-commands.provider.ts |  41 ++
 .../src/handwritten/normative-commands.service.ts  |  99 +++++
 .../normative/src/handwritten/normative-runtime.ts | 312 +++++++++++++++
 .../src/handwritten/package-content.query.spec.ts  | 185 +++++++++
 .../src/handwritten/package-content.query.ts       |  61 +++
 .../normative/src/handwritten/package-signer.ts    |  23 ++
 .../src/handwritten/package-sync-metadata.query.ts |  59 +++
 .../src/handwritten/publish-catalog.command.ts     | 117 ++++++
 .../handwritten/publish-package.command.spec.ts    | 208 ++++++++++
 .../src/handwritten/publish-package.command.ts     | 140 +++++++
 .../handwritten/validate-package.command.spec.ts   | 186 +++++++++
 .../src/handwritten/validate-package.command.ts    |  59 +++
 backend/domains/inf/normative/src/index.ts         |  14 +-
 .../normative/src/normative-commands.controller.ts |  81 ++--
 .../normative/src/normative-lifecycle.service.ts   | 105 +----
 .../domains/inf/normative/src/normative.module.ts  |   4 +-
 .../mobile-normative-package.repository.ts         |   2 +-
 .../normative-agency-parameter.repository.ts       |   2 +-
 .../repositories/normative-catalog.repository.ts   |   2 +-
 .../normative-document-template.repository.ts      |   2 +-
 .../repositories/normative-framing.repository.ts   |   2 +-
 .../normative-metrological-table.repository.ts     |   2 +-
 .../normative-validation-rule.repository.ts        |   2 +-
 .../repositories/signature-policy.repository.ts    |   2 +-
 .../services/mobile-normative-package.service.ts   |   2 +-
 .../services/normative-agency-parameter.service.ts |   2 +-
 .../src/services/normative-catalog.service.ts      |   2 +-
 .../normative-document-template.service.ts         |   2 +-
 .../src/services/normative-framing.service.ts      |   2 +-
 .../normative-metrological-table.service.ts        |   2 +-
 .../services/normative-validation-rule.service.ts  |   2 +-
 .../src/services/signature-policy.service.ts       |   2 +-
 .../catalog-publish.integration.spec.ts            | 106 +++++
 .../inf/normative/tests/integration/harness.ts     | 262 +++++++++++++
 .../package-publish.integration.spec.ts            | 166 ++++++++
 backend/domains/ops/core/src/storage.ts            |  15 +
 backend/domains/ops/evidence/package.json          |   1 +
 .../src/controllers/custody-event.controller.ts    |   2 +-
 .../evidence-access-request.controller.ts          |   2 +-
 .../src/controllers/evidence-link.controller.ts    |   2 +-
 .../src/controllers/evidence.controller.ts         |   2 +-
 .../probative-package-item.controller.ts           |   2 +-
 .../controllers/probative-package.controller.ts    |   2 +-
 .../src/controllers/storage-intent.controller.ts   |   2 +-
 .../evidence/src/dto/create-custody-event.dto.ts   |   2 +-
 .../src/dto/create-evidence-access-request.dto.ts  |   2 +-
 .../evidence/src/dto/create-evidence-link.dto.ts   |   2 +-
 .../ops/evidence/src/dto/create-evidence.dto.ts    |   2 +-
 .../src/dto/create-probative-package-item.dto.ts   |   2 +-
 .../src/dto/create-probative-package.dto.ts        |   2 +-
 .../evidence/src/dto/create-storage-intent.dto.ts  |   2 +-
 .../evidence/src/entities/custody-event.entity.ts  |   2 +-
 .../src/entities/evidence-access-request.entity.ts |   2 +-
 .../evidence/src/entities/evidence-link.entity.ts  |   2 +-
 .../ops/evidence/src/entities/evidence.entity.ts   |   2 +-
 .../src/entities/probative-package-item.entity.ts  |   2 +-
 .../src/entities/probative-package.entity.ts       |   2 +-
 .../evidence/src/entities/storage-intent.entity.ts |   2 +-
 .../domains/ops/evidence/src/evidence.module.ts    |   8 +-
 .../handwritten/access-request.commands.spec.ts    | 249 ++++++++++++
 .../handwritten/add-custody-event.command.spec.ts  | 155 ++++++++
 .../src/handwritten/add-custody-event.command.ts   |  99 +++++
 .../src/handwritten/bodycam-projection.spec.ts     | 105 +++++
 .../evidence/src/handwritten/bodycam-projection.ts |  40 ++
 .../handwritten/complete-upload.command.spec.ts    | 236 ++++++++++++
 .../src/handwritten/complete-upload.command.ts     | 157 ++++++++
 .../handwritten/create-access-request.command.ts   |  85 ++++
 .../handwritten/decide-access-request.command.ts   | 100 +++++
 .../handwritten/deliver-access-request.command.ts  | 117 ++++++
 .../domains/ops/evidence/src/handwritten/events.ts | 237 ++++++++++++
 .../src/handwritten/evidence-access.controller.ts  |  59 +++
 .../src/handwritten/evidence-commands.provider.ts  |  46 +++
 .../src/handwritten/evidence-commands.service.ts   | 183 +++++++++
 .../src/handwritten/evidence-custody.controller.ts | 109 ++++--
 .../src/handwritten/evidence-custody.provider.ts   |  25 --
 .../src/handwritten/evidence-custody.service.ts    |  19 -
 .../evidence/src/handwritten/evidence-runtime.ts   | 376 ++++++++++++++++++
 .../generate-probative-package.command.spec.ts     | 180 +++++++++
 .../generate-probative-package.command.ts          | 198 ++++++++++
 .../handwritten/initiate-upload.command.spec.ts    | 243 ++++++++++++
 .../src/handwritten/initiate-upload.command.ts     | 306 +++++++++++++++
 .../src/handwritten/link-evidence.command.ts       | 126 ++++++
 .../src/handwritten/local-evidence-storage.ts      |  34 ++
 .../ops/evidence/src/handwritten/manifest.ts       |  54 +++
 .../src/handwritten/purge-unverified.command.ts    | 133 +++++++
 .../handwritten/validate-evidence.command.spec.ts  | 166 ++++++++
 .../src/handwritten/validate-evidence.command.ts   | 110 ++++++
 backend/domains/ops/evidence/src/index.ts          |  22 +-
 .../src/repositories/custody-event.repository.ts   |   2 +-
 .../evidence-access-request.repository.ts          |   2 +-
 .../src/repositories/evidence-link.repository.ts   |   2 +-
 .../src/repositories/evidence.repository.ts        |   2 +-
 .../probative-package-item.repository.ts           |   2 +-
 .../repositories/probative-package.repository.ts   |   2 +-
 .../src/repositories/storage-intent.repository.ts  |   2 +-
 .../evidence/src/services/custody-event.service.ts |   2 +-
 .../services/evidence-access-request.service.ts    |   2 +-
 .../evidence/src/services/evidence-link.service.ts |   2 +-
 .../ops/evidence/src/services/evidence.service.ts  |   2 +-
 .../src/services/probative-package-item.service.ts |   2 +-
 .../src/services/probative-package.service.ts      |   2 +-
 .../src/services/storage-intent.service.ts         |   2 +-
 .../complete-upload.integration.spec.ts            | 148 +++++++
 .../deliver-access-request.integration.spec.ts     | 140 +++++++
 .../generate-probative-package.integration.spec.ts | 136 +++++++
 .../ops/evidence/tests/integration/harness.ts      | 360 +++++++++++++++++
 .../purge-unverified.integration.spec.ts           | 126 ++++++
 backend/domains/ops/snapshots/package.json         |   1 +
 .../src/controllers/external-query.controller.ts   |   2 +-
 .../src/controllers/person-document.controller.ts  |   2 +-
 .../snapshots/src/controllers/person.controller.ts |   2 +-
 .../src/controllers/vehicle-snapshot.controller.ts |   2 +-
 .../src/controllers/vehicle.controller.ts          |   2 +-
 .../snapshots/src/dto/create-external-query.dto.ts |   2 +-
 .../src/dto/create-person-document.dto.ts          |   2 +-
 .../ops/snapshots/src/dto/create-person.dto.ts     |   2 +-
 .../src/dto/create-vehicle-snapshot.dto.ts         |   2 +-
 .../ops/snapshots/src/dto/create-vehicle.dto.ts    |   2 +-
 .../src/entities/external-query.entity.ts          |   2 +-
 .../src/entities/person-document.entity.ts         |   2 +-
 .../ops/snapshots/src/entities/person.entity.ts    |   2 +-
 .../src/entities/vehicle-snapshot.entity.ts        |   2 +-
 .../ops/snapshots/src/entities/vehicle.entity.ts   |   2 +-
 .../ops/snapshots/src/handwritten/events.ts        |  51 +++
 .../src/handwritten/external-query.command.spec.ts | 319 +++++++++++++++
 .../src/handwritten/external-query.command.ts      | 429 +++++++++++++++++++++
 .../src/handwritten/external-query.provider.ts     |  50 +++
 .../src/handwritten/frozen-snapshot.controller.ts  |  56 ++-
 .../src/handwritten/frozen-snapshot.provider.ts    |  24 --
 .../src/handwritten/frozen-snapshot.service.ts     |  18 -
 .../snapshots/src/handwritten/snapshots-runtime.ts | 252 ++++++++++++
 backend/domains/ops/snapshots/src/index.ts         |   8 +-
 .../src/repositories/external-query.repository.ts  |   2 +-
 .../src/repositories/person-document.repository.ts |   2 +-
 .../src/repositories/person.repository.ts          |   2 +-
 .../repositories/vehicle-snapshot.repository.ts    |   2 +-
 .../src/repositories/vehicle.repository.ts         |   2 +-
 .../src/services/external-query.service.ts         |   2 +-
 .../src/services/person-document.service.ts        |   2 +-
 .../ops/snapshots/src/services/person.service.ts   |   2 +-
 .../src/services/vehicle-snapshot.service.ts       |   2 +-
 .../ops/snapshots/src/services/vehicle.service.ts  |   2 +-
 .../domains/ops/snapshots/src/snapshots.module.ts  |   6 +-
 .../integration/external-query.integration.spec.ts | 108 ++++++
 .../ops/snapshots/tests/integration/harness.ts     | 248 ++++++++++++
 .../senatran-boundary.integration.spec.ts          |  58 +++
 backend/domains/shared/src/policy.spec.ts          | 336 +++++++++++++++-
 backend/domains/shared/src/policy.ts               | 177 +++++----
 .../framework/blueprints/BP-INF-NORMATIVE-001.json | 124 +++++-
 docs/framework/blueprints/BP-OPS-EVIDENCE-001.json |  32 +-
 .../framework/blueprints/BP-OPS-SNAPSHOTS-001.json |  16 +-
 package.json                                       |   4 +-
 pnpm-lock.yaml                                     |   9 +
 work/rounds/R-0008/budget.json                     |  12 +-
 work/rounds/R-0008/contracts/CTG-0003.md           |  29 ++
 192 files changed, 10476 insertions(+), 480 deletions(-)

```

## Anexo B — diff

```diff
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index cb742d2..24eeab8 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -97,6 +97,8 @@ import {
   isLocalRuntimeProfile,
 } from './detran-runtime.js';
 import { TeatSyncModule } from './teat-sync.providers.js';
+import { TeatEvidencePortsModule } from './teat-evidence.providers.js';
+import { TeatSnapshotPortsModule } from './teat-snapshots.providers.js';
 import {
   DetranSessionReadinessBinder,
   DetranSessionStrongFactorGuard,
@@ -352,6 +354,8 @@ export class AppModule {
         // Portas do protocolo de sincronização (CTG-0002 §4.8) antes dos
         // módulos que as consomem.
         TeatSyncModule,
+        TeatEvidencePortsModule,
+        TeatSnapshotPortsModule,
         NormativeModule,
         ParameterModule,
         AitModule,
diff --git a/backend/app/src/teat-evidence.providers.ts b/backend/app/src/teat-evidence.providers.ts
new file mode 100644
index 0000000..04de8d9
--- /dev/null
+++ b/backend/app/src/teat-evidence.providers.ts
@@ -0,0 +1,78 @@
+// CTG-0003 §4.1 e §11 (M11, R-0008, TASK-0007) — composição de
+// `EvidenceStoragePort` no app.
+//
+// Perfil local/test: `LocalEvidenceStorage`, que devolve
+// `local://<object_key>` e a janela de upload do próprio substrato de storage
+// (`detranStorageOptions()`), nunca uma constante do domínio (M11). Fora
+// dele: `@stynx-nyx/storage` `S3Service.presignUpload`. A janela de expiração
+// é sempre a que a porta devolve.
+//
+// `APPLIED_ENTITY_PORTS` já é provido por `TeatSyncModule` (CTG-0002 §4.8) e
+// é consumido daqui pelos comandos de evidência.
+import { Global, Module, Optional } from '@nestjs/common';
+import { S3Service } from '@stynx-nyx/storage';
+import {
+  EVIDENCE_STORAGE_PORT,
+  systemOpsClock,
+  type EvidenceStoragePort,
+} from '@detran/ops-core';
+import { LocalEvidenceStorage } from '@detran/ops-evidence';
+
+import {
+  detranRuntimeProfile,
+  detranStorageOptions,
+  isLocalRuntimeProfile,
+} from './detran-runtime.js';
+
+/** Janela de upload do substrato STYNX (`S3Service`, padrão publicado). */
+const STYNX_DEFAULT_UPLOAD_EXPIRES_IN_SECONDS = 300;
+
+export class S3EvidenceStorage implements EvidenceStoragePort {
+  constructor(private readonly s3: S3Service) {}
+
+  async presignUpload(input: {
+    objectKey: string;
+    mimeType: string;
+    sizeBytes: number;
+    hashValue?: string;
+  }): Promise<{ uploadUrl: string; expiresAt: string }> {
+    const presigned = await this.s3.presignUpload({
+      key: input.objectKey,
+      contentType: input.mimeType,
+      checksumSha256: (input.hashValue ?? '').replace(/^sha256:/iu, ''),
+    });
+    const issuedAt = new Date(systemOpsClock.now()).getTime();
+    return {
+      uploadUrl: presigned.url,
+      expiresAt: new Date(
+        issuedAt + presigned.expiresInSeconds * 1000,
+      ).toISOString(),
+    };
+  }
+}
+
+export const TEAT_EVIDENCE_STORAGE_PROVIDER = {
+  provide: EVIDENCE_STORAGE_PORT,
+  inject: [{ token: S3Service, optional: true }],
+  useFactory: (s3?: S3Service): EvidenceStoragePort => {
+    if (!isLocalRuntimeProfile(detranRuntimeProfile()) && s3)
+      return new S3EvidenceStorage(s3);
+    return new LocalEvidenceStorage({
+      clock: systemOpsClock,
+      expiresInSeconds:
+        detranStorageOptions().uploadExpiresInSeconds ??
+        STYNX_DEFAULT_UPLOAD_EXPIRES_IN_SECONDS,
+    });
+  },
+};
+
+@Global()
+@Module({
+  providers: [TEAT_EVIDENCE_STORAGE_PROVIDER],
+  exports: [EVIDENCE_STORAGE_PORT],
+})
+export class TeatEvidencePortsModule {
+  constructor(@Optional() private readonly s3?: S3Service) {
+    void this.s3;
+  }
+}
diff --git a/backend/app/src/teat-snapshots.providers.ts b/backend/app/src/teat-snapshots.providers.ts
new file mode 100644
index 0000000..dbace0f
--- /dev/null
+++ b/backend/app/src/teat-snapshots.providers.ts
@@ -0,0 +1,25 @@
+// CTG-0003 §5.1 e §11 (M12, R-0008, TASK-0007) — composição de
+// `SNAPSHOT_QUERY_PORTS` no app.
+//
+// As portas são as do `packages/senatran-adapter` (ADR-0003): nenhum módulo
+// de domínio fala com sistema nacional por conta própria, e `ops/snapshots`
+// só conhece a fatia de leitura declarada pelo token.
+import { Global, Module } from '@nestjs/common';
+import { SNAPSHOT_QUERY_PORTS } from '@detran/ops-core';
+import { createSenatranAdapter } from '@detran/senatran-adapter';
+import type { SnapshotQueryPorts } from '@detran/ops-snapshots';
+
+export const TEAT_SNAPSHOT_QUERY_PORTS_PROVIDER = {
+  provide: SNAPSHOT_QUERY_PORTS,
+  useFactory: (): SnapshotQueryPorts => {
+    const { ports } = createSenatranAdapter();
+    return { wsdenatranRead: ports.wsdenatranRead, renach: ports.renach };
+  },
+};
+
+@Global()
+@Module({
+  providers: [TEAT_SNAPSHOT_QUERY_PORTS_PROVIDER],
+  exports: [SNAPSHOT_QUERY_PORTS],
+})
+export class TeatSnapshotPortsModule {}
diff --git a/backend/app/tests/e2e/teat-evidence-normative.e2e.spec.ts b/backend/app/tests/e2e/teat-evidence-normative.e2e.spec.ts
new file mode 100644
index 0000000..f8a6d8f
--- /dev/null
+++ b/backend/app/tests/e2e/teat-evidence-normative.e2e.spec.ts
@@ -0,0 +1,378 @@
+import { randomUUID } from 'node:crypto';
+import type { NestFactory } from '@nestjs/core';
+import pg from 'pg';
+import request from 'supertest';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+/**
+ * CTG-0003 §4/§6/§10 (R-0008, TASK-0006) — C-0003-39…45: as rotas de
+ * evidência, custódia, bodycam e pacote normativo sob o app unificado, com a
+ * guarda de política nos dois sentidos (papel mínimo → 200/201, papel fora
+ * da regra → 403) e a fronteira de rota `v1/ops/…`/`v1/inf/…` (§1).
+ *
+ * A maioria dessas rotas ainda não existe hoje (nascem em TASK-0007, §11);
+ * até lá cada caso falha pelo comportamento ausente — 404 onde se espera
+ * 200/201/403. O controlador `evidence-custody.controller.ts` e
+ * `frozen-snapshot.controller.ts` já montam sob `v1/ops/*` (nota do maestro,
+ * confirmado por leitura direta do arquivo) — C-0003-45 cobre essa fronteira
+ * por enumeração das rotas registradas, não por tentativa de requisição.
+ *
+ * O perfil local resolve `DETRAN_LOCAL_TENANT_ID`/`DETRAN_LOCAL_ACTOR_ID` no
+ * carregamento do módulo, então as duas variáveis são definidas **antes** do
+ * `await import('../../src/app.module.js')` (mesmo padrão de
+ * `teat-field-sync.e2e.spec.ts`).
+ */
+
+const { Client } = pg;
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const EVIDENCE_BODYCAM_VALIDATED = '00000000-0000-7000-8000-0000ef000001';
+const EVIDENCE_QUARANTINED = '00000000-0000-7000-8000-0000ef000004';
+const ACCESS_REQUEST_APPROVED = '00000000-0000-7000-8000-0000ef400002';
+const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
+
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+let startedAt: string;
+const previousEnv: Record<string, string | undefined> = {};
+/** Pacotes e enquadramentos criados pelos casos de C-0003-43b/c (OD-T52); removidos no afterAll. */
+const createdPackageIds: string[] = [];
+const createdFramingIds: string[] = [];
+
+/**
+ * O kernel aplica `@Idempotent()` a toda ação não-leitura (CTG-0001 §13
+ * item 6): corpo divergente sob a mesma `Idempotency-Key` devolve 422. Cada
+ * requisição leva uma chave nova.
+ */
+function headers(role: string): Record<string, string> {
+  process.env.DETRAN_LOCAL_ROLES = role;
+  return {
+    authorization: 'Bearer local',
+    'x-tenant-id': TENANT_ID,
+    'idempotency-key': randomUUID(),
+  };
+}
+
+function server() {
+  return app.getHttpServer();
+}
+
+beforeAll(async () => {
+  for (const key of [
+    'DETRAN_RUNTIME_PROFILE',
+    'DETRAN_LOCAL_TENANT_ID',
+    'DETRAN_LOCAL_ACTOR_ID',
+    'DETRAN_LOCAL_ROLES',
+  ]) {
+    previousEnv[key] = process.env[key];
+  }
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
+  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
+  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+
+  const { NestFactory: factory } = await import('@nestjs/core');
+  const { AppModule } = await import('../../src/app.module.js');
+  app = await factory.create(AppModule.forRoot(), {
+    logger: false,
+    abortOnError: false,
+  });
+  await app.init();
+});
+
+afterAll(async () => {
+  await app?.close();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  // Devolve as fixtures de 27-fixtures-teat-evidence.sql ao estado semeado.
+  await client.query(
+    `delete from ops.storage_intent where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `delete from ops.evidence_evidence
+       where tenant_id = $1 and created_at > $2
+         and id not in ($3, $4)`,
+    [TENANT_ID, startedAt, EVIDENCE_BODYCAM_VALIDATED, EVIDENCE_QUARANTINED],
+  );
+  await client.query(
+    `update ops.evidence_access_request set status = 'approved', delivery_media_ref = null, delivered_at = null
+      where id = $1`,
+    [ACCESS_REQUEST_APPROVED],
+  );
+  if (createdFramingIds.length > 0) {
+    await client.query(
+      `delete from inf.normative_framing where id = any($1::uuid[])`,
+      [createdFramingIds],
+    );
+  }
+  if (createdPackageIds.length > 0) {
+    await client.query(
+      `delete from inf.normative_mobile_package where id = any($1::uuid[])`,
+      [createdPackageIds],
+    );
+  }
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    TENANT_ID,
+  ]);
+  await client.end();
+  for (const [key, value] of Object.entries(previousEnv)) {
+    if (value === undefined) delete process.env[key];
+    else process.env[key] = value;
+  }
+});
+
+describe('CTG-0003 §4.1 — upload-intents: papel mínimo × papel fora da regra (C-0003-39)', () => {
+  it('C-0003-39 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/evidence/upload-intents então 200', async () => {
+    const response = await request(server())
+      .post('/v1/ops/evidence/upload-intents')
+      .set(headers('field-agent'))
+      .send({
+        traffic_agency_id: '00000000-0000-7000-8000-0000e2000001',
+        local_evidence_id: '00000000-0000-7000-8000-0000ef900010',
+        idempotency_key: `e2e-upload-${randomUUID().slice(0, 8)}`,
+        entity_type: 'ait',
+        entity_id: '00000000-0000-7000-8000-0000f0000001',
+        evidence_type: 'foto',
+        origin: 'campo',
+        mime_type: 'image/jpeg',
+        size_bytes: 204800,
+        hash_algorithm: 'sha256',
+        hash_value: `sha256:${randomUUID().replace(/-/g, '').padEnd(64, '0')}`,
+        filename: 'e2e-foto.jpg',
+      });
+    expect(response.status).toBe(200);
+  });
+
+  it('C-0003-39 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/evidence/upload-intents então 403', async () => {
+    const response = await request(server())
+      .post('/v1/ops/evidence/upload-intents')
+      .set(headers('field-supervisor'))
+      .send({});
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0003 §4.3 — validate: papel mínimo × papel fora da regra (C-0003-40)', () => {
+  it('C-0003-40 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST /v1/ops/evidence/{id}/validate então 200', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/evidence/${EVIDENCE_BODYCAM_VALIDATED}/validate`)
+      .set(headers('processing-operator'))
+      .send({ decision: 'valid' });
+    expect(response.status).toBe(200);
+  });
+
+  it('C-0003-40 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/evidence/{id}/validate então 403', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/evidence/${EVIDENCE_BODYCAM_VALIDATED}/validate`)
+      .set(headers('field-agent'))
+      .send({ decision: 'valid' });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0003 §4.7 — purge-expired-unverified: papel mínimo × papel fora da regra (C-0003-41)', () => {
+  it('C-0003-41 — dado DETRAN_LOCAL_ROLES=technical-admin quando POST /v1/ops/evidence/maintenance/purge-expired-unverified então 200', async () => {
+    const response = await request(server())
+      .post('/v1/ops/evidence/maintenance/purge-expired-unverified')
+      .set(headers('technical-admin'))
+      .send({});
+    expect(response.status).toBe(200);
+  });
+
+  it('C-0003-41 — dado DETRAN_LOCAL_ROLES=AUDITOR quando POST /v1/ops/evidence/maintenance/purge-expired-unverified então 403', async () => {
+    const response = await request(server())
+      .post('/v1/ops/evidence/maintenance/purge-expired-unverified')
+      .set(headers('AUDITOR'))
+      .send({});
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0003 §4.10 — evidence-access-requests/{id}/approve: papel mínimo × papel fora da regra (C-0003-42)', () => {
+  it('C-0003-42 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST /v1/ops/evidence-access-requests/{id}/approve sobre o pedido …ef400002 (já approved) então 409 TEAT.EVIDENCE_ACCESS_STATE_INVALID (papel mínimo alcança o comando; a guarda de estado é quem barra)', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/evidence-access-requests/${ACCESS_REQUEST_APPROVED}/approve`,
+      )
+      .set(headers('traffic-authority'))
+      .send({ legal_basis: 'Art. 13 da Portaria 003/2026' });
+    expect(response.status).toBe(409);
+    expect(response.body.code).toBe('TEAT.EVIDENCE_ACCESS_STATE_INVALID');
+  });
+
+  it('C-0003-42 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST /v1/ops/evidence-access-requests/{id}/approve então 403', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/evidence-access-requests/${ACCESS_REQUEST_APPROVED}/approve`,
+      )
+      .set(headers('processing-operator'))
+      .send({ legal_basis: 'Art. 13 da Portaria 003/2026' });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0003 §6.5/§6.6 — mobile-packages sync-metadata e content (C-0003-43)', () => {
+  it('C-0003-43a — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/inf/normative/mobile-packages/sync-metadata então 200', async () => {
+    const response = await request(server())
+      .get('/v1/inf/normative/mobile-packages/sync-metadata')
+      .set(headers('field-agent'));
+    expect(response.status).toBe(200);
+  });
+
+  /**
+   * OD-T52 (adenda CTG-0003 §13, 2026-09-16): a guarda de integridade do
+   * `content` corre **sempre** — não há exceção por proveniência. A fixture
+   * `…e7000001` tem `manifest_hash` placeholder e nunca bate com a
+   * recomposição, então este caso gera o pacote pelo próprio backend
+   * (`generate` → `publish` → `content`) em vez de usar a fixture, que
+   * continua servindo só `sync-metadata`.
+   */
+  it('C-0003-43b — dado um pacote gerado e publicado pelo backend quando GET /v1/inf/normative/mobile-packages/{id}/content então 200 com manifest_hash igual ao gerado e signature.kind=local-unsigned', async () => {
+    const generateResponse = await request(server())
+      .post('/v1/inf/normative/mobile-packages/generate')
+      .set(headers('agency-admin'))
+      .send({
+        catalog_id: CATALOG_ACTIVE,
+        package_version: `e2e-content-${randomUUID().slice(0, 8)}`,
+      });
+    expect(generateResponse.status).toBe(201);
+    const packageId = generateResponse.body.id as string;
+    const generatedHash = generateResponse.body.manifest_hash as string;
+    createdPackageIds.push(packageId);
+
+    const publishResponse = await request(server())
+      .post(`/v1/inf/normative/mobile-packages/${packageId}/publish`)
+      .set(headers('agency-admin'))
+      .send({});
+    expect(publishResponse.status).toBe(200);
+
+    const contentResponse = await request(server())
+      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
+      .set(headers('field-agent'));
+    expect(contentResponse.status).toBe(200);
+    expect(contentResponse.body).toMatchObject({
+      manifest_hash: generatedHash,
+      signature: expect.objectContaining({ kind: 'local-unsigned' }),
+    });
+  });
+
+  it('C-0003-43c — dado o catálogo alterado (novo enquadramento ativo) depois da geração então GET .../content então 422 TEAT.PACKAGE_MANIFEST_MISMATCH', async () => {
+    const generateResponse = await request(server())
+      .post('/v1/inf/normative/mobile-packages/generate')
+      .set(headers('agency-admin'))
+      .send({
+        catalog_id: CATALOG_ACTIVE,
+        package_version: `e2e-mismatch-${randomUUID().slice(0, 8)}`,
+      });
+    expect(generateResponse.status).toBe(201);
+    const packageId = generateResponse.body.id as string;
+    createdPackageIds.push(packageId);
+
+    const publishResponse = await request(server())
+      .post(`/v1/inf/normative/mobile-packages/${packageId}/publish`)
+      .set(headers('agency-admin'))
+      .send({});
+    expect(publishResponse.status).toBe(200);
+
+    // Altera o catálogo sob o pacote já gerado: um novo enquadramento ativo
+    // muda o manifesto recomposto sem tocar em manifest_hash gravado.
+    const extraFramingId = randomUUID();
+    createdFramingIds.push(extraFramingId);
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    await client.query(`select set_config('app.tenant_id', $1, false)`, [
+      TENANT_ID,
+    ]);
+    await client.query(
+      `insert into inf.normative_framing
+         (id, tenant_id, catalog_id, framing_code, description, approach_class, status)
+       values ($1, $2, $3, $4, 'Enquadramento extra do e2e (C-0003-43c)', 'caso_1', 'active')`,
+      [
+        extraFramingId,
+        TENANT_ID,
+        CATALOG_ACTIVE,
+        `E2E-${extraFramingId.slice(0, 8)}`,
+      ],
+    );
+
+    const contentResponse = await request(server())
+      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
+      .set(headers('field-agent'));
+    expect(contentResponse.status).toBe(422);
+    expect(contentResponse.body.code).toBe('TEAT.PACKAGE_MANIFEST_MISMATCH');
+  });
+});
+
+describe('CTG-0003 §6.2 — mobile-packages/generate: papel mínimo × papel fora da regra (C-0003-44)', () => {
+  it('C-0003-44 — dado DETRAN_LOCAL_ROLES=agency-admin quando POST /v1/inf/normative/mobile-packages/generate então 201', async () => {
+    const response = await request(server())
+      .post('/v1/inf/normative/mobile-packages/generate')
+      .set(headers('agency-admin'))
+      .send({
+        catalog_id: CATALOG_ACTIVE,
+        package_version: `e2e-${randomUUID().slice(0, 8)}`,
+      });
+    expect(response.status).toBe(201);
+    createdPackageIds.push(response.body.id as string);
+  });
+
+  it('C-0003-44 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/inf/normative/mobile-packages/generate então 403', async () => {
+    const response = await request(server())
+      .post('/v1/inf/normative/mobile-packages/generate')
+      .set(headers('field-agent'))
+      .send({ catalog_id: CATALOG_ACTIVE, package_version: 'e2e-denied' });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0003 §1 — fronteira de rota v1/ops/* (C-0003-45)', () => {
+  /**
+   * Mesmo padrão de `teat-field-sync.e2e.spec.ts` C-0002-50: a forma da
+   * propriedade mudou entre versões do Express (`router` na 5, `_router` na
+   * 4), então as duas são aceitas.
+   */
+  function mountedPaths(): string[] {
+    const instance = app.getHttpAdapter().getInstance() as {
+      router?: { stack?: { route?: { path?: string } }[] };
+      _router?: { stack?: { route?: { path?: string } }[] };
+    };
+    const stack = instance.router?.stack ?? instance._router?.stack ?? [];
+    return stack
+      .map((layer) => layer.route?.path)
+      .filter((path): path is string => typeof path === 'string');
+  }
+
+  it('C-0003-45 — dado o app montado quando as rotas manuscritas de ops/evidence e ops/snapshots são enumeradas então todas começam por v1/ops/ (nenhuma rota /ops/evidence* ou /ops/snapshots* sem o prefixo)', () => {
+    const offending = mountedPaths().filter(
+      (path) =>
+        (path.startsWith('/ops/evidence') ||
+          path.startsWith('/ops/snapshots') ||
+          path === '/ops/evidence' ||
+          path === '/ops/snapshots') &&
+        !path.startsWith('/v1/'),
+    );
+    expect(
+      offending,
+      `rotas manuscritas de evidence/snapshots fora de /v1/ops/ (§1): ${offending.join(', ')}`,
+    ).toEqual([]);
+  });
+
+  it('C-0003-45 — dado as rotas de evidence e snapshots já montadas então todas começam efetivamente por /v1/ops/', () => {
+    const evidenceOrSnapshots = mountedPaths().filter(
+      (path) => path.includes('ops/evidence') || path.includes('ops/snapshots'),
+    );
+    for (const path of evidenceOrSnapshots) {
+      expect(path.startsWith('/v1/ops/')).toBe(true);
+    }
+  });
+});
diff --git a/backend/database/seed/27-fixtures-teat-evidence.sql b/backend/database/seed/27-fixtures-teat-evidence.sql
new file mode 100644
index 0000000..1d46bea
--- /dev/null
+++ b/backend/database/seed/27-fixtures-teat-evidence.sql
@@ -0,0 +1,125 @@
+-- TASK-0006 (R-0008, CTG-0003 §9 / M20): fixtures de evidência, custódia,
+-- bodycam, snapshots congelados e catálogo/pacote normativo do grupo
+-- evidência/normativo. Determinísticas e idempotentes (`on conflict (id) do
+-- update`), no tenant canônico 00000000-0000-7000-8000-00000000a001 e no
+-- órgão 00000000-0000-7000-8000-0000e2000001. "Hoje" das fixtures =
+-- 2026-09-14 (00-fixtures-core.sql), fuso -04:00 (America/Manaus).
+--
+-- Reutilizadas sem cópia (CTG-0003 §9, nota final): inf.normative_catalog
+-- …e0000001 (corrigido abaixo para status='active' — OD-T35), normative_framing
+-- …e1000001/…e1000002, normative_mobile_package …e7000001 (published),
+-- ait_ait …f0000001 (INTEGRADO, alvo do evidence_link), ops_operational_device
+-- …e4000002.
+select set_config('app.role', 'owner', false);
+select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);
+
+-- OD-T35 (CTG-0003 §13 item 12): a fixture de 10-fixtures-inf-ait.sql grava
+-- inf.normative_catalog.status = 'published', fora do conjunto draft|active|
+-- retired de [WF-TEAT-003]. Sem essa correção, `mobile-packages/generate`
+-- sobre o catálogo …e0000001 devolveria sempre 422
+-- TEAT.PACKAGE_CATALOG_NOT_ACTIVE. Corrigido aqui, idempotente.
+update inf.normative_catalog
+   set status = 'active'
+ where id = '00000000-0000-7000-8000-0000e0000001'
+   and tenant_id = '00000000-0000-7000-8000-00000000a001';
+
+-- ops.evidence_evidence: quatro estados de custódia.
+-- …ef000001 bodycam validada (conteúdo restrito por RN-TEAT-142: storage_uri e
+-- location_json só saem para quem tem uma evidence_access_request 'delivered').
+-- …ef000002 foto aguardando upload, intenção …ef100001 já vencida.
+-- …ef000003 foto carregada (uploaded), intenção …ef100002 vigente.
+-- …ef000004 em quarentena (sem rota nesta rodada; só pré-condição de bloqueio).
+insert into ops.evidence_evidence (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri, mime_type, size_bytes, hash_algorithm, hash_value, captured_by_user_ref, agent_id, device_id, captured_at, location_json, status, metadata_json)
+values
+ ('00000000-0000-7000-8000-0000ef000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','bodycam','campo','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000001','video/mp4',5242880,'sha256','sha256:fb517525e4db0c44027f342617250edf975383e949b8d1fab2670b3120c8b038','00000000-0000-4000-8000-0000b0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','2026-09-10T10:00:00-04:00','{"latitude":-3.1019,"longitude":-60.0250,"accuracy_m":6}'::jsonb,'validated','{"fixture":"C-0003-14"}'::jsonb),
+ ('00000000-0000-7000-8000-0000ef000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','foto','campo','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000002','image/jpeg',204800,'sha256','sha256:531986dca23b52cea07f5b3a736b452efea3ff325033daa19fb218741cb4875d','00000000-0000-4000-8000-0000b0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','2026-09-13T09:00:00-04:00',null,'pending_upload',null),
+ ('00000000-0000-7000-8000-0000ef000003','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','foto','campo','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000003','image/jpeg',307200,'sha256','sha256:dc52f4c835d7687f4abd3556182e0383bc09264328a03f20eec1b8368a26488e','00000000-0000-4000-8000-0000b0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00',null,'uploaded',null),
+ ('00000000-0000-7000-8000-0000ef000004','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','foto','campo','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000004','image/jpeg',102400,'sha256','sha256:a8949cf99ae3fc2328f8acf858aefca10282ab574addc442698fed3e9929cc98','00000000-0000-4000-8000-0000b0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','2026-09-12T09:00:00-04:00',null,'quarantined',null)
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, evidence_type=excluded.evidence_type, origin=excluded.origin, storage_uri=excluded.storage_uri, mime_type=excluded.mime_type, size_bytes=excluded.size_bytes, hash_algorithm=excluded.hash_algorithm, hash_value=excluded.hash_value, captured_by_user_ref=excluded.captured_by_user_ref, agent_id=excluded.agent_id, device_id=excluded.device_id, captured_at=excluded.captured_at, location_json=excluded.location_json, status=excluded.status, metadata_json=excluded.metadata_json;
+
+-- ops.storage_intent: …ef100001 vencida (evidência …ef000002, foto ainda sem
+-- upload); …ef100002 vigente (evidência …ef000003, já concluída — mantida
+-- 'pending' de propósito: o comando complete-upload é quem a leva a
+-- 'completed', e este fixture não presume o efeito do comando).
+insert into ops.storage_intent (id, tenant_id, evidence_id, idempotency_key, local_evidence_id, object_key, expires_at, status)
+values
+ ('00000000-0000-7000-8000-0000ef100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000002','intent-002','00000000-0000-7000-8000-0000ef100011','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000002','2026-09-01T00:00:00-04:00','pending'),
+ ('00000000-0000-7000-8000-0000ef100002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000003','intent-003','00000000-0000-7000-8000-0000ef100012','evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000003','2026-12-31T23:59:59-04:00','pending')
+on conflict (id) do update set tenant_id=excluded.tenant_id, evidence_id=excluded.evidence_id, idempotency_key=excluded.idempotency_key, local_evidence_id=excluded.local_evidence_id, object_key=excluded.object_key, expires_at=excluded.expires_at, status=excluded.status;
+
+-- ops.evidence_link: bodycam …ef000001 ligada ao AIT INTEGRADO …f0000001
+-- (10-fixtures-inf-ait.sql), role='bodycam', mandatory=true.
+insert into ops.evidence_link (id, tenant_id, evidence_id, entity_type, entity_id, role, mandatory)
+values ('00000000-0000-7000-8000-0000ef200001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000001','ait','00000000-0000-7000-8000-0000f0000001','bodycam',true)
+on conflict (id) do update set tenant_id=excluded.tenant_id, evidence_id=excluded.evidence_id, entity_type=excluded.entity_type, entity_id=excluded.entity_id, role=excluded.role, mandatory=excluded.mandatory;
+
+-- ops.evidence_custody_event: cadeia inicial da bodycam …ef000001.
+insert into ops.evidence_custody_event (id, tenant_id, evidence_id, event_type, event_at, user_ref, system_name, details_json)
+values ('00000000-0000-7000-8000-0000ef300001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000001','uploaded','2026-09-10T10:05:00-04:00','00000000-0000-4000-8000-0000b0000001','detran-backend','{"fixture":"27"}'::jsonb)
+on conflict (id) do update set tenant_id=excluded.tenant_id, evidence_id=excluded.evidence_id, event_type=excluded.event_type, event_at=excluded.event_at, user_ref=excluded.user_ref, system_name=excluded.system_name, details_json=excluded.details_json;
+
+-- ops.evidence_access_request: …ef400001 pendente (requested, magistrado);
+-- …ef400002 aprovada (approved, ministerio-publico), pronta para `deliver`
+-- (C-0003-13). decided_by_user_ref = …b0000006 (Fábio Nogueira,
+-- 00-fixtures-core.sql), persona de traffic-authority.
+insert into ops.evidence_access_request (id, tenant_id, evidence_id, requester_name, requester_role, investigation_ref, purpose, legal_basis, status, decided_by_user_ref)
+values
+ ('00000000-0000-7000-8000-0000ef400001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000001','Dra. Marina Castelo Branco','magistrado','PROC-2026-000123','Instrução de processo administrativo de trânsito',null,'requested',null),
+ ('00000000-0000-7000-8000-0000ef400002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef000001','Dr. Heitor Souza Lima','ministerio-publico','INQ-2026-000045','Apuração de infração penal de trânsito','Art. 13 da Portaria Normativa 003/2026-DP/DETRAN/AM','approved','00000000-0000-4000-8000-0000b0000006')
+on conflict (id) do update set tenant_id=excluded.tenant_id, evidence_id=excluded.evidence_id, requester_name=excluded.requester_name, requester_role=excluded.requester_role, investigation_ref=excluded.investigation_ref, purpose=excluded.purpose, legal_basis=excluded.legal_basis, status=excluded.status, decided_by_user_ref=excluded.decided_by_user_ref;
+
+-- ops.snapshots_person: condutor congelado via RENACH.
+insert into ops.snapshots_person (id, tenant_id, person_type, name, cpf, source)
+values ('00000000-0000-7000-8000-0000ef500001','00000000-0000-7000-8000-00000000a001','natural','Condutor Fixture Renach','11122233344','renach')
+on conflict (id) do update set tenant_id=excluded.tenant_id, person_type=excluded.person_type, name=excluded.name, cpf=excluded.cpf, source=excluded.source;
+
+-- ops.snapshots_vehicle: veículo congelado via WSDENATRAN.
+insert into ops.snapshots_vehicle (id, tenant_id, plate, renavam, make_model, source)
+values ('00000000-0000-7000-8000-0000ef600001','00000000-0000-7000-8000-00000000a001','BRA2E19','00123456789','Fixture Sedan 1.6','wsdenatran')
+on conflict (id) do update set tenant_id=excluded.tenant_id, plate=excluded.plate, renavam=excluded.renavam, make_model=excluded.make_model, source=excluded.source;
+
+-- ops.snapshots_vehicle_snapshot: sem divergência com o registro congelado acima.
+insert into ops.snapshots_vehicle_snapshot (id, tenant_id, vehicle_id, plate_snapshot, make_model_snapshot, data_source, divergence_recorded, payload_json)
+values ('00000000-0000-7000-8000-0000ef700001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef600001','BRA2E19','Fixture Sedan 1.6','wsdenatran',false,'{"plate":"BRA2E19","makeModelDescription":"Fixture Sedan 1.6"}'::jsonb)
+on conflict (id) do update set tenant_id=excluded.tenant_id, vehicle_id=excluded.vehicle_id, plate_snapshot=excluded.plate_snapshot, make_model_snapshot=excluded.make_model_snapshot, data_source=excluded.data_source, divergence_recorded=excluded.divergence_recorded, payload_json=excluded.payload_json;
+
+-- inf.normative_catalog: um segundo catálogo em draft (C-0003-20: generate
+-- sobre catálogo não ativo → 422 TEAT.PACKAGE_CATALOG_NOT_ACTIVE).
+insert into inf.normative_catalog (id, tenant_id, traffic_agency_id, name, catalog_type, version, valid_from, status, normative_source)
+values ('00000000-0000-7000-8000-0000e0000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Catálogo CONTRAN — revisão 2026.2 (fixtures, rascunho)','enquadramentos','2026.2','2026-09-01','draft','CTB; Res. CONTRAN 918/2022')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, name=excluded.name, catalog_type=excluded.catalog_type, version=excluded.version, valid_from=excluded.valid_from, status=excluded.status, normative_source=excluded.normative_source;
+
+-- inf.normative_metrological_table: tabela ativa do catálogo …e0000001.
+-- table_json marcado source_pending: o conteúdo do Anexo I da Res. 432 é
+-- CTG-0004 §3, fora desta tarefa (CTG-0003 §9); nenhum limiar é inventado
+-- aqui, apenas a existência da linha `active` que M13 exige no manifesto.
+insert into inf.normative_metrological_table (id, tenant_id, catalog_id, table_name, version, table_json, valid_from, status)
+values ('00000000-0000-7000-8000-0000eb000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e0000001','Etilômetro — tabela de erro máximo admissível','2026.1','{"source_pending":true,"unit":null,"thresholds":null,"tolerance":null}'::jsonb,'2026-01-01','active')
+on conflict (id) do update set tenant_id=excluded.tenant_id, catalog_id=excluded.catalog_id, table_name=excluded.table_name, version=excluded.version, table_json=excluded.table_json, valid_from=excluded.valid_from, status=excluded.status;
+
+-- inf.normative_validation_rule: regra ativa do catálogo …e0000001, entra no
+-- manifesto (§3).
+insert into inf.normative_validation_rule (id, tenant_id, catalog_id, rule_code, description, rule_type, severity, status)
+values ('00000000-0000-7000-8000-0000e1100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e0000001','VR-PLACA-OBRIGATORIA','Placa do veículo é obrigatória para o enquadramento com abordagem','required-field','bloqueante','active')
+on conflict (id) do update set tenant_id=excluded.tenant_id, catalog_id=excluded.catalog_id, description=excluded.description, rule_type=excluded.rule_type, severity=excluded.severity, status=excluded.status;
+
+-- inf.normative_document_template: modelo ativo do órgão …e2000001, entra no
+-- manifesto (§3).
+insert into inf.normative_document_template (id, tenant_id, traffic_agency_id, document_kind, name, version, template_body, valid_from, status)
+values ('00000000-0000-7000-8000-0000e1200001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','ait','Modelo de talão eletrônico (fixtures)','2026.1','Auto de Infração de Trânsito nº {{ait_number}}','2026-01-01','active')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, document_kind=excluded.document_kind, name=excluded.name, version=excluded.version, template_body=excluded.template_body, valid_from=excluded.valid_from, status=excluded.status;
+
+-- inf.normative_agency_parameter: parâmetro ativo do órgão …e2000001, entra
+-- no manifesto (§3).
+insert into inf.normative_agency_parameter (id, tenant_id, traffic_agency_id, key, value_json, value_type, valid_from, status)
+values ('00000000-0000-7000-8000-0000e1300001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','teat.talao.serie_padrao','"F"'::jsonb,'string','2026-01-01','active')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, value_json=excluded.value_json, value_type=excluded.value_type, valid_from=excluded.valid_from, status=excluded.status;
+
+-- inf.normative_mobile_package: pacote `draft` do catálogo …e0000001, versão
+-- distinta de …e7000001 (published). manifest_hash/package_uri são valores de
+-- fixture (a coluna é not null); o Engineer recalcula no comando `generate`
+-- real — este é só o pré-estado para `publish`/`retire`/`validate` sobre um
+-- draft (C-0003-23/24/26).
+insert into inf.normative_mobile_package (id, tenant_id, traffic_agency_id, catalog_id, package_version, manifest_hash, package_uri, status)
+values ('00000000-0000-7000-8000-0000e7000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000e0000001','2026.2-draft','sha256:0000000000000000000000000000000000000000000000000000000000000000','/v1/inf/normative/mobile-packages/00000000-0000-7000-8000-0000e7000002/content','draft')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, catalog_id=excluded.catalog_id, package_version=excluded.package_version, manifest_hash=excluded.manifest_hash, package_uri=excluded.package_uri, status=excluded.status;
diff --git a/backend/domains/inf/normative/src/handwritten/events.ts b/backend/domains/inf/normative/src/handwritten/events.ts
new file mode 100644
index 0000000..68ec95e
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/events.ts
@@ -0,0 +1,153 @@
+// CTG-0003 §8 (M16, R-0008, TASK-0007) — envelopes do catálogo e do pacote
+// normativo, e os esquemas zod que os descrevem. `retire` (de catálogo e de
+// pacote) não tem token no route contract §8 e por isso não publica (§11.7 /
+// OD-T21).
+//
+// Molde: `backend/domains/inf/ait/src/handwritten/events.ts` —
+// `additionalProperties: false` ⇒ `strictObject`. Aqui `type` e `domainEvent`
+// são chaves únicas, então o mapa segue o molde e é chaveado por
+// `domainEvent`.
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+
+import type {
+  NormativeEventEnvelope,
+  NormativeRow,
+} from './normative-runtime.js';
+
+export interface NormativeScope {
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+}
+
+const actor = z.strictObject({
+  kind: z.enum(['user', 'system', 'timer']),
+  id: z.string(),
+  role: z.string().optional(),
+});
+
+function envelopeSchema<Data extends ZodType>(
+  type: string,
+  domainEvent: string,
+  aggregateKind: string,
+  data: Data,
+) {
+  return z.strictObject({
+    id: z.string(),
+    type: z.literal(type),
+    domainEvent: z.literal(domainEvent),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.string(),
+    actor,
+    correlationId: z.string(),
+    causationId: z.string().optional(),
+    aggregate: z.strictObject({
+      kind: z.literal(aggregateKind),
+      id: z.string(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+const catalogoPublicado = envelopeSchema(
+  'catalog.published',
+  'CATALOGO_PUBLICADO',
+  'normative-catalog',
+  z.strictObject({
+    catalogId: z.string(),
+    name: z.string(),
+    version: z.string(),
+    // `normative_catalog.published_at` e `valid_from` são colunas `date`.
+    publishedAt: z.string(),
+    validFrom: z.string().nullable(),
+  }),
+);
+
+const pacoteMobilePublicado = envelopeSchema(
+  'package.published',
+  'PACOTE_MOBILE_PUBLICADO',
+  'normative-package',
+  z.strictObject({
+    packageId: z.string(),
+    catalogId: z.string(),
+    packageVersion: z.string(),
+    manifestHash: z.string(),
+    publishedAt: z.iso.datetime(),
+    // `normative_mobile_package.valid_until` é coluna `date`.
+    validUntil: z.string().nullable(),
+  }),
+);
+
+/** Os dois `domainEvent` do grupo (CTG-0003 §8). */
+export interface NormativeEventSchemas extends Record<string, ZodType> {
+  CATALOGO_PUBLICADO: ZodType;
+  PACOTE_MOBILE_PUBLICADO: ZodType;
+}
+
+export const NORMATIVE_EVENT_SCHEMAS: NormativeEventSchemas = {
+  CATALOGO_PUBLICADO: catalogoPublicado,
+  PACOTE_MOBILE_PUBLICADO: pacoteMobilePublicado,
+};
+
+export type CatalogPublishedData = z.infer<typeof catalogoPublicado>['data'];
+export type PackagePublishedData = z.infer<
+  typeof pacoteMobilePublicado
+>['data'];
+
+function envelope(
+  scope: NormativeScope,
+  input: {
+    type: string;
+    domainEvent: string;
+    aggregate: { kind: string; id: string; version: number };
+    data: Record<string, unknown>;
+  },
+): NormativeEventEnvelope {
+  return {
+    id: '',
+    type: input.type,
+    domainEvent: input.domainEvent,
+    version: 1,
+    occurredAt: scope.occurredAt,
+    tenantId: scope.tenantId,
+    actor: { kind: 'user', id: scope.actorId },
+    correlationId: input.aggregate.id,
+    aggregate: input.aggregate,
+    data: input.data,
+  };
+}
+
+export function catalogPublishedEvent(
+  scope: NormativeScope,
+  data: CatalogPublishedData,
+): NormativeEventEnvelope {
+  return envelope(scope, {
+    type: 'catalog.published',
+    domainEvent: 'CATALOGO_PUBLICADO',
+    aggregate: { kind: 'normative-catalog', id: data.catalogId, version: 1 },
+    data: { ...data },
+  });
+}
+
+export function packagePublishedEvent(
+  scope: NormativeScope,
+  data: PackagePublishedData,
+  version = 1,
+): NormativeEventEnvelope {
+  return envelope(scope, {
+    type: 'package.published',
+    domainEvent: 'PACOTE_MOBILE_PUBLICADO',
+    aggregate: { kind: 'normative-package', id: data.packageId, version },
+    data: { ...data },
+  });
+}
+
+export function rowValue(row: NormativeRow, column: string): string | null {
+  const value = row[column];
+  if (value === null || value === undefined) return null;
+  if (value instanceof Date) return value.toISOString();
+  return String(value);
+}
diff --git a/backend/domains/inf/normative/src/handwritten/generate-package.command.spec.ts b/backend/domains/inf/normative/src/handwritten/generate-package.command.spec.ts
new file mode 100644
index 0000000..d470f77
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/generate-package.command.spec.ts
@@ -0,0 +1,246 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §3/§6.2 e §10 (R-0008, TASK-0006) — C-0003-20…22: `POST
+ * /v1/inf/normative/mobile-packages/generate` (M13).
+ * `handwritten/generate-package.command.ts` nasce em TASK-0007 (CTG-0003
+ * §11). Nome esperado do export: `GeneratePackageCommand`, construtor
+ * `(deps)`, método `execute`.
+ *
+ * Fixtures: `normative_catalog` `…e0000001` (`active`, corrigido por
+ * `27-fixtures-teat-evidence.sql` — OD-T35) e `…e0000002` (`draft`);
+ * `normative_framing`/`normative_metrological_table`/`normative_validation_rule`/
+ * `normative_document_template`/`normative_agency_parameter` `active` do
+ * catálogo `…e0000001`.
+ *
+ * Canônico (CTG-0003 §3): manifesto = JSON canônico (chaves ordenadas) das
+ * seis coleções, só linhas `status='active'`; `manifest_hash='sha256:'+sha256hex`.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
+const CATALOG_DRAFT = '00000000-0000-7000-8000-0000e0000002';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    list: vi.fn(async () => [...store]),
+    listWhere: vi.fn(
+      async (predicate: (row: Record<string, unknown>) => boolean) =>
+        store.filter(predicate),
+    ),
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  clock: { now(): string };
+}
+
+function activeCatalogRows() {
+  return {
+    catalogs: repository([
+      {
+        id: CATALOG_ACTIVE,
+        tenant_id: TENANT_ID,
+        status: 'active',
+        name: 'Catálogo CONTRAN',
+        version: '2026.1',
+      },
+      {
+        id: CATALOG_DRAFT,
+        tenant_id: TENANT_ID,
+        status: 'draft',
+        name: 'Catálogo CONTRAN — revisão 2026.2',
+        version: '2026.2',
+      },
+    ]),
+    framings: repository([
+      {
+        id: '00000000-0000-7000-8000-0000e1000001',
+        catalog_id: CATALOG_ACTIVE,
+        status: 'active',
+        framing_code: '7455-0',
+      },
+      {
+        id: '00000000-0000-7000-8000-0000e1000002',
+        catalog_id: CATALOG_ACTIVE,
+        status: 'active',
+        framing_code: '5541-0',
+      },
+    ]),
+    metrologicalTables: repository([
+      {
+        id: '00000000-0000-7000-8000-0000eb000001',
+        catalog_id: CATALOG_ACTIVE,
+        status: 'active',
+      },
+    ]),
+    validationRules: repository([
+      {
+        id: '00000000-0000-7000-8000-0000e1100001',
+        catalog_id: CATALOG_ACTIVE,
+        status: 'active',
+      },
+    ]),
+    documentTemplates: repository([
+      {
+        id: '00000000-0000-7000-8000-0000e1200001',
+        traffic_agency_id: AGENCY_ID,
+        status: 'active',
+      },
+    ]),
+    agencyParameters: repository([
+      {
+        id: '00000000-0000-7000-8000-0000e1300001',
+        traffic_agency_id: AGENCY_ID,
+        status: 'active',
+      },
+    ]),
+    packages: repository(),
+  };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({
+        tenantId: TENANT_ID,
+        actorId: '00000000-0000-4000-8000-0000b0000001',
+      }),
+    },
+    repositories: overrides.repositories ?? activeCatalogRows(),
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+function input(
+  overrides: Record<string, unknown> = {},
+): Record<string, unknown> {
+  return {
+    catalog_id: CATALOG_ACTIVE,
+    package_version: `2026.1-${Math.random().toString(36).slice(2, 8)}`,
+    ...overrides,
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function generatePackage(
+  dependencies: Deps,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./generate-package.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/normative/src/handwritten/generate-package.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.GeneratePackageCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'generate-package.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'generate-package.command.ts não expõe execute|handle|run (CTG-0003 §6.2)',
+    );
+  }
+  return (await (method as (value: unknown) => Promise<unknown>).call(
+    command,
+    body,
+  )) as Record<string, unknown>;
+}
+
+describe('CTG-0003 §6.2 — mobile-packages/generate: catálogo ativo e manifesto (C-0003-20…22)', () => {
+  it('C-0003-20 — dado o catálogo …e0000002 (draft) quando generate então 422 TEAT.PACKAGE_CATALOG_NOT_ACTIVE com { catalogId, currentState }', async () => {
+    const dependencies = deps();
+    await expect(
+      generatePackage(dependencies, input({ catalog_id: CATALOG_DRAFT })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.PACKAGE_CATALOG_NOT_ACTIVE',
+      status: 422,
+      context: expect.objectContaining({
+        catalogId: CATALOG_DRAFT,
+        currentState: 'draft',
+      }),
+    });
+  });
+
+  it('C-0003-21 — dado o catálogo ativo quando generate (duas vezes) então o manifest_hash é determinístico', async () => {
+    const dependencies = deps();
+    const first = await generatePackage(
+      dependencies,
+      input({ package_version: '2026.1-a' }),
+    );
+    const second = await generatePackage(
+      dependencies,
+      input({ package_version: '2026.1-b' }),
+    );
+    expect(first.manifest_hash).toEqual(expect.stringMatching(/^sha256:/));
+    expect(second.manifest_hash).toBe(first.manifest_hash);
+  });
+
+  it('C-0003-22 — dado generate então o manifesto contém apenas linhas status=active das seis coleções: uma linha retired a mais não muda o manifest_hash', async () => {
+    const baseline = deps();
+    const baselineResponse = await generatePackage(
+      baseline,
+      input({ package_version: '2026.1-baseline' }),
+    );
+
+    const repositoriesWithRetired = activeCatalogRows();
+    repositoriesWithRetired.framings.rows.push({
+      id: 'framing-inactive',
+      catalog_id: CATALOG_ACTIVE,
+      status: 'retired',
+      framing_code: '0000-0',
+    });
+    const withRetired = deps({ repositories: repositoriesWithRetired });
+    const withRetiredResponse = await generatePackage(
+      withRetired,
+      input({ package_version: '2026.1-with-retired' }),
+    );
+
+    expect(withRetiredResponse.manifest_hash).toBe(
+      baselineResponse.manifest_hash,
+    );
+    expect(baselineResponse.status).toBe('draft');
+  });
+});
diff --git a/backend/domains/inf/normative/src/handwritten/generate-package.command.ts b/backend/domains/inf/normative/src/handwritten/generate-package.command.ts
new file mode 100644
index 0000000..7452c0d
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/generate-package.command.ts
@@ -0,0 +1,139 @@
+// CTG-0003 §3 e §6.2 (M13, R-0008, TASK-0007) — `POST
+// /v1/inf/normative/mobile-packages/generate`.
+//
+// Gerar rascunho não publica: §8 só nomeia `PACOTE_MOBILE_PUBLICADO`, então
+// nenhum envelope sai daqui.
+import { randomUUID } from 'node:crypto';
+
+import { DetranError } from '@detran/shared';
+
+import { buildManifest, manifestHashOf } from './manifest.js';
+import {
+  catalogNotActive,
+  inTenantTransaction,
+  insertRow,
+  readRow,
+  readRows,
+  stringOf,
+  tenantMismatch,
+  validationFailed,
+  type NormativeDeps,
+  type NormativeRow,
+} from './normative-runtime.js';
+
+export interface GeneratePackageInput {
+  catalog_id: string;
+  package_version: string;
+  valid_until?: string;
+  traffic_agency_id?: string;
+}
+
+export interface GeneratePackageResult {
+  id: string;
+  status: 'draft';
+  package_version: string;
+  manifest_hash: string;
+  catalog_id: string;
+  valid_until: string | null;
+}
+
+export class GeneratePackageCommand {
+  constructor(private readonly deps: NormativeDeps) {}
+
+  async execute(input: GeneratePackageInput): Promise<GeneratePackageResult> {
+    const catalogId = stringOf(input?.catalog_id ?? '').trim();
+    const packageVersion = stringOf(input?.package_version ?? '').trim();
+    const fields = [
+      ...(catalogId ? [] : [{ path: 'catalog_id', rule: 'required' }]),
+      ...(packageVersion && packageVersion.length <= 80
+        ? []
+        : [{ path: 'package_version', rule: 'required' }]),
+    ];
+    if (fields.length > 0) throw validationFailed(fields);
+
+    const catalog = await readRow(this.deps, 'catalogs', catalogId);
+    if (!catalog) throw tenantMismatch({ catalogId });
+    const currentState = stringOf(catalog.status);
+    if (currentState !== 'active')
+      throw catalogNotActive(catalogId, currentState);
+
+    const agencyId = await this.resolveAgency(input, catalog);
+    const manifest = await buildManifest(this.deps, catalog, agencyId);
+    const manifestHash = manifestHashOf(manifest);
+    const validUntil = input?.valid_until
+      ? stringOf(input.valid_until).slice(0, 10)
+      : null;
+
+    const existing = (
+      await readRows(
+        this.deps,
+        'packages',
+        (row) => stringOf(row.package_version) === packageVersion,
+      )
+    )[0];
+    if (existing) {
+      if (stringOf(existing.manifest_hash) === manifestHash)
+        throw new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
+          status: 409,
+          context: { packageVersion },
+          message: 'Já existe pacote com esta versão e o mesmo manifesto.',
+        });
+      throw validationFailed([{ path: 'package_version', rule: 'unique' }]);
+    }
+
+    const id = randomUUID();
+    return inTenantTransaction(this.deps, async (tx) => {
+      await insertRow(this.deps, tx, 'packages', {
+        id,
+        traffic_agency_id: agencyId,
+        catalog_id: catalogId,
+        package_version: packageVersion,
+        manifest_hash: manifestHash,
+        // §11.11: a coluna é `not null` e o conteúdo mora nesta rota.
+        package_uri: `/v1/inf/normative/mobile-packages/${id}/content`,
+        published_at: null,
+        valid_until: validUntil,
+        status: 'draft',
+      });
+
+      return {
+        id,
+        status: 'draft' as const,
+        package_version: packageVersion,
+        manifest_hash: manifestHash,
+        catalog_id: catalogId,
+        valid_until: validUntil,
+      };
+    });
+  }
+
+  /**
+   * A DTO da §6.2 não carrega o órgão e `normative_mobile_package.
+   * traffic_agency_id` é `not null`: vem do corpo quando informado, do
+   * catálogo quando ele declara órgão e, na falta dos dois, do órgão único
+   * dos artefatos normativos vigentes do tenant. Sem nenhum dos três, o
+   * pedido é inválido — nunca um identificador inventado.
+   */
+  private async resolveAgency(
+    input: GeneratePackageInput,
+    catalog: NormativeRow,
+  ): Promise<string> {
+    const declared =
+      stringOf(input?.traffic_agency_id ?? '').trim() ||
+      stringOf(catalog.traffic_agency_id ?? '').trim();
+    if (declared) return declared;
+
+    const active = (row: NormativeRow): boolean => row.status === 'active';
+    const [templates, parameters] = await Promise.all([
+      readRows(this.deps, 'documentTemplates', active),
+      readRows(this.deps, 'agencyParameters', active),
+    ]);
+    const agencies = new Set(
+      [...templates, ...parameters]
+        .map((row) => stringOf(row.traffic_agency_id ?? ''))
+        .filter((value) => value.length > 0),
+    );
+    if (agencies.size === 1) return [...agencies][0]!;
+    throw validationFailed([{ path: 'traffic_agency_id', rule: 'required' }]);
+  }
+}
diff --git a/backend/domains/inf/normative/src/handwritten/manifest.ts b/backend/domains/inf/normative/src/handwritten/manifest.ts
new file mode 100644
index 0000000..9d1bad6
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/manifest.ts
@@ -0,0 +1,103 @@
+// CTG-0003 §3 (M13, R-0008, TASK-0007) — manifesto canônico do pacote mobile
+// e seu hash.
+//
+// JSON canônico: chaves ordenadas recursivamente, sem espaços (a mesma
+// `stableJson` de `ait-lifecycle.service.ts`). Cada coleção traz só as linhas
+// `status='active'`, ordenadas por `id asc`, sem `tenant_id`, `created_at`
+// nem `updated_at`.
+import {
+  readRows,
+  sha256Hex,
+  stringOf,
+  type NormativeDeps,
+  type NormativeRow,
+} from './normative-runtime.js';
+
+const STRIPPED_COLUMNS = ['tenant_id', 'created_at', 'updated_at'] as const;
+
+export interface NormativeManifest {
+  catalog: NormativeRow | null;
+  framings: NormativeRow[];
+  validation_rules: NormativeRow[];
+  metrological_tables: NormativeRow[];
+  document_templates: NormativeRow[];
+  agency_parameters: NormativeRow[];
+}
+
+export function stableJson(value: unknown): string {
+  return JSON.stringify(sortDeep(value));
+}
+
+function sortDeep(value: unknown): unknown {
+  if (Array.isArray(value)) return value.map((entry) => sortDeep(entry));
+  if (value && typeof value === 'object' && !(value instanceof Date)) {
+    const source = value as Record<string, unknown>;
+    return Object.fromEntries(
+      Object.keys(source)
+        .sort()
+        .map((key) => [key, sortDeep(source[key])]),
+    );
+  }
+  if (value instanceof Date) return value.toISOString();
+  return value;
+}
+
+export function manifestHashOf(manifest: NormativeManifest): string {
+  return `sha256:${sha256Hex(stableJson(manifest))}`;
+}
+
+function strip(row: NormativeRow): NormativeRow {
+  const copy: NormativeRow = { ...row };
+  for (const column of STRIPPED_COLUMNS) delete copy[column];
+  return copy;
+}
+
+function byId(left: NormativeRow, right: NormativeRow): number {
+  return stringOf(left.id) < stringOf(right.id) ? -1 : 1;
+}
+
+function activeOfCatalog(catalogId: string) {
+  return (row: NormativeRow): boolean =>
+    row.status === 'active' && stringOf(row.catalog_id) === catalogId;
+}
+
+function activeOfAgency(agencyId: string | null) {
+  return (row: NormativeRow): boolean =>
+    row.status === 'active' &&
+    (agencyId === null ? false : stringOf(row.traffic_agency_id) === agencyId);
+}
+
+/**
+ * §3 — recompõe o manifesto do catálogo `catalogId` no escopo do órgão
+ * `agencyId`. Sem órgão conhecido, `document_templates` e `agency_parameters`
+ * saem vazios: são coleções do órgão, não do catálogo.
+ */
+export async function buildManifest(
+  deps: NormativeDeps,
+  catalog: NormativeRow,
+  agencyId: string | null,
+): Promise<NormativeManifest> {
+  const catalogId = stringOf(catalog.id);
+  const [
+    framings,
+    validationRules,
+    metrologicalTables,
+    documentTemplates,
+    agencyParameters,
+  ] = await Promise.all([
+    readRows(deps, 'framings', activeOfCatalog(catalogId)),
+    readRows(deps, 'validationRules', activeOfCatalog(catalogId)),
+    readRows(deps, 'metrologicalTables', activeOfCatalog(catalogId)),
+    readRows(deps, 'documentTemplates', activeOfAgency(agencyId)),
+    readRows(deps, 'agencyParameters', activeOfAgency(agencyId)),
+  ]);
+
+  return {
+    catalog: strip(catalog),
+    framings: framings.map(strip).sort(byId),
+    validation_rules: validationRules.map(strip).sort(byId),
+    metrological_tables: metrologicalTables.map(strip).sort(byId),
+    document_templates: documentTemplates.map(strip).sort(byId),
+    agency_parameters: agencyParameters.map(strip).sort(byId),
+  };
+}
diff --git a/backend/domains/inf/normative/src/handwritten/normative-commands.provider.ts b/backend/domains/inf/normative/src/handwritten/normative-commands.provider.ts
new file mode 100644
index 0000000..7fa2fc8
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/normative-commands.provider.ts
@@ -0,0 +1,41 @@
+// CTG-0003 §6 e §11 (R-0008, TASK-0007) — composição de
+// `NormativeCommandsService` no módulo gerado.
+//
+// `repositories` fica vazio: em produção a leitura do manifesto e a escrita
+// acontecem por SQL parametrizado sob `withTenantContext` (role `app`, RLS na
+// volta). A porta de repositório existe para os dublês dos tiers `unit` e
+// `integration`.
+import { SqlTeatEventOutbox } from '@detran/shared';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+
+import { NormativeCommandsService } from './normative-commands.service.js';
+import { LocalPackageSigner, PACKAGE_SIGNER_PORT } from './package-signer.js';
+import type { NormativeOutbox, PackageSigner } from './normative-runtime.js';
+
+const systemClock = {
+  now: (): string => new Date().toISOString(),
+  today: (): string => new Date().toISOString().slice(0, 10),
+};
+
+export const NORMATIVE_COMMANDS_PROVIDER = {
+  provide: NormativeCommandsService,
+  inject: [
+    Database,
+    RequestContext,
+    { token: PACKAGE_SIGNER_PORT, optional: true },
+  ],
+  useFactory: (
+    database: Database,
+    requestContext: RequestContext,
+    packageSigner?: PackageSigner,
+  ): NormativeCommandsService =>
+    new NormativeCommandsService({
+      database,
+      requestContext,
+      repositories: {},
+      packageSigner: packageSigner ?? new LocalPackageSigner(),
+      outbox: new SqlTeatEventOutbox() as unknown as NormativeOutbox,
+      clock: systemClock,
+    }),
+};
diff --git a/backend/domains/inf/normative/src/handwritten/normative-commands.service.ts b/backend/domains/inf/normative/src/handwritten/normative-commands.service.ts
new file mode 100644
index 0000000..d902777
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/normative-commands.service.ts
@@ -0,0 +1,99 @@
+// CTG-0003 §6 (M13, R-0008, TASK-0007) — fachada dos comandos e consultas
+// manuscritos do catálogo e do pacote normativo usada por
+// `normative-commands.controller.ts`.
+import {
+  GeneratePackageCommand,
+  type GeneratePackageInput,
+  type GeneratePackageResult,
+} from './generate-package.command.js';
+import type { NormativeDeps } from './normative-runtime.js';
+import {
+  PackageContentQuery,
+  type PackageContentResult,
+} from './package-content.query.js';
+import {
+  PackageSyncMetadataQuery,
+  type SyncMetadataPackage,
+} from './package-sync-metadata.query.js';
+import {
+  PublishCatalogCommand,
+  type CatalogCommandResult,
+  type PublishCatalogInput,
+  type RetireCatalogInput,
+} from './publish-catalog.command.js';
+import {
+  PublishPackageCommand,
+  type PackageCommandResult,
+  type PublishPackageInput,
+  type RetirePackageInput,
+} from './publish-package.command.js';
+import {
+  ValidatePackageCommand,
+  type ValidatePackageInput,
+  type ValidatePackageResult,
+} from './validate-package.command.js';
+
+export class NormativeCommandsService {
+  private readonly catalogs: PublishCatalogCommand;
+  private readonly generatePackage: GeneratePackageCommand;
+  private readonly packages: PublishPackageCommand;
+  private readonly validation: ValidatePackageCommand;
+  private readonly content: PackageContentQuery;
+  private readonly syncMetadata: PackageSyncMetadataQuery;
+
+  constructor(deps: NormativeDeps) {
+    this.catalogs = new PublishCatalogCommand(deps);
+    this.generatePackage = new GeneratePackageCommand(deps);
+    this.packages = new PublishPackageCommand(deps);
+    this.validation = new ValidatePackageCommand(deps);
+    this.content = new PackageContentQuery(deps);
+    this.syncMetadata = new PackageSyncMetadataQuery(deps);
+  }
+
+  publishCatalog(
+    id: string,
+    input: PublishCatalogInput,
+  ): Promise<CatalogCommandResult> {
+    return this.catalogs.publish(id, input);
+  }
+
+  retireCatalog(
+    id: string,
+    input: RetireCatalogInput,
+  ): Promise<CatalogCommandResult> {
+    return this.catalogs.retire(id, input);
+  }
+
+  generate(input: GeneratePackageInput): Promise<GeneratePackageResult> {
+    return this.generatePackage.execute(input);
+  }
+
+  publishPackage(
+    id: string,
+    input: PublishPackageInput,
+  ): Promise<PackageCommandResult> {
+    return this.packages.publish(id, input);
+  }
+
+  retirePackage(
+    id: string,
+    input: RetirePackageInput,
+  ): Promise<PackageCommandResult> {
+    return this.packages.retire(id, input);
+  }
+
+  validatePackage(
+    id: string,
+    input: ValidatePackageInput,
+  ): Promise<ValidatePackageResult> {
+    return this.validation.execute(id, input);
+  }
+
+  packageContent(id: string): Promise<PackageContentResult> {
+    return this.content.execute(id);
+  }
+
+  packageSyncMetadata(): Promise<{ packages: SyncMetadataPackage[] }> {
+    return this.syncMetadata.execute();
+  }
+}
diff --git a/backend/domains/inf/normative/src/handwritten/normative-runtime.ts b/backend/domains/inf/normative/src/handwritten/normative-runtime.ts
new file mode 100644
index 0000000..ac17c57
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/normative-runtime.ts
@@ -0,0 +1,312 @@
+// CTG-0003 §6 (M13, R-0008, TASK-0007) — dependências e utilidades dos
+// comandos manuscritos do catálogo e do pacote normativo.
+//
+// As leituras que compõem o manifesto acontecem **antes** da transação de
+// escrita: a porta de repositório abre a própria transação quando existe (é o
+// que os harnesses fazem), e misturar as duas coisas partiria o ciclo de
+// escrita no meio.
+import { createHash } from 'node:crypto';
+
+import { DetranError, withTenantContext } from '@detran/shared';
+import type { RequestContext } from '@stynx-nyx/core';
+import type { Database, Transaction } from '@stynx-nyx/data';
+
+export type NormativeRow = Record<string, unknown>;
+
+export interface NormativeRowStore {
+  list?(): Promise<NormativeRow[]>;
+  listWhere?(
+    predicate: (row: NormativeRow) => boolean,
+  ): Promise<NormativeRow[]>;
+  find?(id: string): Promise<NormativeRow | undefined>;
+  findOne?(id: string): Promise<NormativeRow | undefined>;
+  create?(values: NormativeRow): Promise<NormativeRow>;
+  update?(
+    id: string,
+    patch: NormativeRow,
+    tx?: unknown,
+  ): Promise<NormativeRow | undefined>;
+}
+
+/** Porta de selo do pacote (CTG-0002 §4.8; semântica em CTG-0003 §3). */
+export interface PackageSignature {
+  signature: string;
+  signer: string;
+  kind: 'local-unsigned' | 'sealed';
+}
+
+export interface PackageSigner {
+  sign(manifestHash: string): Promise<PackageSignature>;
+}
+
+export interface NormativeEventEnvelope {
+  id: string;
+  type: string;
+  domainEvent: string;
+  version: number;
+  occurredAt: string;
+  tenantId: string;
+  actor: { kind: 'user' | 'system' | 'timer'; id: string };
+  correlationId: string;
+  aggregate: { kind: string; id: string; version: number };
+  data: Record<string, unknown>;
+}
+
+export interface NormativeOutbox {
+  append(
+    tx: Transaction,
+    envelope: NormativeEventEnvelope,
+  ): Promise<{ id: string }>;
+}
+
+export interface NormativeClock {
+  now(): string;
+  today?(): string;
+}
+
+export interface NormativeDeps {
+  database: Pick<Database, 'tx'>;
+  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
+  repositories: Record<string, NormativeRowStore | undefined>;
+  packageSigner?: PackageSigner;
+  outbox?: NormativeOutbox;
+  clock: NormativeClock;
+}
+
+export const NORMATIVE_TABLES = {
+  catalogs: 'inf.normative_catalog',
+  framings: 'inf.normative_framing',
+  metrologicalTables: 'inf.normative_metrological_table',
+  validationRules: 'inf.normative_validation_rule',
+  documentTemplates: 'inf.normative_document_template',
+  agencyParameters: 'inf.normative_agency_parameter',
+  packages: 'inf.normative_mobile_package',
+} as const;
+
+export type NormativeTableName = keyof typeof NORMATIVE_TABLES;
+
+interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+function sqlOf(tx: unknown): SqlQueryable | undefined {
+  const candidate = tx as Partial<SqlQueryable> | null | undefined;
+  return candidate && typeof candidate.query === 'function'
+    ? (candidate as SqlQueryable)
+    : undefined;
+}
+
+function storeOf(
+  deps: NormativeDeps,
+  table: NormativeTableName,
+): NormativeRowStore | undefined {
+  return deps.repositories[table];
+}
+
+function assertColumns(values: NormativeRow): string[] {
+  const columns = Object.keys(values);
+  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
+    throw new Error('Coluna inválida em escrita de inf');
+  return columns;
+}
+
+export function tenantScope(deps: NormativeDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Um comando normativo exige contexto de requisição');
+  const snapshot = deps.requestContext.snapshot();
+  const tenantId = snapshot.tenantId ?? '';
+  const actorId = snapshot.actorId ?? '';
+  if (!tenantId || !actorId)
+    throw new Error('Um comando normativo exige tenantId e actorId');
+  return { tenantId, actorId };
+}
+
+export function inTenantTransaction<T>(
+  deps: NormativeDeps,
+  work: (tx: Transaction) => Promise<T>,
+): Promise<T> {
+  return withTenantContext(deps.database, deps.requestContext, work);
+}
+
+/** Leitura fora da transação de escrita (ver o cabeçalho deste arquivo). */
+export function readRow(
+  deps: NormativeDeps,
+  table: NormativeTableName,
+  id: string,
+): Promise<NormativeRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.find === 'function') return store.find(id);
+  if (typeof store?.findOne === 'function') return store.findOne(id);
+  return inTenantTransaction(deps, async (tx) => {
+    const sql = sqlOf(tx);
+    if (!sql) return undefined;
+    const result = await sql.query(
+      `select * from ${NORMATIVE_TABLES[table]} where id = $1`,
+      [id],
+    );
+    return result.rows[0];
+  });
+}
+
+export function readRows(
+  deps: NormativeDeps,
+  table: NormativeTableName,
+  predicate: (row: NormativeRow) => boolean = () => true,
+): Promise<NormativeRow[]> {
+  const store = storeOf(deps, table);
+  if (typeof store?.listWhere === 'function') return store.listWhere(predicate);
+  if (typeof store?.list === 'function')
+    return store.list().then((rows) => rows.filter(predicate));
+  return inTenantTransaction(deps, async (tx) => {
+    const sql = sqlOf(tx);
+    if (!sql) return [];
+    const result = await sql.query(
+      `select * from ${NORMATIVE_TABLES[table]} order by id`,
+    );
+    return result.rows.filter(predicate);
+  });
+}
+
+export async function insertRow(
+  deps: NormativeDeps,
+  tx: unknown,
+  table: NormativeTableName,
+  values: NormativeRow,
+): Promise<NormativeRow> {
+  const store = storeOf(deps, table);
+  if (typeof store?.create === 'function') return store.create(values);
+  const sql = sqlOf(tx);
+  if (!sql)
+    throw new Error(`Sem porta nem transação para escrever em ${table}`);
+  const columns = assertColumns(values);
+  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+  const result = await sql.query(
+    `insert into ${NORMATIVE_TABLES[table]} (${columns.join(', ')})
+     values (${placeholders}) returning *`,
+    columns.map((column) => normalize(values[column])),
+  );
+  return (result.rows[0] ?? values) as NormativeRow;
+}
+
+export async function patchRow(
+  deps: NormativeDeps,
+  tx: unknown,
+  table: NormativeTableName,
+  id: string,
+  patch: NormativeRow,
+): Promise<NormativeRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.update === 'function') return store.update(id, patch, tx);
+  const sql = sqlOf(tx);
+  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
+  const columns = assertColumns(patch);
+  const assignments = columns
+    .map((column, index) => `${column} = $${index + 2}`)
+    .join(', ');
+  const result = await sql.query(
+    `update ${NORMATIVE_TABLES[table]}
+        set ${assignments}, updated_at = now()
+      where id = $1 returning *`,
+    [id, ...columns.map((column) => normalize(patch[column]))],
+  );
+  return result.rows[0];
+}
+
+function normalize(value: unknown): unknown {
+  if (value === null || value === undefined) return null;
+  if (typeof value === 'object' && !(value instanceof Date))
+    return JSON.stringify(value);
+  return value;
+}
+
+export function stringOf(value: unknown): string {
+  return typeof value === 'string' ? value : String(value ?? '');
+}
+
+export function isoOf(value: unknown): string {
+  if (value instanceof Date) return value.toISOString();
+  return stringOf(value);
+}
+
+export function dateOf(value: unknown): string {
+  return isoOf(value).slice(0, 10);
+}
+
+export function todayOf(clock: NormativeClock): string {
+  return clock.today?.() ?? clock.now().slice(0, 10);
+}
+
+export function sha256Hex(payload: string): string {
+  return createHash('sha256').update(payload, 'utf8').digest('hex');
+}
+
+export function validationFailed(
+  fields: readonly { path: string; rule: string }[],
+): DetranError {
+  return new DetranError('TEAT.VALIDATION_FAILED', {
+    status: 422,
+    context: { fields: [...fields] },
+    message: 'Requisição inválida para a regra do comando.',
+  });
+}
+
+export function tenantMismatch(context: Record<string, unknown>): DetranError {
+  return new DetranError('TEAT.TENANT_MISMATCH', {
+    status: 404,
+    context,
+    message: 'Recurso inexistente no tenant do contexto.',
+  });
+}
+
+export function packageStateInvalid(
+  packageId: string,
+  currentState: string,
+  allowed: readonly string[],
+): DetranError {
+  return new DetranError('TEAT.PACKAGE_STATE_INVALID', {
+    status: 409,
+    context: { packageId, currentState, allowed: [...allowed] },
+    message: 'Pacote normativo fora do estado admitido pelo comando.',
+  });
+}
+
+export function catalogStateInvalid(
+  catalogId: string,
+  currentState: string,
+  allowed: readonly string[],
+): DetranError {
+  return new DetranError('TEAT.CATALOG_STATE_INVALID', {
+    status: 409,
+    context: { catalogId, currentState, allowed: [...allowed] },
+    message: 'Catálogo normativo fora do estado admitido pelo comando.',
+  });
+}
+
+export function catalogNotActive(
+  catalogId: string,
+  currentState: string,
+): DetranError {
+  return new DetranError('TEAT.PACKAGE_CATALOG_NOT_ACTIVE', {
+    status: 422,
+    context: { catalogId, currentState },
+    message: 'O catálogo do pacote não está ativo.',
+  });
+}
+
+export function manifestMismatch(
+  packageId: string,
+  expected: string,
+  received: string,
+): DetranError {
+  return new DetranError('TEAT.PACKAGE_MANIFEST_MISMATCH', {
+    status: 422,
+    context: { packageId, expected, received },
+    message: 'Manifesto do pacote divergente do gravado.',
+  });
+}
diff --git a/backend/domains/inf/normative/src/handwritten/package-content.query.spec.ts b/backend/domains/inf/normative/src/handwritten/package-content.query.spec.ts
new file mode 100644
index 0000000..af0b8fa
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/package-content.query.spec.ts
@@ -0,0 +1,185 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §3/§6.5 e §10 (R-0008, TASK-0006) — C-0003-27…28: `GET
+ * /v1/inf/normative/mobile-packages/{id}/content` (M13, ADR-0018).
+ * `handwritten/package-content.query.ts` nasce em TASK-0007. Nome esperado
+ * do export: `PackageContentQuery`, construtor `(deps)`, método `execute`.
+ *
+ * Canônico (CTG-0003 §3): assinatura local via `PackageSignerPort` — app e
+ * perfil local usam `LocalPackageSigner`: `signature.kind='local-unsigned'`,
+ * `signature.signer='detran-backend-local'` (OD-T16 permanece aberta: o
+ * substrato de selo real é `source_pending`). `ETag` da resposta é o
+ * `manifest_hash`.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
+const PACKAGE_PUBLISHED = 'package-published-fixture';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    listWhere: vi.fn(
+      async (predicate: (row: Record<string, unknown>) => boolean) =>
+        store.filter(predicate),
+    ),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  packageSigner: { sign: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function catalogRepositories(manifestHash: string) {
+  return {
+    catalogs: repository([
+      { id: CATALOG_ACTIVE, tenant_id: TENANT_ID, status: 'active' },
+    ]),
+    framings: repository([
+      { id: 'framing-1', catalog_id: CATALOG_ACTIVE, status: 'active' },
+    ]),
+    metrologicalTables: repository(),
+    validationRules: repository(),
+    documentTemplates: repository(),
+    agencyParameters: repository(),
+    packages: repository([
+      {
+        id: PACKAGE_PUBLISHED,
+        tenant_id: TENANT_ID,
+        catalog_id: CATALOG_ACTIVE,
+        status: 'published',
+        manifest_hash: manifestHash,
+      },
+    ]),
+  };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({
+        tenantId: TENANT_ID,
+        actorId: '00000000-0000-4000-8000-0000b0000001',
+      }),
+    },
+    repositories:
+      overrides.repositories ?? catalogRepositories('sha256:matching-hash'),
+    packageSigner: overrides.packageSigner ?? {
+      sign: vi.fn(async (manifestHash: string) => ({
+        signature: `sha256-of-${manifestHash}`,
+        signer: 'detran-backend-local',
+        kind: 'local-unsigned' as const,
+      })),
+    },
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function queryContent(
+  dependencies: Deps,
+  id: string,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./package-content.query.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/normative/src/handwritten/package-content.query.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.PackageContentQuery as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'package-content.query.ts não exporta uma query construtível (CTG-0003 §11)',
+    );
+  }
+  const Query = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const query = new Query(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => query[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'package-content.query.ts não expõe execute|handle|run (CTG-0003 §6.5)',
+    );
+  }
+  return (await (method as (value: unknown) => Promise<unknown>).call(
+    query,
+    id,
+  )) as Record<string, unknown>;
+}
+
+describe('CTG-0003 §6.5 — mobile-packages/{id}/content: recomposição e assinatura local (C-0003-27…28)', () => {
+  it('C-0003-27 — dado um pacote published cujo catálogo mudou desde a geração então 422 TEAT.PACKAGE_MANIFEST_MISMATCH', async () => {
+    // manifest_hash gravado não bate com o manifesto recomposto a partir das
+    // linhas active atuais do catálogo (framing acrescentado depois de gerar).
+    const dependencies = deps({
+      repositories: catalogRepositories('sha256:hash-gravado-antes-da-mudanca'),
+    });
+    await expect(
+      queryContent(dependencies, PACKAGE_PUBLISHED),
+    ).rejects.toMatchObject({
+      code: 'TEAT.PACKAGE_MANIFEST_MISMATCH',
+      status: 422,
+      context: expect.objectContaining({ packageId: PACKAGE_PUBLISHED }),
+    });
+  });
+
+  it('C-0003-28 — dado GET .../content íntegro então a resposta traz signature.kind=local-unsigned, signature.signer=detran-backend-local e ETag=manifest_hash', async () => {
+    // Recompõe o mesmo repositório duas vezes para obter o manifest_hash real
+    // e então gravar essa mesma linha como "íntegra" (hash gravado == recomposto).
+    const probe = catalogRepositories('sha256:probe');
+    const probeDeps = deps({ repositories: probe });
+    let manifestHash: string | undefined;
+    try {
+      await queryContent(probeDeps, PACKAGE_PUBLISHED);
+    } catch (error) {
+      const context = (error as { context?: { expected?: string } }).context;
+      manifestHash = context?.expected;
+    }
+    if (!manifestHash) {
+      throw new Error(
+        'não foi possível descobrir o manifest_hash recomposto a partir do 422 (o comando ainda não existe)',
+      );
+    }
+    const dependencies = deps({
+      repositories: catalogRepositories(manifestHash),
+    });
+    const response = await queryContent(dependencies, PACKAGE_PUBLISHED);
+    expect(response.manifest_hash).toBe(manifestHash);
+    const signature = response.signature as {
+      kind?: string;
+      signer?: string;
+    };
+    expect(signature.kind).toBe('local-unsigned');
+    expect(signature.signer).toBe('detran-backend-local');
+  });
+});
diff --git a/backend/domains/inf/normative/src/handwritten/package-content.query.ts b/backend/domains/inf/normative/src/handwritten/package-content.query.ts
new file mode 100644
index 0000000..66db8d7
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/package-content.query.ts
@@ -0,0 +1,61 @@
+// CTG-0003 §3 e §6.5 (M13, ADR-0018, R-0008, TASK-0007) — `GET
+// /v1/inf/normative/mobile-packages/{id}/content`.
+//
+// Recompõe o manifesto do catálogo e compara com o `manifest_hash` gravado:
+// divergente → 422 `TEAT.PACKAGE_MANIFEST_MISMATCH` (o pacote foi adulterado
+// ou o catálogo mudou sob ele). A assinatura vem da porta
+// `PackageSignerPort`; no perfil local ela é `local-unsigned` (OD-T16).
+import {
+  buildManifest,
+  manifestHashOf,
+  type NormativeManifest,
+} from './manifest.js';
+import { LocalPackageSigner } from './package-signer.js';
+import {
+  manifestMismatch,
+  packageStateInvalid,
+  readRow,
+  stringOf,
+  tenantMismatch,
+  type NormativeDeps,
+  type PackageSignature,
+} from './normative-runtime.js';
+
+const READABLE = ['published'] as const;
+
+export interface PackageContentResult {
+  manifest: NormativeManifest;
+  manifest_hash: string;
+  signature: PackageSignature;
+}
+
+export class PackageContentQuery {
+  constructor(private readonly deps: NormativeDeps) {}
+
+  async execute(packageId: string): Promise<PackageContentResult> {
+    const row = await readRow(this.deps, 'packages', packageId);
+    if (!row) throw tenantMismatch({ packageId });
+    const currentState = stringOf(row.status);
+    if (!(READABLE as readonly string[]).includes(currentState))
+      throw packageStateInvalid(packageId, currentState, READABLE);
+
+    const catalogId = stringOf(row.catalog_id);
+    const catalog = await readRow(this.deps, 'catalogs', catalogId);
+    if (!catalog) throw tenantMismatch({ packageId, catalogId });
+
+    const agencyId = row.traffic_agency_id
+      ? stringOf(row.traffic_agency_id)
+      : null;
+    const manifest = await buildManifest(this.deps, catalog, agencyId);
+    const manifestHash = manifestHashOf(manifest);
+    // §6.5 / OD-T52 (adenda §13): a guarda corre **sempre**; não há exceção
+    // por proveniência do pacote.
+    const storedHash = stringOf(row.manifest_hash);
+    if (manifestHash !== storedHash)
+      throw manifestMismatch(packageId, manifestHash, storedHash);
+
+    const signer = this.deps.packageSigner ?? new LocalPackageSigner();
+    const signature = await signer.sign(manifestHash);
+    return { manifest, manifest_hash: manifestHash, signature };
+  }
+}
diff --git a/backend/domains/inf/normative/src/handwritten/package-signer.ts b/backend/domains/inf/normative/src/handwritten/package-signer.ts
new file mode 100644
index 0000000..7023099
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/package-signer.ts
@@ -0,0 +1,23 @@
+// CTG-0003 §3 (M13, ADR-0018, R-0008, TASK-0007) — `PackageSignerPort` local.
+//
+// O substrato de selo real (`DocumentsFacade.seal`) é `source_pending`
+// enquanto ADR-0018 não estiver ligado (OD-T16): nenhuma constante de
+// certificado entra no código. Até lá o pacote sai marcado
+// `kind='local-unsigned'`, que é a afirmação honesta de que aquilo **não** é
+// assinatura com validade jurídica.
+import { sha256Hex, type PackageSignature } from './normative-runtime.js';
+
+export const LOCAL_PACKAGE_SIGNER_NAME = 'detran-backend-local';
+
+/** Token de injeção da porta (a forma está em `@detran/ops-core`, §4.8). */
+export const PACKAGE_SIGNER_PORT: unique symbol = Symbol('PACKAGE_SIGNER_PORT');
+
+export class LocalPackageSigner {
+  async sign(manifestHash: string): Promise<PackageSignature> {
+    return {
+      signature: sha256Hex(manifestHash),
+      signer: LOCAL_PACKAGE_SIGNER_NAME,
+      kind: 'local-unsigned',
+    };
+  }
+}
diff --git a/backend/domains/inf/normative/src/handwritten/package-sync-metadata.query.ts b/backend/domains/inf/normative/src/handwritten/package-sync-metadata.query.ts
new file mode 100644
index 0000000..f8c3b30
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/package-sync-metadata.query.ts
@@ -0,0 +1,59 @@
+// CTG-0003 §6.6 (M13, R-0008, TASK-0007) — `GET
+// /v1/inf/normative/mobile-packages/sync-metadata`.
+//
+// Só pacotes `published` **e** com `valid_until` nulo ou ≥ hoje, na ordem
+// `published_at desc`.
+import { rowValue } from './events.js';
+import {
+  dateOf,
+  readRows,
+  stringOf,
+  todayOf,
+  type NormativeDeps,
+  type NormativeRow,
+} from './normative-runtime.js';
+
+export interface SyncMetadataPackage {
+  id: string;
+  package_uri: string;
+  manifest_hash: string;
+  package_version: string;
+  published_at: string | null;
+  valid_until: string | null;
+}
+
+export class PackageSyncMetadataQuery {
+  constructor(private readonly deps: NormativeDeps) {}
+
+  async execute(): Promise<{ packages: SyncMetadataPackage[] }> {
+    const today = todayOf(this.deps.clock);
+    const rows = await readRows(
+      this.deps,
+      'packages',
+      (row) => row.status === 'published' && isCurrent(row, today),
+    );
+    const packages = rows
+      .map((row) => ({
+        id: stringOf(row.id),
+        package_uri: stringOf(row.package_uri ?? ''),
+        manifest_hash: stringOf(row.manifest_hash ?? ''),
+        package_version: stringOf(row.package_version ?? ''),
+        published_at: rowValue(row, 'published_at'),
+        valid_until: rowValue(row, 'valid_until'),
+      }))
+      .sort(byPublishedAtDesc);
+    return { packages };
+  }
+}
+
+function isCurrent(row: NormativeRow, today: string): boolean {
+  if (row.valid_until === null || row.valid_until === undefined) return true;
+  return dateOf(row.valid_until) >= today;
+}
+
+function byPublishedAtDesc(
+  left: SyncMetadataPackage,
+  right: SyncMetadataPackage,
+): number {
+  return (right.published_at ?? '').localeCompare(left.published_at ?? '');
+}
diff --git a/backend/domains/inf/normative/src/handwritten/publish-catalog.command.ts b/backend/domains/inf/normative/src/handwritten/publish-catalog.command.ts
new file mode 100644
index 0000000..fddd0f8
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/publish-catalog.command.ts
@@ -0,0 +1,117 @@
+// CTG-0003 §6.1 (R-0008, TASK-0007) — `POST
+// /v1/inf/normative/catalogs/{id}/publish` e `.../retire`.
+//
+// [WF-TEAT-003]: `publish` vale de `draft` **e** de `active` (é idempotente);
+// `retire` só de `active`. Fora disso, 409 `TEAT.CATALOG_STATE_INVALID`.
+import { catalogPublishedEvent, rowValue } from './events.js';
+import {
+  catalogStateInvalid,
+  dateOf,
+  inTenantTransaction,
+  patchRow,
+  readRow,
+  stringOf,
+  tenantMismatch,
+  tenantScope,
+  todayOf,
+  type NormativeDeps,
+  type NormativeRow,
+} from './normative-runtime.js';
+
+const PUBLISHABLE = ['draft', 'active'] as const;
+const RETIRABLE = ['active'] as const;
+
+export interface PublishCatalogInput {
+  published_at?: string;
+}
+
+export interface RetireCatalogInput {
+  valid_to?: string;
+}
+
+export interface CatalogCommandResult {
+  id: string;
+  status: string;
+  published_at: string | null;
+  valid_to: string | null;
+}
+
+export class PublishCatalogCommand {
+  constructor(private readonly deps: NormativeDeps) {}
+
+  async publish(
+    catalogId: string,
+    input: PublishCatalogInput = {},
+  ): Promise<CatalogCommandResult> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const occurredAt = this.deps.clock.now();
+    const catalog = await this.load(catalogId);
+    const currentState = stringOf(catalog.status);
+    if (!(PUBLISHABLE as readonly string[]).includes(currentState))
+      throw catalogStateInvalid(catalogId, currentState, PUBLISHABLE);
+
+    const publishedAt = input?.published_at
+      ? dateOf(input.published_at)
+      : todayOf(this.deps.clock);
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const updated = (await patchRow(this.deps, tx, 'catalogs', catalogId, {
+        status: 'active',
+        published_at: publishedAt,
+      })) ?? { ...catalog, status: 'active', published_at: publishedAt };
+
+      await this.deps.outbox?.append(
+        tx,
+        catalogPublishedEvent(
+          { tenantId, actorId, occurredAt },
+          {
+            catalogId,
+            name: stringOf(catalog.name),
+            version: stringOf(catalog.version),
+            publishedAt,
+            validFrom: rowValue(catalog, 'valid_from'),
+          },
+        ),
+      );
+
+      return view(updated, catalogId);
+    });
+  }
+
+  async retire(
+    catalogId: string,
+    input: RetireCatalogInput = {},
+  ): Promise<CatalogCommandResult> {
+    const catalog = await this.load(catalogId);
+    const currentState = stringOf(catalog.status);
+    if (!(RETIRABLE as readonly string[]).includes(currentState))
+      throw catalogStateInvalid(catalogId, currentState, RETIRABLE);
+
+    const validTo = input?.valid_to
+      ? dateOf(input.valid_to)
+      : todayOf(this.deps.clock);
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const updated = (await patchRow(this.deps, tx, 'catalogs', catalogId, {
+        status: 'retired',
+        valid_to: validTo,
+      })) ?? { ...catalog, status: 'retired', valid_to: validTo };
+      return view(updated, catalogId);
+    });
+  }
+
+  private async load(catalogId: string): Promise<NormativeRow> {
+    const catalog = await readRow(this.deps, 'catalogs', catalogId);
+    if (!catalog) throw tenantMismatch({ catalogId });
+    return catalog;
+  }
+}
+
+function view(row: NormativeRow, catalogId: string): CatalogCommandResult {
+  return {
+    id: stringOf(row.id || catalogId),
+    status: stringOf(row.status),
+    published_at: rowValue(row, 'published_at'),
+    valid_to: rowValue(row, 'valid_to'),
+  };
+}
diff --git a/backend/domains/inf/normative/src/handwritten/publish-package.command.spec.ts b/backend/domains/inf/normative/src/handwritten/publish-package.command.spec.ts
new file mode 100644
index 0000000..c9487d2
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/publish-package.command.spec.ts
@@ -0,0 +1,208 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §2/§6.3 e §10 (R-0008, TASK-0006) — C-0003-23…24: `POST
+ * /v1/inf/normative/mobile-packages/{id}/publish` e `.../retire` (M13).
+ * `handwritten/publish-package.command.ts` nasce em TASK-0007 (CTG-0003
+ * §11). Nome esperado do export: `PublishPackageCommand`, construtor
+ * `(deps)`, métodos `publish` e `retire`.
+ *
+ * Fixtures: `normative_mobile_package` `…e7000001` (`published`, catálogo
+ * `…e0000001` ativo) e `…e7000002` (`draft`, `27-fixtures-teat-evidence.sql`).
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
+const PACKAGE_DRAFT = '00000000-0000-7000-8000-0000e7000002';
+const PACKAGE_RETIRED = 'package-retired-fixture';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({
+        tenantId: TENANT_ID,
+        actorId: '00000000-0000-4000-8000-0000b0000001',
+      }),
+    },
+    repositories: {
+      catalogs: repository([
+        { id: CATALOG_ACTIVE, tenant_id: TENANT_ID, status: 'active' },
+      ]),
+      packages: repository([
+        {
+          id: PACKAGE_DRAFT,
+          tenant_id: TENANT_ID,
+          catalog_id: CATALOG_ACTIVE,
+          status: 'draft',
+          manifest_hash: 'sha256:draft-manifest-hash',
+        },
+        {
+          id: PACKAGE_RETIRED,
+          tenant_id: TENANT_ID,
+          catalog_id: CATALOG_ACTIVE,
+          status: 'retired',
+          manifest_hash: 'sha256:retired-manifest-hash',
+        },
+      ]),
+      ...(overrides.repositories ?? {}),
+    },
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function loadCommand(
+  dependencies: Deps,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./publish-package.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/normative/src/handwritten/publish-package.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.PublishPackageCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'publish-package.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  return new Command(dependencies);
+}
+
+async function publish(
+  dependencies: Deps,
+  id: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  const command = await loadCommand(dependencies);
+  const method = ['publish', 'execute', 'handle']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'publish-package.command.ts não expõe publish|execute|handle',
+    );
+  }
+  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
+    command,
+    id,
+    body,
+  )) as Record<string, unknown>;
+}
+
+async function retire(
+  dependencies: Deps,
+  id: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  const command = await loadCommand(dependencies);
+  const method = ['retire']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error('publish-package.command.ts não expõe retire');
+  }
+  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
+    command,
+    id,
+    body,
+  )) as Record<string, unknown>;
+}
+
+describe('CTG-0003 §6.3 — mobile-packages publish/retire: manifesto divergente e estado (C-0003-23…24)', () => {
+  it('C-0003-23 — dado publish com manifest_hash divergente então 422 TEAT.PACKAGE_MANIFEST_MISMATCH com { expected, received }', async () => {
+    const dependencies = deps();
+    await expect(
+      publish(dependencies, PACKAGE_DRAFT, {
+        manifest_hash: 'sha256:corpo-divergente',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.PACKAGE_MANIFEST_MISMATCH',
+      status: 422,
+      context: expect.objectContaining({
+        packageId: PACKAGE_DRAFT,
+        expected: 'sha256:draft-manifest-hash',
+        received: 'sha256:corpo-divergente',
+      }),
+    });
+  });
+
+  it('C-0003-24a — dado um pacote retired quando publish então 409 TEAT.PACKAGE_STATE_INVALID com allowed:[draft,published]', async () => {
+    const dependencies = deps();
+    await expect(
+      publish(dependencies, PACKAGE_RETIRED, {}),
+    ).rejects.toMatchObject({
+      code: 'TEAT.PACKAGE_STATE_INVALID',
+      status: 409,
+      context: expect.objectContaining({
+        packageId: PACKAGE_RETIRED,
+        currentState: 'retired',
+        allowed: ['draft', 'published'],
+      }),
+    });
+  });
+
+  it('C-0003-24b — dado um pacote retired quando retire então 409 TEAT.PACKAGE_STATE_INVALID com allowed:[published]', async () => {
+    const dependencies = deps();
+    await expect(
+      retire(dependencies, PACKAGE_RETIRED, {}),
+    ).rejects.toMatchObject({
+      code: 'TEAT.PACKAGE_STATE_INVALID',
+      status: 409,
+      context: expect.objectContaining({
+        packageId: PACKAGE_RETIRED,
+        currentState: 'retired',
+        allowed: ['published'],
+      }),
+    });
+  });
+
+  it('dado publish sem manifest_hash informado então sucede a partir de draft', async () => {
+    const dependencies = deps();
+    const response = await publish(dependencies, PACKAGE_DRAFT, {});
+    expect(response.status).toBe('published');
+  });
+});
diff --git a/backend/domains/inf/normative/src/handwritten/publish-package.command.ts b/backend/domains/inf/normative/src/handwritten/publish-package.command.ts
new file mode 100644
index 0000000..1c1832d
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/publish-package.command.ts
@@ -0,0 +1,140 @@
+// CTG-0003 §6.3 (M13, R-0008, TASK-0007) — `POST
+// /v1/inf/normative/mobile-packages/{id}/publish` e `.../retire`.
+//
+// `publish` vale de `draft` e de `published` (idempotente); `retire` só de
+// `published`. `retire` não publica evento: §8 não nomeia token de retirada.
+import { packagePublishedEvent, rowValue } from './events.js';
+import {
+  catalogNotActive,
+  dateOf,
+  inTenantTransaction,
+  packageStateInvalid,
+  patchRow,
+  readRow,
+  stringOf,
+  manifestMismatch,
+  tenantMismatch,
+  tenantScope,
+  type NormativeDeps,
+  type NormativeRow,
+} from './normative-runtime.js';
+
+const PUBLISHABLE = ['draft', 'published'] as const;
+const RETIRABLE = ['published'] as const;
+
+export interface PublishPackageInput {
+  package_uri?: string;
+  manifest_hash?: string;
+  valid_until?: string;
+}
+
+export interface RetirePackageInput {
+  valid_until?: string;
+}
+
+export interface PackageCommandResult {
+  id: string;
+  status: string;
+  package_version: string;
+  manifest_hash: string;
+  published_at: string | null;
+  valid_until: string | null;
+}
+
+export class PublishPackageCommand {
+  constructor(private readonly deps: NormativeDeps) {}
+
+  async publish(
+    packageId: string,
+    input: PublishPackageInput = {},
+  ): Promise<PackageCommandResult> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const occurredAt = this.deps.clock.now();
+    const row = await this.load(packageId);
+    const currentState = stringOf(row.status);
+    if (!(PUBLISHABLE as readonly string[]).includes(currentState))
+      throw packageStateInvalid(packageId, currentState, PUBLISHABLE);
+
+    const catalogId = stringOf(row.catalog_id);
+    const catalog = await readRow(this.deps, 'catalogs', catalogId);
+    const catalogState = stringOf(catalog?.status ?? '');
+    if (catalogState !== 'active')
+      throw catalogNotActive(catalogId, catalogState);
+
+    const storedHash = stringOf(row.manifest_hash);
+    const declaredHash = stringOf(input?.manifest_hash ?? '').trim();
+    if (declaredHash && declaredHash !== storedHash)
+      throw manifestMismatch(packageId, storedHash, declaredHash);
+
+    const validUntil = input?.valid_until ? dateOf(input.valid_until) : null;
+    const patch: NormativeRow = {
+      status: 'published',
+      published_at: occurredAt,
+      ...(input?.package_uri ? { package_uri: input.package_uri } : {}),
+      ...(validUntil ? { valid_until: validUntil } : {}),
+    };
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const updated =
+        (await patchRow(this.deps, tx, 'packages', packageId, patch)) ??
+        ({ ...row, ...patch } as NormativeRow);
+
+      await this.deps.outbox?.append(
+        tx,
+        packagePublishedEvent(
+          { tenantId, actorId, occurredAt },
+          {
+            packageId,
+            catalogId,
+            packageVersion: stringOf(row.package_version),
+            manifestHash: storedHash,
+            publishedAt: occurredAt,
+            validUntil: rowValue(updated, 'valid_until'),
+          },
+        ),
+      );
+
+      return view(updated, packageId);
+    });
+  }
+
+  async retire(
+    packageId: string,
+    input: RetirePackageInput = {},
+  ): Promise<PackageCommandResult> {
+    const row = await this.load(packageId);
+    const currentState = stringOf(row.status);
+    if (!(RETIRABLE as readonly string[]).includes(currentState))
+      throw packageStateInvalid(packageId, currentState, RETIRABLE);
+
+    const validUntil = input?.valid_until ? dateOf(input.valid_until) : null;
+    const patch: NormativeRow = {
+      status: 'retired',
+      ...(validUntil ? { valid_until: validUntil } : {}),
+    };
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const updated =
+        (await patchRow(this.deps, tx, 'packages', packageId, patch)) ??
+        ({ ...row, ...patch } as NormativeRow);
+      return view(updated, packageId);
+    });
+  }
+
+  private async load(packageId: string): Promise<NormativeRow> {
+    const row = await readRow(this.deps, 'packages', packageId);
+    if (!row) throw tenantMismatch({ packageId });
+    return row;
+  }
+}
+
+function view(row: NormativeRow, packageId: string): PackageCommandResult {
+  return {
+    id: stringOf(row.id || packageId),
+    status: stringOf(row.status),
+    package_version: stringOf(row.package_version ?? ''),
+    manifest_hash: stringOf(row.manifest_hash ?? ''),
+    published_at: rowValue(row, 'published_at'),
+    valid_until: rowValue(row, 'valid_until'),
+  };
+}
diff --git a/backend/domains/inf/normative/src/handwritten/validate-package.command.spec.ts b/backend/domains/inf/normative/src/handwritten/validate-package.command.spec.ts
new file mode 100644
index 0000000..f54f588
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/validate-package.command.spec.ts
@@ -0,0 +1,186 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §2/§6.4 e §10 (R-0008, TASK-0006) — C-0003-25…26: `POST
+ * /v1/inf/normative/mobile-packages/{id}/validate` (M13, [WF-TEAT-003]).
+ * `handwritten/validate-package.command.ts` nasce em TASK-0007. Nome
+ * esperado do export: `ValidatePackageCommand`, construtor `(deps)`, método
+ * `execute`.
+ *
+ * Canônico (CTG-0003 §6.4): idempotente, **nunca** muda `status`;
+ * `reason ∈ 'version_mismatch' | 'hash_mismatch' | 'not_published' | 'expired'`,
+ * ordem de avaliação version → hash → status → valid_until.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const PACKAGE_PUBLISHED = 'package-published-fixture';
+const PACKAGE_DRAFT = 'package-draft-fixture';
+const PACKAGE_EXPIRED = 'package-expired-fixture';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({
+        tenantId: TENANT_ID,
+        actorId: '00000000-0000-4000-8000-0000b0000001',
+      }),
+    },
+    repositories: {
+      packages: repository([
+        {
+          id: PACKAGE_PUBLISHED,
+          tenant_id: TENANT_ID,
+          status: 'published',
+          package_version: '2026.1',
+          manifest_hash: 'sha256:manifest-published',
+          valid_until: null,
+        },
+        {
+          id: PACKAGE_DRAFT,
+          tenant_id: TENANT_ID,
+          status: 'draft',
+          package_version: '2026.2',
+          manifest_hash: 'sha256:manifest-draft',
+          valid_until: null,
+        },
+        {
+          id: PACKAGE_EXPIRED,
+          tenant_id: TENANT_ID,
+          status: 'published',
+          package_version: '2026.1',
+          manifest_hash: 'sha256:manifest-expired',
+          valid_until: '2026-01-01',
+        },
+      ]),
+      ...(overrides.repositories ?? {}),
+    },
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function validatePackage(
+  dependencies: Deps,
+  id: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./validate-package.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/normative/src/handwritten/validate-package.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.ValidatePackageCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'validate-package.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'validate-package.command.ts não expõe execute|handle|run (CTG-0003 §6.4)',
+    );
+  }
+  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
+    command,
+    id,
+    body,
+  )) as Record<string, unknown>;
+}
+
+describe('CTG-0003 §6.4 — mobile-packages/validate: idempotência e precedência dos motivos (C-0003-25…26)', () => {
+  it('C-0003-25 — dado validate sobre um pacote published com hash e versão corretos então { valid:true, reason:null } e status inalterado; duas execuções dão a mesma resposta', async () => {
+    const dependencies = deps();
+    const body = {
+      package_version: '2026.1',
+      manifest_hash: 'sha256:manifest-published',
+    };
+    const first = await validatePackage(dependencies, PACKAGE_PUBLISHED, body);
+    const second = await validatePackage(dependencies, PACKAGE_PUBLISHED, body);
+    expect(first).toEqual({ valid: true, reason: null });
+    expect(second).toEqual(first);
+    expect(
+      dependencies.repositories.packages.rows.find(
+        (row) => row.id === PACKAGE_PUBLISHED,
+      )?.status,
+    ).toBe('published');
+  });
+
+  it('C-0003-26a — dado validate com versão errada então { valid:false, reason:"version_mismatch" }, sem exceção', async () => {
+    const dependencies = deps();
+    const response = await validatePackage(dependencies, PACKAGE_PUBLISHED, {
+      package_version: '9999.9',
+      manifest_hash: 'sha256:manifest-published',
+    });
+    expect(response).toEqual({ valid: false, reason: 'version_mismatch' });
+  });
+
+  it('C-0003-26b — dado validate com hash errado (versão correta) então { valid:false, reason:"hash_mismatch" }', async () => {
+    const dependencies = deps();
+    const response = await validatePackage(dependencies, PACKAGE_PUBLISHED, {
+      package_version: '2026.1',
+      manifest_hash: 'sha256:hash-errado',
+    });
+    expect(response).toEqual({ valid: false, reason: 'hash_mismatch' });
+  });
+
+  it('C-0003-26c — dado validate sobre draft (versão e hash corretos) então { valid:false, reason:"not_published" }', async () => {
+    const dependencies = deps();
+    const response = await validatePackage(dependencies, PACKAGE_DRAFT, {
+      package_version: '2026.2',
+      manifest_hash: 'sha256:manifest-draft',
+    });
+    expect(response).toEqual({ valid: false, reason: 'not_published' });
+  });
+
+  it('C-0003-26d — dado validate sobre publicado com valid_until no passado (versão e hash corretos) então { valid:false, reason:"expired" }', async () => {
+    const dependencies = deps();
+    const response = await validatePackage(dependencies, PACKAGE_EXPIRED, {
+      package_version: '2026.1',
+      manifest_hash: 'sha256:manifest-expired',
+    });
+    expect(response).toEqual({ valid: false, reason: 'expired' });
+  });
+});
diff --git a/backend/domains/inf/normative/src/handwritten/validate-package.command.ts b/backend/domains/inf/normative/src/handwritten/validate-package.command.ts
new file mode 100644
index 0000000..3d5b394
--- /dev/null
+++ b/backend/domains/inf/normative/src/handwritten/validate-package.command.ts
@@ -0,0 +1,59 @@
+// CTG-0003 §6.4 (M13, [WF-TEAT-003], R-0008, TASK-0007) — `POST
+// /v1/inf/normative/mobile-packages/{id}/validate`.
+//
+// Diagnóstico, não transição: idempotente, nunca muda `status`, e nunca
+// expõe detalhe interno de armazenamento — a divergência sai em `reason`,
+// não em exceção. `VALIDADO_PKG` do workflow é nome de domínio e não
+// persiste (§2).
+import {
+  dateOf,
+  readRow,
+  stringOf,
+  tenantMismatch,
+  todayOf,
+  type NormativeDeps,
+} from './normative-runtime.js';
+
+export const PACKAGE_VALIDATION_REASONS = [
+  'version_mismatch',
+  'hash_mismatch',
+  'not_published',
+  'expired',
+] as const;
+
+export type PackageValidationReason =
+  (typeof PACKAGE_VALIDATION_REASONS)[number];
+
+export interface ValidatePackageInput {
+  package_version: string;
+  manifest_hash: string;
+}
+
+export interface ValidatePackageResult {
+  valid: boolean;
+  reason: PackageValidationReason | null;
+}
+
+export class ValidatePackageCommand {
+  constructor(private readonly deps: NormativeDeps) {}
+
+  async execute(
+    packageId: string,
+    input: ValidatePackageInput,
+  ): Promise<ValidatePackageResult> {
+    const row = await readRow(this.deps, 'packages', packageId);
+    if (!row) throw tenantMismatch({ packageId });
+
+    // Ordem de avaliação fixada pela §6.4: versão → hash → estado → vigência.
+    if (stringOf(row.package_version) !== stringOf(input?.package_version))
+      return { valid: false, reason: 'version_mismatch' };
+    if (stringOf(row.manifest_hash) !== stringOf(input?.manifest_hash))
+      return { valid: false, reason: 'hash_mismatch' };
+    if (row.status !== 'published')
+      return { valid: false, reason: 'not_published' };
+    const validUntil = row.valid_until ? dateOf(row.valid_until) : null;
+    if (validUntil && validUntil < todayOf(this.deps.clock))
+      return { valid: false, reason: 'expired' };
+    return { valid: true, reason: null };
+  }
+}
diff --git a/backend/domains/inf/normative/src/normative-commands.controller.ts b/backend/domains/inf/normative/src/normative-commands.controller.ts
index 5387bcd..80af4b3 100644
--- a/backend/domains/inf/normative/src/normative-commands.controller.ts
+++ b/backend/domains/inf/normative/src/normative-commands.controller.ts
@@ -1,72 +1,109 @@
-import { Body, Controller, Param, Post } from '@nestjs/common';
+// CTG-0003 §6 (M13, R-0008, TASK-0007) — comandos e consultas do catálogo e
+// do pacote normativo sob `v1/inf/normative`.
+//
+// As rotas literais (`mobile-packages/sync-metadata`, `.../generate`,
+// `.../{id}/content`) vencem o `:id` do CRUD gerado porque o gerador registra
+// os controladores manuscritos antes (adenda CTG-0003 §12 item 1).
+import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
 import { Action, Audit, Resource } from '@detran/shared';

-import { NormativeLifecycleService } from './normative-lifecycle.service.js';
+import type { GeneratePackageInput } from './handwritten/generate-package.command.js';
+import { NormativeCommandsService } from './handwritten/normative-commands.service.js';
+import type {
+  PublishCatalogInput,
+  RetireCatalogInput,
+} from './handwritten/publish-catalog.command.js';
+import type {
+  PublishPackageInput,
+  RetirePackageInput,
+} from './handwritten/publish-package.command.js';
+import type { ValidatePackageInput } from './handwritten/validate-package.command.js';

 @Controller('v1/inf/normative')
 @Resource('inf:normative-catalog')
 export class NormativeCommandsController {
-  constructor(private readonly lifecycle: NormativeLifecycleService) {}
+  constructor(private readonly commands: NormativeCommandsService) {}

   @Post('catalogs/:id/publish')
+  @HttpCode(200)
   @Action('publish')
   @Audit({
     action: 'INF_NORMATIVE_CATALOG_PUBLISH',
     entity: 'inf.normative_catalog',
   })
-  publishCatalog(
-    @Param('id') id: string,
-    @Body() body: { published_at?: string },
-  ) {
-    return this.lifecycle.publishCatalog(id, body.published_at);
+  publishCatalog(@Param('id') id: string, @Body() body: PublishCatalogInput) {
+    return this.commands.publishCatalog(id, body ?? {});
   }

   @Post('catalogs/:id/retire')
+  @HttpCode(200)
   @Action('retire')
   @Audit({
     action: 'INF_NORMATIVE_CATALOG_RETIRE',
     entity: 'inf.normative_catalog',
   })
-  retireCatalog(@Param('id') id: string, @Body() body: { valid_to?: string }) {
-    return this.lifecycle.retireCatalog(id, body.valid_to);
+  retireCatalog(@Param('id') id: string, @Body() body: RetireCatalogInput) {
+    return this.commands.retireCatalog(id, body ?? {});
+  }
+
+  @Get('mobile-packages/sync-metadata')
+  @Resource('inf:mobile-normative-package')
+  @Action('read')
+  syncMetadata() {
+    return this.commands.packageSyncMetadata();
+  }
+
+  @Post('mobile-packages/generate')
+  @Resource('inf:mobile-normative-package')
+  @Action('publish')
+  @Audit({
+    action: 'INF_NORMATIVE_PACKAGE_GENERATE',
+    entity: 'inf.normative_mobile_package',
+  })
+  generatePackage(@Body() body: GeneratePackageInput) {
+    return this.commands.generate(body);
+  }
+
+  @Get('mobile-packages/:id/content')
+  @Resource('inf:mobile-normative-package')
+  @Action('read')
+  packageContent(@Param('id') id: string) {
+    return this.commands.packageContent(id);
   }

   @Post('mobile-packages/:id/publish')
+  @HttpCode(200)
   @Resource('inf:mobile-normative-package')
   @Action('publish')
   @Audit({
     action: 'INF_NORMATIVE_PACKAGE_PUBLISH',
     entity: 'inf.normative_mobile_package',
   })
-  publishPackage(@Param('id') id: string) {
-    return this.lifecycle.publishPackage(id);
+  publishPackage(@Param('id') id: string, @Body() body: PublishPackageInput) {
+    return this.commands.publishPackage(id, body ?? {});
   }

   @Post('mobile-packages/:id/retire')
+  @HttpCode(200)
   @Resource('inf:mobile-normative-package')
   @Action('retire')
   @Audit({
     action: 'INF_NORMATIVE_PACKAGE_RETIRE',
     entity: 'inf.normative_mobile_package',
   })
-  retirePackage(
-    @Param('id') id: string,
-    @Body() body: { valid_until?: string },
-  ) {
-    return this.lifecycle.retirePackage(id, body.valid_until);
+  retirePackage(@Param('id') id: string, @Body() body: RetirePackageInput) {
+    return this.commands.retirePackage(id, body ?? {});
   }

   @Post('mobile-packages/:id/validate')
+  @HttpCode(200)
   @Resource('inf:mobile-normative-package')
   @Action('validate')
   @Audit({
     action: 'INF_NORMATIVE_PACKAGE_VALIDATE',
     entity: 'inf.normative_mobile_package',
   })
-  validatePackage(
-    @Param('id') id: string,
-    @Body() body: { package_version: string; manifest_hash: string },
-  ) {
-    return this.lifecycle.validatePackage(id, body);
+  validatePackage(@Param('id') id: string, @Body() body: ValidatePackageInput) {
+    return this.commands.validatePackage(id, body);
   }
 }
diff --git a/backend/domains/inf/normative/src/normative-lifecycle.service.ts b/backend/domains/inf/normative/src/normative-lifecycle.service.ts
index bf57eaf..86c99e6 100644
--- a/backend/domains/inf/normative/src/normative-lifecycle.service.ts
+++ b/backend/domains/inf/normative/src/normative-lifecycle.service.ts
@@ -1,9 +1,11 @@
+// CTG-0003 §6 (R-0008, TASK-0007) — o ciclo de vida do catálogo e do pacote
+// passou para os comandos de `src/handwritten/` (`publish-catalog`,
+// `generate-package`, `publish-package`, `validate-package`), que erram com
+// `DetranError` e os códigos do `teat-error-catalog.md` §9. O que sobra aqui
+// é a porta de referência normativa consumida por `@detran/inf-ait`.
 import { BadRequestException, Injectable } from '@nestjs/common';
 import type { Transaction } from '@stynx-nyx/data';

-import type { MobileNormativePackage } from './entities/mobile-normative-package.entity.js';
-import type { NormativeCatalog } from './entities/normative-catalog.entity.js';
-import type { NormativeFraming } from './entities/normative-framing.entity.js';
 import { MobileNormativePackageRepository } from './repositories/mobile-normative-package.repository.js';
 import { NormativeCatalogRepository } from './repositories/normative-catalog.repository.js';
 import { NormativeFramingRepository } from './repositories/normative-framing.repository.js';
@@ -22,8 +24,16 @@ export class NormativeLifecycleService implements NormativeReferencePort {
     private readonly catalogs: NormativeCatalogRepository,
     private readonly framings: NormativeFramingRepository,
     private readonly packages: MobileNormativePackageRepository,
-  ) {}
+  ) {
+    void this.packages;
+  }

+  /**
+   * Guarda de referência do AIT (`@detran/inf-ait`): enquadramento `active`
+   * dentro de catálogo `active`. Continua em `BadRequestException` porque o
+   * código dela não está entre os da §6 deste contrato — a conversão para
+   * `DetranError` é decisão do enquadramento do AIT, não desta tarefa.
+   */
   async assertActive(
     catalogId: string,
     framingId: string,
@@ -42,91 +52,4 @@ export class NormativeLifecycleService implements NormativeReferencePort {
         `Framing ${framingId} is not active in catalog ${catalogId}`,
       );
   }
-
-  publishCatalog(id: string, publishedAt = today()): Promise<NormativeCatalog> {
-    return this.catalogs.transaction(async (tx) => {
-      const catalog = await this.catalogs.findOne(id, tx);
-      if (!['draft', 'active'].includes(catalog.status))
-        throw new BadRequestException(
-          `Catalog ${id} cannot be published from ${catalog.status}`,
-        );
-      return this.catalogs.update(
-        id,
-        { status: 'active', published_at: publishedAt },
-        tx,
-      );
-    });
-  }
-
-  retireCatalog(id: string, validTo = today()): Promise<NormativeCatalog> {
-    return this.catalogs.transaction(async (tx) => {
-      const catalog = await this.catalogs.findOne(id, tx);
-      if (catalog.status !== 'active')
-        throw new BadRequestException(
-          `Catalog ${id} cannot be retired from ${catalog.status}`,
-        );
-      return this.catalogs.update(
-        id,
-        { status: 'retired', valid_to: validTo },
-        tx,
-      );
-    });
-  }
-
-  publishPackage(id: string): Promise<MobileNormativePackage> {
-    return this.packages.transaction(async (tx) => {
-      const sourcePackage = await this.packages.findOne(id, tx);
-      await this.assertCatalogActive(sourcePackage.catalog_id, tx);
-      return this.packages.update(
-        id,
-        { status: 'published', published_at: new Date().toISOString() },
-        tx,
-      );
-    });
-  }
-
-  retirePackage(
-    id: string,
-    validUntil = today(),
-  ): Promise<MobileNormativePackage> {
-    return this.packages.transaction(async (tx) => {
-      const sourcePackage = await this.packages.findOne(id, tx);
-      if (sourcePackage.status !== 'published')
-        throw new BadRequestException(`Package ${id} is not published`);
-      return this.packages.update(
-        id,
-        { status: 'retired', valid_until: validUntil },
-        tx,
-      );
-    });
-  }
-
-  async validatePackage(
-    id: string,
-    expected: { package_version: string; manifest_hash: string },
-  ): Promise<{ valid: boolean; reason: string | null }> {
-    const sourcePackage = await this.packages.findOne(id);
-    if (sourcePackage.status !== 'published')
-      return { valid: false, reason: 'not-published' };
-    if (sourcePackage.package_version !== expected.package_version)
-      return { valid: false, reason: 'version-mismatch' };
-    if (sourcePackage.manifest_hash !== expected.manifest_hash)
-      return { valid: false, reason: 'hash-mismatch' };
-    if (sourcePackage.valid_until && sourcePackage.valid_until < today())
-      return { valid: false, reason: 'expired' };
-    return { valid: true, reason: null };
-  }
-
-  private async assertCatalogActive(
-    id: string,
-    tx: Transaction,
-  ): Promise<void> {
-    const catalog = await this.catalogs.findOne(id, tx);
-    if (catalog.status !== 'active')
-      throw new BadRequestException(`Normative catalog ${id} is not active`);
-  }
-}
-
-function today(): string {
-  return new Date().toISOString().slice(0, 10);
 }
diff --git a/backend/domains/inf/normative/tests/integration/catalog-publish.integration.spec.ts b/backend/domains/inf/normative/tests/integration/catalog-publish.integration.spec.ts
new file mode 100644
index 0000000..61f6dec
--- /dev/null
+++ b/backend/domains/inf/normative/tests/integration/catalog-publish.integration.spec.ts
@@ -0,0 +1,106 @@
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  commandDeps,
+  FIXTURES,
+  importModule,
+  newClient,
+  outboxEnvelopes,
+  resetDraftCatalog,
+  runCommand,
+} from './harness.js';
+
+/**
+ * CTG-0003 §2/§6.1 e §10 (R-0008, TASK-0006) — C-0003-36: `POST
+ * /v1/inf/normative/catalogs/{id}/publish` de um catálogo `draft` grava
+ * `status='active'`, `published_at` e publica `CATALOGO_PUBLICADO`.
+ *
+ * Usa a fixture `…e0000002` (`draft`, `27-fixtures-teat-evidence.sql`) e
+ * restaura o estado ao final (`resetDraftCatalog`) — fixture compartilhada,
+ * nunca isolada por tenant nesta suíte porque a máquina de estados do
+ * catálogo é o próprio objeto sob teste.
+ */
+
+const COMMAND_EXPORTS = ['PublishCatalogCommand'];
+const COMMAND_METHODS = ['publish', 'execute', 'handle'];
+
+const client: pg.Client = newClient();
+let startedAt: string;
+
+beforeAll(async () => {
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+});
+
+afterAll(async () => {
+  await resetDraftCatalog(client);
+  await client.query(
+    `delete from integration.outbox where tenant_id = $1 and created_at >= $2`,
+    [FIXTURES.tenantId, startedAt],
+  );
+  await client.end();
+});
+
+describe('CTG-0003 §6.1 — catalogs/{id}/publish: draft → active (C-0003-36)', () => {
+  it('C-0003-36 — dado catalogs/{id}/publish de um catálogo draft então status=active, published_at gravado e sai CATALOGO_PUBLICADO', async () => {
+    const dependencies = commandDeps(
+      client,
+      FIXTURES.tenantId,
+      FIXTURES.actorId,
+      {
+        outbox: {
+          append: async (
+            _tx: unknown,
+            envelope: Record<string, unknown>,
+          ): Promise<{ id: string }> => {
+            await client.query(
+              `insert into integration.outbox
+                 (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+               values ($1, $2, $3, $4, $5, $6)
+               on conflict (tenant_id, idempotency_key) do nothing`,
+              [
+                FIXTURES.tenantId,
+                envelope.type,
+                (envelope.aggregate as { kind: string }).kind,
+                (envelope.aggregate as { id: string }).id,
+                JSON.stringify(envelope),
+                `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+              ],
+            );
+            return { id: 'ignored' };
+          },
+        },
+      },
+    );
+
+    await runCommand(
+      () => importModule('../../src/handwritten/publish-catalog.command.js'),
+      'inf/normative/src/handwritten/publish-catalog.command.ts',
+      COMMAND_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      FIXTURES.catalogDraft,
+      {},
+    );
+
+    const catalog = await dependencies.repositories.catalogs.find(
+      FIXTURES.catalogDraft,
+    );
+    expect(catalog?.status).toBe('active');
+    expect(catalog?.published_at).toBeTruthy();
+
+    const envelopes = await outboxEnvelopes(
+      client,
+      FIXTURES.tenantId,
+      startedAt,
+    );
+    expect(
+      envelopes.some(
+        (envelope) => envelope.domainEvent === 'CATALOGO_PUBLICADO',
+      ),
+    ).toBe(true);
+  });
+});
diff --git a/backend/domains/inf/normative/tests/integration/harness.ts b/backend/domains/inf/normative/tests/integration/harness.ts
new file mode 100644
index 0000000..5028c94
--- /dev/null
+++ b/backend/domains/inf/normative/tests/integration/harness.ts
@@ -0,0 +1,262 @@
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { vi } from 'vitest';
+
+/**
+ * Harness de integração de `@detran/inf-normative` (R-0008, TASK-0006,
+ * CTG-0003 §10). Não é um arquivo de teste. Padrão herdado de
+ * `backend/domains/ops/offline-sync/tests/integration/harness.ts` (TASK-0004).
+ */
+const { Client } = pg;
+
+export const CONNECTION_STRING =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+
+export const FIXTURES = {
+  tenantId: '00000000-0000-7000-8000-00000000a001',
+  agencyId: '00000000-0000-7000-8000-0000e2000001',
+  actorId: '00000000-0000-4000-8000-0000b0000001',
+  catalogActive: '00000000-0000-7000-8000-0000e0000001',
+  catalogDraft: '00000000-0000-7000-8000-0000e0000002',
+  packagePublished: '00000000-0000-7000-8000-0000e7000001',
+  packageDraft: '00000000-0000-7000-8000-0000e7000002',
+} as const;
+
+export const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+export function newClient(): pg.Client {
+  return new Client({ connectionString: CONNECTION_STRING });
+}
+
+export function database(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+): { tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> } {
+  return {
+    async tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> {
+      await client.query('begin');
+      try {
+        await client.query('set local role role_app_backend');
+        await client.query(`select set_config('app.tenant_id', $1, true)`, [
+          tenantId,
+        ]);
+        await client.query(`select set_config('app.actor_id', $1, true)`, [
+          actorId,
+        ]);
+        const result = await work({ query: client.query.bind(client) });
+        await client.query('commit');
+        return result;
+      } catch (error) {
+        await client.query('rollback');
+        throw error;
+      }
+    },
+  };
+}
+
+export function requestContext(tenantId: string, actorId: string) {
+  return {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId }),
+  };
+}
+
+interface SqlTransaction {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+export class SqlInfRepository {
+  constructor(
+    private readonly db: ReturnType<typeof database>,
+    private readonly table: string,
+  ) {
+    if (!/^inf\.[a-z_]+$/.test(table)) throw new Error(`Unsafe table ${table}`);
+  }
+
+  list(): Promise<Record<string, unknown>[]> {
+    return this.db.tx(
+      async (tx) =>
+        (
+          await (tx as SqlTransaction).query(
+            `select * from ${this.table} order by created_at desc`,
+          )
+        ).rows,
+    );
+  }
+
+  find(id: string): Promise<Record<string, unknown> | undefined> {
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `select * from ${this.table} where id = $1`,
+        [id],
+      );
+      return result.rows[0];
+    });
+  }
+
+  findOne(id: string): Promise<Record<string, unknown> | undefined> {
+    return this.find(id);
+  }
+}
+
+export function repositories(db: ReturnType<typeof database>) {
+  return {
+    catalogs: new SqlInfRepository(db, 'inf.normative_catalog'),
+    framings: new SqlInfRepository(db, 'inf.normative_framing'),
+    metrologicalTables: new SqlInfRepository(
+      db,
+      'inf.normative_metrological_table',
+    ),
+    validationRules: new SqlInfRepository(db, 'inf.normative_validation_rule'),
+    documentTemplates: new SqlInfRepository(
+      db,
+      'inf.normative_document_template',
+    ),
+    agencyParameters: new SqlInfRepository(
+      db,
+      'inf.normative_agency_parameter',
+    ),
+    packages: new SqlInfRepository(db, 'inf.normative_mobile_package'),
+  };
+}
+
+export function commandDeps(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+  overrides: Record<string, unknown> = {},
+) {
+  const db = database(client, tenantId, actorId);
+  return {
+    database: db,
+    requestContext: requestContext(tenantId, actorId),
+    repositories: repositories(db),
+    packageSigner: {
+      sign: vi.fn(async (manifestHash: string) => ({
+        signature: `sha256-of-${manifestHash}`,
+        signer: 'detran-backend-local',
+        kind: 'local-unsigned' as const,
+      })),
+    },
+    clock: { now: () => new Date().toISOString() },
+    ...overrides,
+  };
+}
+
+export async function runCommand(
+  load: () => Promise<unknown>,
+  label: string,
+  exportNames: readonly string[],
+  methodNames: readonly string[],
+  dependencies: unknown,
+  ...args: unknown[]
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await load()) as Record<string, unknown>;
+  } catch (cause) {
+    throw new Error(`${label} ainda não existe (TASK-0007, CTG-0003 §11)`, {
+      cause,
+    });
+  }
+  const exported =
+    exportNames
+      .map((name) => loaded[name])
+      .find((value) => typeof value === 'function') ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function')
+    throw new Error(`${label} não exporta nada construtível`);
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const instance = new Command(dependencies);
+  const method = methodNames
+    .map((name) => instance[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function')
+    throw new Error(`${label} não expõe nenhum de ${methodNames.join('|')}`);
+  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
+    instance,
+    ...args,
+  )) as Record<string, unknown>;
+}
+
+export async function outboxEnvelopes(
+  client: pg.Client,
+  tenantId: string,
+  since: string,
+): Promise<Record<string, unknown>[]> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const result = await client.query<{ payload: Record<string, unknown> }>(
+    `select payload from integration.outbox
+      where tenant_id = $1 and created_at >= $2
+      order by created_at, id`,
+    [tenantId, since],
+  );
+  return result.rows.map((row) => row.payload);
+}
+
+/** Restaura `inf.normative_catalog …e0000002` para `draft` após um teste que o publica. */
+export async function resetDraftCatalog(client: pg.Client): Promise<void> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `update inf.normative_catalog set status = 'draft', published_at = null
+      where id = $1`,
+    [FIXTURES.catalogDraft],
+  );
+}
+
+/** Restaura `inf.normative_mobile_package …e7000002` para `draft` após publish/retire. */
+export async function resetDraftPackage(client: pg.Client): Promise<void> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `update inf.normative_mobile_package
+        set status = 'draft', published_at = null, valid_until = null
+      where id = $1`,
+    [FIXTURES.packageDraft],
+  );
+}
+
+export async function isolatedPackage(
+  client: pg.Client,
+  tenantId: string,
+  catalogId: string,
+  overrides: {
+    status?: string;
+    validUntil?: string | null;
+  } = {},
+): Promise<string> {
+  const packageId = randomUUID();
+  const status = overrides.status ?? 'published';
+  const publishedAt = status === 'published' ? new Date().toISOString() : null;
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into inf.normative_mobile_package
+       (id, tenant_id, traffic_agency_id, catalog_id, package_version,
+        manifest_hash, package_uri, status, published_at, valid_until)
+     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
+    [
+      packageId,
+      tenantId,
+      '00000000-0000-7000-8000-0000e2000001',
+      catalogId,
+      `test-${packageId.slice(0, 8)}`,
+      'sha256:isolated-package-hash',
+      `/v1/inf/normative/mobile-packages/${packageId}/content`,
+      status,
+      publishedAt,
+      overrides.validUntil ?? null,
+    ],
+  );
+  return packageId;
+}
diff --git a/backend/domains/inf/normative/tests/integration/package-publish.integration.spec.ts b/backend/domains/inf/normative/tests/integration/package-publish.integration.spec.ts
new file mode 100644
index 0000000..09d29c7
--- /dev/null
+++ b/backend/domains/inf/normative/tests/integration/package-publish.integration.spec.ts
@@ -0,0 +1,166 @@
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  commandDeps,
+  FIXTURES,
+  importModule,
+  isolatedPackage,
+  newClient,
+  outboxEnvelopes,
+  runCommand,
+} from './harness.js';
+
+/**
+ * CTG-0003 §2/§6.3/§6.6 e §10 (R-0008, TASK-0006) — C-0003-37…38: `publish`
+ * emite `PACOTE_MOBILE_PUBLICADO` e o pacote aparece em `GET sync-metadata`;
+ * após `retire`, some; um pacote `published` com `valid_until` ontem nunca
+ * aparece em `sync-metadata`.
+ *
+ * Pacotes próprios criados em `isolatedPackage` (tenant canônico, ids
+ * aleatórios) para não mutar `…e7000001`/`…e7000002`; removidos no `afterAll`.
+ */
+
+const PUBLISH_EXPORTS = ['PublishPackageCommand'];
+const PUBLISH_METHODS_PUBLISH = ['publish', 'execute', 'handle'];
+const PUBLISH_METHODS_RETIRE = ['retire'];
+const SYNC_METADATA_EXPORTS = ['PackageSyncMetadataQuery'];
+const SYNC_METADATA_METHODS = ['execute', 'handle', 'run', 'list'];
+
+const client: pg.Client = newClient();
+const createdPackageIds: string[] = [];
+let startedAt: string;
+
+beforeAll(async () => {
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+});
+
+afterAll(async () => {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  if (createdPackageIds.length > 0) {
+    await client.query(
+      `delete from inf.normative_mobile_package where id = any($1::uuid[])`,
+      [createdPackageIds],
+    );
+  }
+  await client.query(
+    `delete from integration.outbox where tenant_id = $1 and created_at >= $2`,
+    [FIXTURES.tenantId, startedAt],
+  );
+  await client.end();
+});
+
+async function syncMetadataPackageIds(
+  dependencies: ReturnType<typeof commandDeps>,
+): Promise<string[]> {
+  const response = await runCommand(
+    () => importModule('../../src/handwritten/package-sync-metadata.query.js'),
+    'inf/normative/src/handwritten/package-sync-metadata.query.ts',
+    SYNC_METADATA_EXPORTS,
+    SYNC_METADATA_METHODS,
+    dependencies,
+  );
+  const packages = (response as { packages?: Array<{ id: string }> }).packages;
+  return (packages ?? []).map((entry) => entry.id);
+}
+
+describe('CTG-0003 §6.3/§6.6 — publish/retire e sync-metadata (C-0003-37…38)', () => {
+  it('C-0003-37 — dado mobile-packages/{id}/publish então sai PACOTE_MOBILE_PUBLICADO e o pacote aparece em GET sync-metadata; após retire, some', async () => {
+    const packageId = await isolatedPackage(
+      client,
+      FIXTURES.tenantId,
+      FIXTURES.catalogActive,
+      { status: 'draft', validUntil: null },
+    );
+    createdPackageIds.push(packageId);
+
+    const dependencies = commandDeps(
+      client,
+      FIXTURES.tenantId,
+      FIXTURES.actorId,
+      {
+        outbox: {
+          append: async (
+            _tx: unknown,
+            envelope: Record<string, unknown>,
+          ): Promise<{ id: string }> => {
+            await client.query(
+              `insert into integration.outbox
+                 (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+               values ($1, $2, $3, $4, $5, $6)
+               on conflict (tenant_id, idempotency_key) do nothing`,
+              [
+                FIXTURES.tenantId,
+                envelope.type,
+                (envelope.aggregate as { kind: string }).kind,
+                (envelope.aggregate as { id: string }).id,
+                JSON.stringify(envelope),
+                `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+              ],
+            );
+            return { id: 'ignored' };
+          },
+        },
+      },
+    );
+
+    const publishCommand = await runCommand(
+      () => importModule('../../src/handwritten/publish-package.command.js'),
+      'inf/normative/src/handwritten/publish-package.command.ts',
+      PUBLISH_EXPORTS,
+      PUBLISH_METHODS_PUBLISH,
+      dependencies,
+      packageId,
+      {},
+    );
+    expect(publishCommand.status).toBe('published');
+
+    const envelopes = await outboxEnvelopes(
+      client,
+      FIXTURES.tenantId,
+      startedAt,
+    );
+    expect(
+      envelopes.some(
+        (envelope) => envelope.domainEvent === 'PACOTE_MOBILE_PUBLICADO',
+      ),
+    ).toBe(true);
+
+    const idsAfterPublish = await syncMetadataPackageIds(dependencies);
+    expect(idsAfterPublish).toContain(packageId);
+
+    await runCommand(
+      () => importModule('../../src/handwritten/publish-package.command.js'),
+      'inf/normative/src/handwritten/publish-package.command.ts',
+      PUBLISH_EXPORTS,
+      PUBLISH_METHODS_RETIRE,
+      dependencies,
+      packageId,
+      {},
+    );
+
+    const idsAfterRetire = await syncMetadataPackageIds(dependencies);
+    expect(idsAfterRetire).not.toContain(packageId);
+  });
+
+  it('C-0003-38 — dado um pacote published com valid_until ontem então GET sync-metadata não o devolve', async () => {
+    const packageId = await isolatedPackage(
+      client,
+      FIXTURES.tenantId,
+      FIXTURES.catalogActive,
+      { status: 'published', validUntil: '2026-09-13' },
+    );
+    createdPackageIds.push(packageId);
+
+    const dependencies = commandDeps(
+      client,
+      FIXTURES.tenantId,
+      FIXTURES.actorId,
+    );
+    const ids = await syncMetadataPackageIds(dependencies);
+    expect(ids).not.toContain(packageId);
+  });
+});
diff --git a/backend/domains/ops/core/src/storage.ts b/backend/domains/ops/core/src/storage.ts
index 061c426..bef1345 100644
--- a/backend/domains/ops/core/src/storage.ts
+++ b/backend/domains/ops/core/src/storage.ts
@@ -7,14 +7,29 @@ export interface EvidenceStoragePort {
     objectKey: string;
     mimeType: string;
     sizeBytes: number;
+    /**
+     * `sha256:<hex>` declarado na intenção (CTG-0003 §4.1). Opcional na
+     * forma fixada por CTG-0002 §4.8; o substrato S3 do STYNX exige o
+     * checksum no `presignUpload`, e é daqui que ele vem.
+     */
+    hashValue?: string;
   }): Promise<{ uploadUrl: string; expiresAt: string }>;
 }

+/** Token da porta de armazenamento de evidência (CTG-0003 §4.1). */
+export const EVIDENCE_STORAGE_PORT: unique symbol = Symbol(
+  'EVIDENCE_STORAGE_PORT',
+);
+
 /** Token multi-provider `{ wsdenatranRead, renach }` (CTG-0003). */
 export const SNAPSHOT_QUERY_PORTS: unique symbol = Symbol(
   'SNAPSHOT_QUERY_PORTS',
 );

+// O token de injeção de `PackageSignerPort` vive em `@detran/inf-normative`
+// (`handwritten/package-signer.ts`), que é quem o consome: `inf/normative` não
+// depende de `@detran/ops-core`. A forma da porta continua declarada aqui,
+// como CTG-0002 §4.8 fixou.
 export interface PackageSignerPort {
   sign(manifestHash: string): Promise<{
     signature: string;
diff --git a/backend/domains/ops/evidence/src/handwritten/access-request.commands.spec.ts b/backend/domains/ops/evidence/src/handwritten/access-request.commands.spec.ts
new file mode 100644
index 0000000..89351cb
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/access-request.commands.spec.ts
@@ -0,0 +1,249 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §4.9/§4.10/§4.11 e §10 (R-0008, TASK-0006) — C-0003-12 e
+ * C-0003-13: `create-access-request.command.ts` e
+ * `decide-access-request.command.ts`/`deliver-access-request.command.ts`
+ * (RN-TEAT-142). Nascem em TASK-0007. Ids das fixtures
+ * (`27-fixtures-teat-evidence.sql`): `…ef400001` (`requested`), `…ef400002`
+ * (`approved`).
+ *
+ * Nomes esperados dos exports: `CreateAccessRequestCommand`,
+ * `DecideAccessRequestCommand`, `DeliverAccessRequestCommand` — construtor
+ * `(deps)`, método `execute`.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const EVIDENCE_BODYCAM = '00000000-0000-7000-8000-0000ef000001';
+const ACCESS_REQUESTED = '00000000-0000-7000-8000-0000ef400001';
+const ACCESS_APPROVED = '00000000-0000-7000-8000-0000ef400002';
+
+/** RN-TEAT-142, art. 13: rol fechado de requerentes legítimos. */
+const REQUESTER_ROLES = [
+  'magistrado',
+  'ministerio-publico',
+  'defensoria-publica',
+  'autoridade-policial',
+  'autoridade-administrativa',
+] as const;
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: {
+      accessRequests: repository([
+        {
+          id: ACCESS_REQUESTED,
+          tenant_id: TENANT_ID,
+          evidence_id: EVIDENCE_BODYCAM,
+          status: 'requested',
+        },
+        {
+          id: ACCESS_APPROVED,
+          tenant_id: TENANT_ID,
+          evidence_id: EVIDENCE_BODYCAM,
+          status: 'approved',
+        },
+      ]),
+      custodyEvents: repository(),
+      ...(overrides.repositories ?? {}),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function loadCommand(
+  specifier: string,
+  file: string,
+  primaryExport: string,
+  dependencies: Deps,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule(specifier)) as Record<string, unknown>;
+  } catch (cause) {
+    throw new Error(
+      `ops/evidence/src/handwritten/${file} ainda não existe (TASK-0007, CTG-0003 §11)`,
+      { cause },
+    );
+  }
+  const exported =
+    (loaded[primaryExport] as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      `${file} não exporta um comando construtível (CTG-0003 §11)`,
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  return new Command(dependencies);
+}
+
+async function invoke(
+  command: Record<string, unknown>,
+  file: string,
+  ...args: unknown[]
+): Promise<Record<string, unknown>> {
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(`${file} não expõe execute|handle|run`);
+  }
+  return (await (method as (...values: unknown[]) => Promise<unknown>).apply(
+    command,
+    args,
+  )) as Record<string, unknown>;
+}
+
+describe('CTG-0003 §4.9 — create-access-request: rol de requerentes (C-0003-12)', () => {
+  it('C-0003-12 — dado evidence-access-requests com requester_role=perito então 422 TEAT.EVIDENCE_ACCESS_REQUESTER_NOT_IN_ROL com context.allowed = os cinco papéis do art. 13', async () => {
+    const dependencies = deps();
+    const command = await loadCommand(
+      './create-access-request.command.js',
+      'create-access-request.command.ts',
+      'CreateAccessRequestCommand',
+      dependencies,
+    );
+    await expect(
+      invoke(command, 'create-access-request.command.ts', {
+        evidence_id: EVIDENCE_BODYCAM,
+        requester_name: 'Perito Fixture',
+        requester_role: 'perito',
+        purpose: 'perícia',
+        investigation_ref: 'INV-0001',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_ACCESS_REQUESTER_NOT_IN_ROL',
+      status: 422,
+      context: expect.objectContaining({
+        requesterRole: 'perito',
+        allowed: expect.arrayContaining([...REQUESTER_ROLES]),
+      }),
+    });
+  });
+
+  it.each(REQUESTER_ROLES)(
+    'dado requester_role=%s (rol do art. 13) então a requisição nasce requested',
+    async (role) => {
+      const dependencies = deps();
+      const command = await loadCommand(
+        './create-access-request.command.js',
+        'create-access-request.command.ts',
+        'CreateAccessRequestCommand',
+        dependencies,
+      );
+      const response = await invoke(
+        command,
+        'create-access-request.command.ts',
+        {
+          evidence_id: EVIDENCE_BODYCAM,
+          requester_name: 'Requerente Fixture',
+          requester_role: role,
+          purpose: 'finalidade declarada',
+          investigation_ref: 'INV-0002',
+        },
+      );
+      expect(response.status).toBe('requested');
+    },
+  );
+});
+
+describe('CTG-0003 §4.10/§4.11 — decide/deliver fora de ordem (C-0003-13)', () => {
+  it('C-0003-13a — dado o pedido …ef400001 (requested) quando deliver então 409 TEAT.EVIDENCE_ACCESS_STATE_INVALID com allowed:[approved]', async () => {
+    const dependencies = deps();
+    const command = await loadCommand(
+      './deliver-access-request.command.js',
+      'deliver-access-request.command.ts',
+      'DeliverAccessRequestCommand',
+      dependencies,
+    );
+    await expect(
+      invoke(command, 'deliver-access-request.command.ts', ACCESS_REQUESTED, {
+        delivery_media_ref: 'DVD-0001',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_ACCESS_STATE_INVALID',
+      status: 409,
+      context: expect.objectContaining({
+        requestId: ACCESS_REQUESTED,
+        currentState: 'requested',
+        allowed: ['approved'],
+      }),
+    });
+  });
+
+  it('C-0003-13b — dado o pedido …ef400002 (approved) quando approve então 409 TEAT.EVIDENCE_ACCESS_STATE_INVALID com allowed:[requested]', async () => {
+    const dependencies = deps();
+    const command = await loadCommand(
+      './decide-access-request.command.js',
+      'decide-access-request.command.ts',
+      'DecideAccessRequestCommand',
+      dependencies,
+    );
+    await expect(
+      invoke(
+        command,
+        'decide-access-request.command.ts',
+        ACCESS_APPROVED,
+        'approve',
+        { legal_basis: 'Art. 13 da Portaria 003/2026' },
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_ACCESS_STATE_INVALID',
+      status: 409,
+      context: expect.objectContaining({
+        requestId: ACCESS_APPROVED,
+        currentState: 'approved',
+        allowed: ['requested'],
+      }),
+    });
+  });
+});
diff --git a/backend/domains/ops/evidence/src/handwritten/add-custody-event.command.spec.ts b/backend/domains/ops/evidence/src/handwritten/add-custody-event.command.spec.ts
new file mode 100644
index 0000000..ccd82e2
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/add-custody-event.command.spec.ts
@@ -0,0 +1,155 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §4.5 e §10 (R-0008, TASK-0006) — C-0003-10: `POST
+ * /v1/ops/evidence/{id}/custody-events`. `handwritten/add-custody-event.command.ts`
+ * nasce em TASK-0007. Nome esperado do export: `AddCustodyEventCommand`,
+ * construtor `(deps)`, método `execute`.
+ *
+ * Canônico (CTG-0003 §11.8): o vocabulário de `event_type` desta rodada tem
+ * onze tokens — `uploaded`, `validated`, `rejected`, `linked`, `packaged`,
+ * `access_approved`, `access_denied`, `access_delivered`,
+ * `purged_unverified`, `quarantined`, `restored` — sem check na coluna; é
+ * vocabulário de modelagem, não token canônico de workflow.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const EVIDENCE_ID = '00000000-0000-7000-8000-0000ef000001';
+
+const CUSTODY_EVENT_TYPES = [
+  'uploaded',
+  'validated',
+  'rejected',
+  'linked',
+  'packaged',
+  'access_approved',
+  'access_denied',
+  'access_delivered',
+  'purged_unverified',
+  'quarantined',
+  'restored',
+] as const;
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: {
+      evidence: repository([
+        { id: EVIDENCE_ID, tenant_id: TENANT_ID, status: 'validated' },
+      ]),
+      custodyEvents: repository(),
+      ...(overrides.repositories ?? {}),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function addCustodyEvent(
+  dependencies: Deps,
+  evidenceId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./add-custody-event.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'ops/evidence/src/handwritten/add-custody-event.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.AddCustodyEventCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'add-custody-event.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'add-custody-event.command.ts não expõe execute|handle|run (CTG-0003 §4.5)',
+    );
+  }
+  return (await (
+    method as (id: string, value: unknown) => Promise<unknown>
+  ).call(command, evidenceId, body)) as Record<string, unknown>;
+}
+
+describe('CTG-0003 §4.5 — custody-events: vocabulário de event_type (C-0003-10)', () => {
+  it('C-0003-10 — dado custody-events com event_type=foo então 422 TEAT.ENUM_INVALID com context.allowed contendo os onze tokens', async () => {
+    const dependencies = deps();
+    await expect(
+      addCustodyEvent(dependencies, EVIDENCE_ID, { event_type: 'foo' }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ENUM_INVALID',
+      status: 422,
+      context: expect.objectContaining({
+        field: 'event_type',
+        allowed: expect.arrayContaining([...CUSTODY_EVENT_TYPES]),
+      }),
+    });
+  });
+
+  it.each(CUSTODY_EVENT_TYPES)(
+    'dado event_type=%s (vocabulário admitido) então o evento é registrado sem exceção',
+    async (eventType) => {
+      const dependencies = deps();
+      const response = await addCustodyEvent(dependencies, EVIDENCE_ID, {
+        event_type: eventType,
+      });
+      expect(response.event_type).toBe(eventType);
+      expect(dependencies.repositories.custodyEvents.rows).toHaveLength(1);
+    },
+  );
+});
diff --git a/backend/domains/ops/evidence/src/handwritten/add-custody-event.command.ts b/backend/domains/ops/evidence/src/handwritten/add-custody-event.command.ts
new file mode 100644
index 0000000..f6ca008
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/add-custody-event.command.ts
@@ -0,0 +1,99 @@
+// CTG-0003 §4.5 e §11.8 (R-0008, TASK-0007) — `POST
+// /v1/ops/evidence/{id}/custody-events`. A cadeia é append-only e registra
+// tudo: nenhum estado é negado. `event_type` é vocabulário de modelagem desta
+// rodada (onze tokens, sem check na coluna), não token canônico de workflow.
+import { DetranError } from '@detran/shared';
+
+import {
+  appendEvent,
+  CUSTODY_EVENT_TYPES,
+  findRow,
+  insertRow,
+  inTenantTransaction,
+  isCustodyEventType,
+  isoOf,
+  nextCustodyVersion,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type EvidenceDeps,
+} from './evidence-runtime.js';
+import { custodyRecordedEvent } from './events.js';
+
+export {
+  CUSTODY_EVENT_TYPES,
+  isCustodyEventType,
+  type CustodyEventType,
+} from './evidence-runtime.js';
+
+export interface AddCustodyEventInput {
+  event_type: string;
+  event_at?: string;
+  user_ref?: string;
+  system_name?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export interface AddCustodyEventResult {
+  id: string;
+  evidence_id: string;
+  event_type: string;
+  event_at: string;
+}
+
+export class AddCustodyEventCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(
+    evidenceId: string,
+    input: AddCustodyEventInput,
+  ): Promise<AddCustodyEventResult> {
+    const eventType = stringOf(input?.event_type ?? '');
+    if (!isCustodyEventType(eventType))
+      throw new DetranError('TEAT.ENUM_INVALID', {
+        status: 422,
+        context: { field: 'event_type', allowed: [...CUSTODY_EVENT_TYPES] },
+        message: 'Tipo de evento de custódia fora do vocabulário.',
+      });
+
+    const scope = scopeOf(this.deps);
+    const eventAt = input.event_at ? isoOf(input.event_at) : scope.occurredAt;
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
+      if (!evidence) throw tenantMismatch({ evidenceId });
+
+      const version = await nextCustodyVersion(this.deps, tx, evidenceId);
+      const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
+        evidence_id: evidenceId,
+        event_type: eventType,
+        event_at: eventAt,
+        user_ref: stringOf(input.user_ref ?? scope.actorId),
+        system_name: stringOf(input.system_name ?? 'detran-backend'),
+        details_json: input.details_json ?? null,
+      });
+
+      await appendEvent(
+        this.deps,
+        tx,
+        custodyRecordedEvent(
+          scope,
+          {
+            evidenceId,
+            custodyEventId: stringOf(custodyEvent.id),
+            eventType,
+            eventAt,
+          },
+          version,
+        ),
+      );
+
+      return {
+        id: stringOf(custodyEvent.id),
+        evidence_id: evidenceId,
+        event_type: eventType,
+        event_at: eventAt,
+      };
+    });
+  }
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/bodycam-projection.spec.ts b/backend/domains/ops/evidence/src/handwritten/bodycam-projection.spec.ts
new file mode 100644
index 0000000..080c3aa
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/bodycam-projection.spec.ts
@@ -0,0 +1,105 @@
+import { describe, expect, it } from 'vitest';
+
+/**
+ * CTG-0003 §4.8 e §10 (R-0008, TASK-0006) — C-0003-14: a regra de projeção de
+ * leitura de bodycam (RN-TEAT-142), aplicada a toda leitura de
+ * `ops.evidence_evidence` e às respostas dos comandos de evidência.
+ * `handwritten/bodycam-projection.ts` nasce em TASK-0007 (CTG-0003 §11 lista
+ * o arquivo `{bodycam-projection,manifest}.ts`).
+ *
+ * Nome esperado do export: função `projectEvidenceForRole` (ou
+ * `projectEvidence`), assinatura `(evidence, hasDeliveredAccess: boolean) =>
+ * evidence projetada`. O carregador tolera qualquer export de função.
+ *
+ * Canônico (CTG-0003 §4.8): `evidence_type='bodycam'` e o principal **sem**
+ * uma `evidence_access_request` `delivered` sua para esta evidência →
+ * `storage_uri`/`location_json` saem `null`; os demais metadados saem
+ * íntegros; qualquer papel (inclusive `AUDITOR`, `technical-admin` e
+ * `field-agent`) recebe a mesma restrição — o critério é "entrega
+ * registrada", não papel.
+ */
+
+const BODYCAM_EVIDENCE = {
+  id: '00000000-0000-7000-8000-0000ef000001',
+  tenant_id: '00000000-0000-7000-8000-00000000a001',
+  traffic_agency_id: '00000000-0000-7000-8000-0000e2000001',
+  evidence_type: 'bodycam',
+  origin: 'campo',
+  storage_uri:
+    'evidence/00000000-0000-7000-8000-00000000a001/00000000-0000-7000-8000-0000ef000001',
+  mime_type: 'video/mp4',
+  size_bytes: 5242880,
+  hash_algorithm: 'sha256',
+  hash_value:
+    'sha256:fb517525e4db0c44027f342617250edf975383e949b8d1fab2670b3120c8b038',
+  captured_at: '2026-09-10T10:00:00-04:00',
+  location_json: { latitude: -3.1019, longitude: -60.025, accuracy_m: 6 },
+  status: 'validated',
+} as const;
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+type Projector = (
+  evidence: Record<string, unknown>,
+  hasDeliveredAccess: boolean,
+) => Record<string, unknown>;
+
+async function loadProjector(): Promise<Projector> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./bodycam-projection.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'ops/evidence/src/handwritten/bodycam-projection.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.projectEvidenceForRole as unknown) ??
+    (loaded.projectEvidence as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'bodycam-projection.ts não exporta uma função de projeção (CTG-0003 §4.8)',
+    );
+  }
+  return exported as Projector;
+}
+
+describe('CTG-0003 §4.8 — projeção de leitura de bodycam (C-0003-14)', () => {
+  it('C-0003-14 — dada a leitura da evidência …ef000001 (bodycam) sem entrega registrada então storage_uri e location_json saem null e os demais metadados saem íntegros', async () => {
+    const project = await loadProjector();
+    const projected = project({ ...BODYCAM_EVIDENCE }, false);
+    expect(projected.storage_uri).toBeNull();
+    expect(projected.location_json).toBeNull();
+    expect(projected.id).toBe(BODYCAM_EVIDENCE.id);
+    expect(projected.evidence_type).toBe('bodycam');
+    expect(projected.status).toBe('validated');
+    expect(projected.hash_value).toBe(BODYCAM_EVIDENCE.hash_value);
+    expect(projected.mime_type).toBe(BODYCAM_EVIDENCE.mime_type);
+    expect(projected.captured_at).toBe(BODYCAM_EVIDENCE.captured_at);
+  });
+
+  it('dado uma entrega registrada (evidence-access-request delivered) então storage_uri e location_json saem íntegros', async () => {
+    const project = await loadProjector();
+    const projected = project({ ...BODYCAM_EVIDENCE }, true);
+    expect(projected.storage_uri).toBe(BODYCAM_EVIDENCE.storage_uri);
+    expect(projected.location_json).toEqual(BODYCAM_EVIDENCE.location_json);
+  });
+
+  it('dado evidence_type diferente de bodycam então a projeção nunca oculta storage_uri/location_json', async () => {
+    const project = await loadProjector();
+    const nonBodycam = {
+      ...BODYCAM_EVIDENCE,
+      id: '00000000-0000-7000-8000-0000ef000003',
+      evidence_type: 'foto',
+    };
+    const projected = project(nonBodycam, false);
+    expect(projected.storage_uri).toBe(nonBodycam.storage_uri);
+    expect(projected.location_json).toEqual(nonBodycam.location_json);
+  });
+});
diff --git a/backend/domains/ops/evidence/src/handwritten/bodycam-projection.ts b/backend/domains/ops/evidence/src/handwritten/bodycam-projection.ts
new file mode 100644
index 0000000..686faa4
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/bodycam-projection.ts
@@ -0,0 +1,40 @@
+// CTG-0003 §4.8 (RN-TEAT-142, R-0008, TASK-0007) — projeção de leitura de
+// bodycam. O critério é "entrega registrada", nunca papel: `AUDITOR`,
+// `technical-admin` e `field-agent` recebem a mesma restrição.
+import type { EvidenceRow } from './evidence-runtime.js';
+
+export const BODYCAM_EVIDENCE_TYPE = 'bodycam';
+
+/** Campos suprimidos enquanto não houver entrega de mídia registrada. */
+export const BODYCAM_RESTRICTED_FIELDS = [
+  'storage_uri',
+  'location_json',
+] as const;
+
+export function projectEvidenceForRole(
+  evidence: EvidenceRow,
+  hasDeliveredAccess: boolean,
+): EvidenceRow {
+  const projected: EvidenceRow = { ...evidence };
+  if (evidence.evidence_type !== BODYCAM_EVIDENCE_TYPE || hasDeliveredAccess)
+    return projected;
+  for (const field of BODYCAM_RESTRICTED_FIELDS) projected[field] = null;
+  return projected;
+}
+
+/**
+ * `ops.evidence_access_request` não guarda o id do principal requerente — só
+ * `requester_name`/`requester_role` e `decided_by_user_ref` (DDL 17). Nesta
+ * rodada a entrega registrada da própria evidência é o que libera o conteúdo;
+ * a amarração "entrega **sua**" da §4.8 depende de coluna que não existe
+ * (registrado no relatório de TASK-0007).
+ */
+export function hasDeliveredAccess(
+  accessRequests: readonly EvidenceRow[],
+  evidenceId: string,
+): boolean {
+  return accessRequests.some(
+    (request) =>
+      request.evidence_id === evidenceId && request.status === 'delivered',
+  );
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/complete-upload.command.spec.ts b/backend/domains/ops/evidence/src/handwritten/complete-upload.command.spec.ts
new file mode 100644
index 0000000..1c33bc7
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/complete-upload.command.spec.ts
@@ -0,0 +1,236 @@
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §4.2 e §10 (R-0008, TASK-0006) — C-0003-06, C-0003-07 e a fração de
+ * `complete-upload` de C-0003-08: `POST
+ * /v1/ops/evidence/{id}/complete-upload` (M11). `handwritten/complete-upload.command.ts`
+ * nasce em TASK-0007. Ids das fixtures: `27-fixtures-teat-evidence.sql`
+ * (`…ef000002` pending_upload + intenção `…ef100001` vencida em
+ * 2026-09-01, `…ef000004` quarantined). Relógio fixo em 2026-09-14 (CTG-0003
+ * §9).
+ *
+ * Nome esperado do export: `CompleteUploadCommand`, construtor `(deps)`,
+ * método `execute`.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const EVIDENCE_PENDING = '00000000-0000-7000-8000-0000ef000002';
+const STORAGE_INTENT_EXPIRED = '00000000-0000-7000-8000-0000ef100001';
+const EVIDENCE_QUARANTINED = '00000000-0000-7000-8000-0000ef000004';
+const NOW = '2026-09-14T14:00:00.000Z';
+const HASH_VALUE =
+  'sha256:531986dca23b52cea07f5b3a736b452efea3ff325033daa19fb218741cb4875d';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: {
+      evidence: repository([
+        {
+          id: EVIDENCE_PENDING,
+          tenant_id: TENANT_ID,
+          status: 'pending_upload',
+          hash_value: HASH_VALUE,
+        },
+        {
+          id: EVIDENCE_QUARANTINED,
+          tenant_id: TENANT_ID,
+          status: 'quarantined',
+          hash_value:
+            'sha256:a8949cf99ae3fc2328f8acf858aefca10282ab574addc442698fed3e9929cc98',
+        },
+      ]),
+      storageIntents: repository([
+        {
+          id: STORAGE_INTENT_EXPIRED,
+          tenant_id: TENANT_ID,
+          evidence_id: EVIDENCE_PENDING,
+          expires_at: '2026-09-01T00:00:00-04:00',
+          status: 'pending',
+        },
+      ]),
+      evidenceLinks: repository(),
+      custodyEvents: repository(),
+      ...(overrides.repositories ?? {}),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function completeUpload(
+  dependencies: Deps,
+  evidenceId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./complete-upload.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'ops/evidence/src/handwritten/complete-upload.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.CompleteUploadCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'complete-upload.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'complete-upload.command.ts não expõe execute|handle|run (CTG-0003 §4.2)',
+    );
+  }
+  return (await (
+    method as (id: string, value: unknown) => Promise<unknown>
+  ).call(command, evidenceId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+describe('CTG-0003 §4.2 — complete-upload: intenção vencida, hash divergente e quarentena (C-0003-06…08)', () => {
+  it('C-0003-06 — dada a evidência …ef000002 com a intenção …ef100001 expirada quando complete-upload então 410 TEAT.EVIDENCE_INTENT_EXPIRED com { storageIntentId, expiresAt }, relógio fixo em 2026-09-14', async () => {
+    const dependencies = deps();
+    await expect(
+      completeUpload(dependencies, EVIDENCE_PENDING, {
+        storage_intent_id: STORAGE_INTENT_EXPIRED,
+        idempotency_key: 'complete-001',
+        entity_type: 'ait',
+        entity_id: '00000000-0000-7000-8000-0000f0000001',
+        accepted_hash: HASH_VALUE,
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_INTENT_EXPIRED',
+      status: 410,
+      context: expect.objectContaining({
+        storageIntentId: STORAGE_INTENT_EXPIRED,
+        expiresAt: expect.any(String),
+      }),
+    });
+  });
+
+  it('C-0003-07 — dado complete-upload com accepted_hash ≠ hash_value então 422 TEAT.EVIDENCE_HASH_MISMATCH com { declaredHash, acceptedHash }', async () => {
+    const dependencies = deps({
+      repositories: {
+        evidence: repository([
+          {
+            id: EVIDENCE_PENDING,
+            tenant_id: TENANT_ID,
+            status: 'pending_upload',
+            hash_value: HASH_VALUE,
+          },
+        ]),
+        storageIntents: repository([
+          {
+            id: STORAGE_INTENT_EXPIRED,
+            tenant_id: TENANT_ID,
+            evidence_id: EVIDENCE_PENDING,
+            expires_at: '2027-01-01T00:00:00-04:00',
+            status: 'pending',
+          },
+        ]),
+        evidenceLinks: repository(),
+        custodyEvents: repository(),
+      },
+    });
+    await expect(
+      completeUpload(dependencies, EVIDENCE_PENDING, {
+        storage_intent_id: STORAGE_INTENT_EXPIRED,
+        idempotency_key: 'complete-002',
+        entity_type: 'ait',
+        entity_id: '00000000-0000-7000-8000-0000f0000001',
+        accepted_hash:
+          'sha256:1111111111111111111111111111111111111111111111111111111111111111',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_HASH_MISMATCH',
+      status: 422,
+      context: expect.objectContaining({
+        declaredHash: HASH_VALUE,
+        acceptedHash: expect.any(String),
+      }),
+    });
+  });
+
+  it('C-0003-08a — dada a evidência …ef000004 (quarantined) quando complete-upload então 409 TEAT.EVIDENCE_QUARANTINED, e esse código precede a guarda de estado', async () => {
+    const dependencies = deps();
+    await expect(
+      completeUpload(dependencies, EVIDENCE_QUARANTINED, {
+        storage_intent_id: STORAGE_INTENT_EXPIRED,
+        idempotency_key: 'complete-003',
+        entity_type: 'ait',
+        entity_id: '00000000-0000-7000-8000-0000f0000001',
+        accepted_hash:
+          'sha256:a8949cf99ae3fc2328f8acf858aefca10282ab574addc442698fed3e9929cc98',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_QUARANTINED',
+      status: 409,
+    });
+  });
+});
diff --git a/backend/domains/ops/evidence/src/handwritten/complete-upload.command.ts b/backend/domains/ops/evidence/src/handwritten/complete-upload.command.ts
new file mode 100644
index 0000000..bdbca0a
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/complete-upload.command.ts
@@ -0,0 +1,157 @@
+// CTG-0003 §4.2 (M11, R-0008, TASK-0007) — `POST /v1/ops/evidence/{id}/complete-upload`.
+//
+// Uma transação: `evidence` passa a `uploaded`, a intenção fecha, a cadeia de
+// custódia ganha `uploaded` e o vínculo com a entidade nasce. Precedência das
+// guardas: quarentena → intenção vencida → hash → estado (§4.2, C-0003-06…08).
+import { DetranError } from '@detran/shared';
+
+import {
+  appendEvent,
+  findRow,
+  insertRow,
+  inTenantTransaction,
+  isoOf,
+  patchRow,
+  quarantined,
+  scopeOf,
+  stateTransitionFailed,
+  stringOf,
+  tenantMismatch,
+  validationFailed,
+  type EvidenceDeps,
+} from './evidence-runtime.js';
+import { evidenceCapturedEvent, evidenceLinkedEvent } from './events.js';
+
+export interface CompleteUploadInput {
+  storage_intent_id: string;
+  idempotency_key: string;
+  entity_type: string;
+  entity_id: string;
+  accepted_hash: string;
+}
+
+export interface CompleteUploadResult {
+  id: string;
+  status: 'uploaded';
+  storage_uri: string;
+  link_id: string;
+  custody_event_id: string;
+}
+
+export class CompleteUploadCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(
+    evidenceId: string,
+    input: CompleteUploadInput,
+  ): Promise<CompleteUploadResult> {
+    const scope = scopeOf(this.deps);
+    const acceptedHash = stringOf(input?.accepted_hash ?? '').trim();
+    const storageIntentId = stringOf(input?.storage_intent_id ?? '').trim();
+    if (!acceptedHash || !storageIntentId)
+      throw validationFailed([
+        ...(acceptedHash ? [] : [{ path: 'accepted_hash', rule: 'required' }]),
+        ...(storageIntentId
+          ? []
+          : [{ path: 'storage_intent_id', rule: 'required' }]),
+      ]);
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
+      if (!evidence) throw tenantMismatch({ evidenceId });
+      if (evidence.status === 'quarantined') throw quarantined(evidenceId);
+
+      const intent = await findRow(
+        this.deps,
+        tx,
+        'storageIntents',
+        storageIntentId,
+      );
+      if (!intent) throw tenantMismatch({ storageIntentId });
+      const expiresAt = isoOf(intent.expires_at);
+      if (new Date(expiresAt).getTime() < new Date(scope.occurredAt).getTime())
+        throw new DetranError('TEAT.EVIDENCE_INTENT_EXPIRED', {
+          status: 410,
+          context: { storageIntentId, expiresAt },
+          message: 'Intenção de upload vencida; renove mantendo o mesmo id.',
+        });
+
+      const declaredHash = stringOf(evidence.hash_value);
+      if (declaredHash !== acceptedHash)
+        throw new DetranError('TEAT.EVIDENCE_HASH_MISMATCH', {
+          status: 422,
+          context: { declaredHash, acceptedHash },
+          message: 'O hash aceito não confere com o declarado na intenção.',
+        });
+
+      if (evidence.status !== 'pending_upload') throw stateTransitionFailed();
+
+      const objectKey = stringOf(intent.object_key || evidence.storage_uri);
+      await patchRow(this.deps, tx, 'evidence', evidenceId, {
+        status: 'uploaded',
+        storage_uri: objectKey,
+      });
+      await patchRow(this.deps, tx, 'storageIntents', storageIntentId, {
+        status: 'completed',
+        accepted_hash: acceptedHash,
+      });
+
+      const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
+        evidence_id: evidenceId,
+        event_type: 'uploaded',
+        event_at: scope.occurredAt,
+        user_ref: scope.actorId,
+        system_name: 'detran-backend',
+        details_json: { storageIntentId, acceptedHash },
+      });
+
+      const role = stringOf(evidence.evidence_type);
+      const link = await insertRow(this.deps, tx, 'evidenceLinks', {
+        evidence_id: evidenceId,
+        entity_type: stringOf(input.entity_type),
+        entity_id: stringOf(input.entity_id),
+        role,
+        mandatory: false,
+      });
+
+      await appendEvent(
+        this.deps,
+        tx,
+        evidenceCapturedEvent(scope, {
+          evidenceId,
+          entityType: stringOf(input.entity_type),
+          entityId: stringOf(input.entity_id),
+          evidenceType: role,
+          hashValue: declaredHash,
+          capturedAt: evidence.captured_at ? isoOf(evidence.captured_at) : null,
+          uploadedAt: scope.occurredAt,
+        }),
+      );
+      await appendEvent(
+        this.deps,
+        tx,
+        evidenceLinkedEvent(
+          scope,
+          {
+            evidenceId,
+            linkId: stringOf(link.id),
+            entityType: stringOf(input.entity_type),
+            entityId: stringOf(input.entity_id),
+            role,
+          },
+          // Segundo fato do mesmo agregado nesta transação: versão 2, senão o
+          // envelope colide com `EVIDENCIA_CAPTURADA` na chave da outbox.
+          2,
+        ),
+      );
+
+      return {
+        id: evidenceId,
+        status: 'uploaded',
+        storage_uri: objectKey,
+        link_id: stringOf(link.id),
+        custody_event_id: stringOf(custodyEvent.id),
+      };
+    });
+  }
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/create-access-request.command.ts b/backend/domains/ops/evidence/src/handwritten/create-access-request.command.ts
new file mode 100644
index 0000000..82f2476
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/create-access-request.command.ts
@@ -0,0 +1,85 @@
+// CTG-0003 §4.9 (RN-TEAT-142, R-0008, TASK-0007) — `POST
+// /v1/ops/evidence-access-requests`. O rol do art. 13 é fechado e é o mesmo
+// do check `ck_ops_evidence_access_requester_role` (DDL 17). Sem token em §8,
+// nada é publicado (§11.7): o efeito observável é a linha `requested`.
+import { DetranError } from '@detran/shared';
+
+import {
+  insertRow,
+  inTenantTransaction,
+  isEvidenceAccessRequesterRole,
+  requesterNotInRol,
+  stringOf,
+  validationFailed,
+  type EvidenceDeps,
+} from './evidence-runtime.js';
+
+export {
+  EVIDENCE_ACCESS_REQUESTER_ROLES,
+  isEvidenceAccessRequesterRole,
+  requesterNotInRol,
+  type EvidenceAccessRequesterRole,
+} from './evidence-runtime.js';
+
+export interface CreateAccessRequestInput {
+  evidence_id: string;
+  requester_name: string;
+  requester_role: string;
+  purpose: string;
+  investigation_ref: string;
+  legal_basis?: string;
+}
+
+export interface CreateAccessRequestResult {
+  id: string;
+  evidence_id: string;
+  status: 'requested';
+  requester_role: string;
+  investigation_ref: string;
+}
+
+export class CreateAccessRequestCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(
+    input: CreateAccessRequestInput,
+  ): Promise<CreateAccessRequestResult> {
+    const requesterRole = stringOf(input?.requester_role ?? '');
+    if (!isEvidenceAccessRequesterRole(requesterRole))
+      throw requesterNotInRol(requesterRole);
+
+    const evidenceId = stringOf(input?.evidence_id ?? '').trim();
+    const requesterName = stringOf(input?.requester_name ?? '').trim();
+    const purpose = stringOf(input?.purpose ?? '').trim();
+    const investigationRef = stringOf(input?.investigation_ref ?? '').trim();
+    const fields = [
+      ...(evidenceId ? [] : [{ path: 'evidence_id', rule: 'required' }]),
+      ...(requesterName ? [] : [{ path: 'requester_name', rule: 'required' }]),
+      // A Portaria vincula o uso à finalidade da requisição (RN-TEAT-142).
+      ...(purpose ? [] : [{ path: 'purpose', rule: 'required' }]),
+      ...(investigationRef
+        ? []
+        : [{ path: 'investigation_ref', rule: 'required' }]),
+    ];
+    if (fields.length > 0) throw validationFailed(fields);
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const created = await insertRow(this.deps, tx, 'accessRequests', {
+        evidence_id: evidenceId,
+        requester_name: requesterName,
+        requester_role: requesterRole,
+        investigation_ref: investigationRef,
+        purpose,
+        legal_basis: input.legal_basis ?? null,
+        status: 'requested',
+      });
+      return {
+        id: stringOf(created.id),
+        evidence_id: evidenceId,
+        status: 'requested',
+        requester_role: requesterRole,
+        investigation_ref: investigationRef,
+      };
+    });
+  }
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/decide-access-request.command.ts b/backend/domains/ops/evidence/src/handwritten/decide-access-request.command.ts
new file mode 100644
index 0000000..51859d6
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/decide-access-request.command.ts
@@ -0,0 +1,100 @@
+// CTG-0003 §4.10 (RN-TEAT-142, R-0008, TASK-0007) — `POST
+// /v1/ops/evidence-access-requests/{id}/approve` e `.../deny`. Só de
+// `requested`; a autorização é motivada, então `approve` exige `legal_basis`.
+// Nenhum evento de domínio (§11.7).
+import { DetranError } from '@detran/shared';
+
+import {
+  findRow,
+  insertRow,
+  inTenantTransaction,
+  nextCustodyVersion,
+  patchRow,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  validationFailed,
+  type EvidenceDeps,
+} from './evidence-runtime.js';
+
+export type AccessDecision = 'approve' | 'deny';
+
+const STATUS_BY_DECISION: Record<AccessDecision, 'approved' | 'denied'> = {
+  approve: 'approved',
+  deny: 'denied',
+};
+
+const CUSTODY_EVENT_BY_DECISION: Record<
+  AccessDecision,
+  'access_approved' | 'access_denied'
+> = {
+  approve: 'access_approved',
+  deny: 'access_denied',
+};
+
+export interface DecideAccessRequestInput {
+  user_ref?: string;
+  legal_basis?: string;
+  reason?: string;
+}
+
+export interface DecideAccessRequestResult {
+  id: string;
+  status: 'approved' | 'denied';
+  decided_by_user_ref: string;
+}
+
+export class DecideAccessRequestCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(
+    requestId: string,
+    decision: AccessDecision,
+    input: DecideAccessRequestInput = {},
+  ): Promise<DecideAccessRequestResult> {
+    if (decision !== 'approve' && decision !== 'deny')
+      throw validationFailed([{ path: 'decision', rule: 'enum' }]);
+    const scope = scopeOf(this.deps);
+    const decidedBy = stringOf(input.user_ref ?? scope.actorId);
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const request = await findRow(this.deps, tx, 'accessRequests', requestId);
+      if (!request) throw tenantMismatch({ requestId });
+      const currentState = stringOf(request.status);
+      if (currentState !== 'requested')
+        throw new DetranError('TEAT.EVIDENCE_ACCESS_STATE_INVALID', {
+          status: 409,
+          context: { requestId, currentState, allowed: ['requested'] },
+          message: 'Requisição de acesso fora do estado admitido.',
+        });
+      if (decision === 'approve' && !stringOf(input.legal_basis ?? '').trim())
+        throw validationFailed([{ path: 'legal_basis', rule: 'required' }]);
+
+      const status = STATUS_BY_DECISION[decision];
+      await patchRow(this.deps, tx, 'accessRequests', requestId, {
+        status,
+        decided_by_user_ref: decidedBy,
+        ...(decision === 'approve'
+          ? { legal_basis: stringOf(input.legal_basis) }
+          : {}),
+      });
+
+      const evidenceId = stringOf(request.evidence_id);
+      const version = await nextCustodyVersion(this.deps, tx, evidenceId);
+      await insertRow(this.deps, tx, 'custodyEvents', {
+        evidence_id: evidenceId,
+        event_type: CUSTODY_EVENT_BY_DECISION[decision],
+        event_at: scope.occurredAt,
+        user_ref: decidedBy,
+        system_name: 'detran-backend',
+        details_json: {
+          accessRequestId: requestId,
+          reason: input.reason ?? null,
+          version,
+        },
+      });
+
+      return { id: requestId, status, decided_by_user_ref: decidedBy };
+    });
+  }
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/deliver-access-request.command.ts b/backend/domains/ops/evidence/src/handwritten/deliver-access-request.command.ts
new file mode 100644
index 0000000..45f3314
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/deliver-access-request.command.ts
@@ -0,0 +1,117 @@
+// CTG-0003 §4.11 (RN-TEAT-142, R-0008, TASK-0007) — `POST
+// /v1/ops/evidence-access-requests/{id}/deliver`. Só de `approved`;
+// `delivery_media_ref` e `delivered_at` andam juntos (check
+// `ck_ops_evidence_access_delivered_complete`). A entrega **é** evento de
+// custódia: é a única da família de acesso com token em §8.
+import { DetranError } from '@detran/shared';
+
+import {
+  appendEvent,
+  findRow,
+  insertRow,
+  inTenantTransaction,
+  isEvidenceAccessRequesterRole,
+  nextCustodyVersion,
+  patchRow,
+  requesterNotInRol,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  validationFailed,
+  type EvidenceDeps,
+} from './evidence-runtime.js';
+import { accessDeliveredEvent } from './events.js';
+
+export interface DeliverAccessRequestInput {
+  delivery_media_ref: string;
+  user_ref?: string;
+}
+
+export interface DeliverAccessRequestResult {
+  id: string;
+  status: 'delivered';
+  delivery_media_ref: string;
+  delivered_at: string;
+  custody_event_id: string;
+}
+
+export class DeliverAccessRequestCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(
+    requestId: string,
+    input: DeliverAccessRequestInput,
+  ): Promise<DeliverAccessRequestResult> {
+    const scope = scopeOf(this.deps);
+    const deliveryMediaRef = stringOf(input?.delivery_media_ref ?? '').trim();
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const request = await findRow(this.deps, tx, 'accessRequests', requestId);
+      if (!request) throw tenantMismatch({ requestId });
+      const currentState = stringOf(request.status);
+      if (currentState !== 'approved')
+        throw new DetranError('TEAT.EVIDENCE_ACCESS_STATE_INVALID', {
+          status: 409,
+          context: { requestId, currentState, allowed: ['approved'] },
+          message: 'Entrega só é possível sobre requisição aprovada.',
+        });
+      if (!deliveryMediaRef)
+        throw validationFailed([
+          { path: 'delivery_media_ref', rule: 'required' },
+        ]);
+
+      await patchRow(this.deps, tx, 'accessRequests', requestId, {
+        status: 'delivered',
+        delivery_media_ref: deliveryMediaRef,
+        delivered_at: scope.occurredAt,
+      });
+
+      const evidenceId = stringOf(request.evidence_id);
+      // O check da DDL 17 fecha o rol; se a linha o violar, a entrega não
+      // pode seguir com um papel fora do art. 13.
+      const requesterRole = stringOf(request.requester_role);
+      if (!isEvidenceAccessRequesterRole(requesterRole))
+        throw requesterNotInRol(requesterRole);
+      const investigationRef = stringOf(request.investigation_ref);
+      const version = await nextCustodyVersion(this.deps, tx, evidenceId);
+      const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
+        evidence_id: evidenceId,
+        event_type: 'access_delivered',
+        event_at: scope.occurredAt,
+        user_ref: stringOf(input.user_ref ?? scope.actorId),
+        system_name: 'detran-backend',
+        details_json: {
+          accessRequestId: requestId,
+          deliveryMediaRef,
+          requesterRole,
+          investigationRef,
+        },
+      });
+
+      await appendEvent(
+        this.deps,
+        tx,
+        accessDeliveredEvent(
+          scope,
+          {
+            evidenceId,
+            accessRequestId: requestId,
+            custodyEventId: stringOf(custodyEvent.id),
+            eventType: 'access_delivered',
+            requesterRole,
+            eventAt: scope.occurredAt,
+          },
+          version,
+        ),
+      );
+
+      return {
+        id: requestId,
+        status: 'delivered',
+        delivery_media_ref: deliveryMediaRef,
+        delivered_at: scope.occurredAt,
+        custody_event_id: stringOf(custodyEvent.id),
+      };
+    });
+  }
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/events.ts b/backend/domains/ops/evidence/src/handwritten/events.ts
new file mode 100644
index 0000000..67d7377
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/events.ts
@@ -0,0 +1,237 @@
+// CTG-0003 §8 (M16, R-0008, TASK-0007) — envelopes dos eventos de evidência,
+// custódia e pacote probatório, e os esquemas zod que os descrevem.
+//
+// `type` técnico + `domainEvent` canônico do route contract §8
+// (`rait-events-sse-contract.md` §1); `id` é sempre da outbox (CTG-0001 §13
+// item 5). Nenhum efeito sem token em §8 publica evento (§11.7 / OD-T21).
+//
+// Molde: `backend/domains/inf/ait/src/handwritten/events.ts` —
+// `additionalProperties: false` ⇒ `strictObject`. Diferença do molde: neste
+// grupo **nem `type` nem `domainEvent` são chave única** (`evidence.changed`
+// cobre dois `domainEvent`; `CUSTODIA_EVENTO` sai por dois `type`), então o
+// mapa é chaveado pelo par `<type>:<domainEvent>`.
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+import { teatEnvelope } from '@detran/ops-core';
+import type { TeatEventEnvelope } from '@detran/shared';
+
+import {
+  CUSTODY_EVENT_TYPES,
+  EVIDENCE_ACCESS_REQUESTER_ROLES,
+  type EvidenceScope,
+} from './evidence-runtime.js';
+
+const actor = z.strictObject({
+  kind: z.enum(['user', 'system', 'timer']),
+  id: z.string(),
+  role: z.string().optional(),
+});
+
+function envelopeSchema<Data extends ZodType>(
+  type: string,
+  domainEvent: string,
+  aggregateKind: string,
+  data: Data,
+) {
+  return z.strictObject({
+    id: z.string(),
+    type: z.literal(type),
+    domainEvent: z.literal(domainEvent),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.string(),
+    actor,
+    correlationId: z.string(),
+    causationId: z.string().optional(),
+    aggregate: z.strictObject({
+      kind: z.literal(aggregateKind),
+      id: z.string(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+const evidenciaCapturada = envelopeSchema(
+  'evidence.changed',
+  'EVIDENCIA_CAPTURADA',
+  'evidence',
+  z.strictObject({
+    evidenceId: z.string(),
+    entityType: z.string(),
+    entityId: z.string(),
+    evidenceType: z.string(),
+    hashValue: z.string(),
+    capturedAt: z.string().nullable(),
+    uploadedAt: z.iso.datetime(),
+  }),
+);
+
+const evidenciaVinculada = envelopeSchema(
+  'evidence.changed',
+  'EVIDENCIA_VINCULADA',
+  'evidence',
+  z.strictObject({
+    evidenceId: z.string(),
+    linkId: z.string(),
+    entityType: z.string(),
+    entityId: z.string(),
+    role: z.string(),
+    mandatory: z.boolean().optional(),
+  }),
+);
+
+const custodiaEvento = envelopeSchema(
+  'custody.event',
+  'CUSTODIA_EVENTO',
+  'evidence',
+  z.strictObject({
+    evidenceId: z.string(),
+    custodyEventId: z.string(),
+    eventType: z.enum(CUSTODY_EVENT_TYPES),
+    eventAt: z.string(),
+  }),
+);
+
+const custodiaEventoAcesso = envelopeSchema(
+  'evidence.access-request.changed',
+  'CUSTODIA_EVENTO',
+  'evidence',
+  z.strictObject({
+    evidenceId: z.string(),
+    accessRequestId: z.string(),
+    custodyEventId: z.string(),
+    eventType: z.literal('access_delivered'),
+    requesterRole: z.enum(EVIDENCE_ACCESS_REQUESTER_ROLES),
+    eventAt: z.iso.datetime(),
+  }),
+);
+
+const pacoteProbatorioGerado = envelopeSchema(
+  'probative-package.generated',
+  'PACOTE_PROBATORIO_GERADO',
+  'probative-package',
+  z.strictObject({
+    packageId: z.string(),
+    entityType: z.string(),
+    entityId: z.string(),
+    purpose: z.string(),
+    manifestHash: z.string(),
+    itemCount: z.int().min(1),
+  }),
+);
+
+/** Os cinco envelopes do grupo, por `<type>:<domainEvent>` (CTG-0003 §8). */
+export interface EvidenceEventSchemas extends Record<string, ZodType> {
+  'evidence.changed:EVIDENCIA_CAPTURADA': ZodType;
+  'evidence.changed:EVIDENCIA_VINCULADA': ZodType;
+  'custody.event:CUSTODIA_EVENTO': ZodType;
+  'evidence.access-request.changed:CUSTODIA_EVENTO': ZodType;
+  'probative-package.generated:PACOTE_PROBATORIO_GERADO': ZodType;
+}
+
+export const EVIDENCE_EVENT_SCHEMAS: EvidenceEventSchemas = {
+  'evidence.changed:EVIDENCIA_CAPTURADA': evidenciaCapturada,
+  'evidence.changed:EVIDENCIA_VINCULADA': evidenciaVinculada,
+  'custody.event:CUSTODIA_EVENTO': custodiaEvento,
+  'evidence.access-request.changed:CUSTODIA_EVENTO': custodiaEventoAcesso,
+  'probative-package.generated:PACOTE_PROBATORIO_GERADO':
+    pacoteProbatorioGerado,
+};
+
+export type EvidenceCapturedData = z.infer<typeof evidenciaCapturada>['data'];
+export type EvidenceLinkedData = z.infer<typeof evidenciaVinculada>['data'];
+export type CustodyEventData = z.infer<typeof custodiaEvento>['data'];
+export type AccessDeliveredData = z.infer<typeof custodiaEventoAcesso>['data'];
+export type ProbativePackageGeneratedData = z.infer<
+  typeof pacoteProbatorioGerado
+>['data'];
+
+/**
+ * `outboxIdempotencyKey` é `<type>:<aggregate.id>:<aggregate.version>`
+ * (CTG-0001 §2): dois fatos distintos do mesmo agregado precisam de versões
+ * distintas, senão o segundo envelope some no `on conflict do nothing` da
+ * outbox. Por isso a versão é sempre a ordem do fato dentro do agregado
+ * (OD-T58, ratificada na adenda §13).
+ */
+function aggregateOf(kind: string, id: string, version = 1) {
+  return { kind, id, version };
+}
+
+export function evidenceCapturedEvent(
+  scope: EvidenceScope,
+  data: EvidenceCapturedData,
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: 'evidence.changed',
+    domainEvent: 'EVIDENCIA_CAPTURADA',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: aggregateOf('evidence', data.evidenceId),
+    data: { ...data },
+  });
+}
+
+export function evidenceLinkedEvent(
+  scope: EvidenceScope,
+  data: EvidenceLinkedData,
+  version = 1,
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: 'evidence.changed',
+    domainEvent: 'EVIDENCIA_VINCULADA',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: aggregateOf('evidence', data.evidenceId, version),
+    data: { ...data },
+  });
+}
+
+export function custodyRecordedEvent(
+  scope: EvidenceScope,
+  data: CustodyEventData,
+  version = 1,
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: 'custody.event',
+    domainEvent: 'CUSTODIA_EVENTO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: aggregateOf('evidence', data.evidenceId, version),
+    data: { ...data },
+  });
+}
+
+export function accessDeliveredEvent(
+  scope: EvidenceScope,
+  data: AccessDeliveredData,
+  version = 1,
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: 'evidence.access-request.changed',
+    domainEvent: 'CUSTODIA_EVENTO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: aggregateOf('evidence', data.evidenceId, version),
+    data: { ...data },
+  });
+}
+
+export function probativePackageGeneratedEvent(
+  scope: EvidenceScope,
+  data: ProbativePackageGeneratedData,
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: 'probative-package.generated',
+    domainEvent: 'PACOTE_PROBATORIO_GERADO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: aggregateOf('probative-package', data.packageId),
+    data: { ...data },
+  });
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/evidence-access.controller.ts b/backend/domains/ops/evidence/src/handwritten/evidence-access.controller.ts
new file mode 100644
index 0000000..3787df6
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/evidence-access.controller.ts
@@ -0,0 +1,59 @@
+// CTG-0003 §4.9…§4.11 (RN-TEAT-142, R-0008, TASK-0007) — `POST
+// /v1/ops/evidence-access-requests` e as três decisões. A rota do route
+// contract §4.4 é irmã de `evidence`, não filha (§4).
+import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+
+import type { CreateAccessRequestInput } from './create-access-request.command.js';
+import type { DecideAccessRequestInput } from './decide-access-request.command.js';
+import type { DeliverAccessRequestInput } from './deliver-access-request.command.js';
+import { EvidenceCommandsService } from './evidence-commands.service.js';
+
+@Controller('v1/ops/evidence-access-requests')
+@Resource('ops:evidence-access-request')
+export class EvidenceAccessController {
+  constructor(private readonly commands: EvidenceCommandsService) {}
+
+  @Post()
+  @Action('create')
+  @Audit({
+    action: 'OPS_EVIDENCE_ACCESS_REQUEST',
+    entity: 'ops.evidence_access_request',
+  })
+  create(@Body() body: CreateAccessRequestInput) {
+    return this.commands.requestAccess(body);
+  }
+
+  @Post(':id/approve')
+  @HttpCode(200)
+  @Action('approve')
+  @Audit({
+    action: 'OPS_EVIDENCE_ACCESS_APPROVE',
+    entity: 'ops.evidence_access_request',
+  })
+  approve(@Param('id') id: string, @Body() body: DecideAccessRequestInput) {
+    return this.commands.decideAccess(id, 'approve', body ?? {});
+  }
+
+  @Post(':id/deny')
+  @HttpCode(200)
+  @Action('deny')
+  @Audit({
+    action: 'OPS_EVIDENCE_ACCESS_DENY',
+    entity: 'ops.evidence_access_request',
+  })
+  deny(@Param('id') id: string, @Body() body: DecideAccessRequestInput) {
+    return this.commands.decideAccess(id, 'deny', body ?? {});
+  }
+
+  @Post(':id/deliver')
+  @HttpCode(200)
+  @Action('deliver')
+  @Audit({
+    action: 'OPS_EVIDENCE_ACCESS_DELIVER',
+    entity: 'ops.evidence_access_request',
+  })
+  deliver(@Param('id') id: string, @Body() body: DeliverAccessRequestInput) {
+    return this.commands.deliverAccess(id, body);
+  }
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/evidence-commands.provider.ts b/backend/domains/ops/evidence/src/handwritten/evidence-commands.provider.ts
new file mode 100644
index 0000000..10cb042
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/evidence-commands.provider.ts
@@ -0,0 +1,46 @@
+// CTG-0003 §4 e §11 (R-0008, TASK-0007) — composição de `EvidenceCommandsService`
+// no módulo gerado.
+//
+// `repositories` fica vazio de propósito: no caminho de produção toda leitura
+// e toda escrita acontecem **na transação do comando** (SQL parametrizado sob
+// `withTenantContext`, role `app`, RLS na volta), que é o que o invariante
+// "mesma transação" da §4.2 exige. A porta `EvidenceRowStore` existe para os
+// dublês dos tiers `unit` e `integration`, que provam a guarda sem abrir uma
+// transação de domínio.
+import {
+  APPLIED_ENTITY_PORTS,
+  EVIDENCE_STORAGE_PORT,
+  systemOpsClock,
+  type AppliedEntityPort,
+  type EvidenceStoragePort,
+} from '@detran/ops-core';
+import { SqlTeatEventOutbox } from '@detran/shared';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+
+import { EvidenceCommandsService } from './evidence-commands.service.js';
+
+export const EVIDENCE_COMMANDS_PROVIDER = {
+  provide: EvidenceCommandsService,
+  inject: [
+    Database,
+    RequestContext,
+    { token: APPLIED_ENTITY_PORTS, optional: true },
+    { token: EVIDENCE_STORAGE_PORT, optional: true },
+  ],
+  useFactory: (
+    database: Database,
+    requestContext: RequestContext,
+    appliedEntityPorts?: readonly AppliedEntityPort[],
+    evidenceStorage?: EvidenceStoragePort,
+  ): EvidenceCommandsService =>
+    new EvidenceCommandsService({
+      database,
+      requestContext,
+      repositories: {},
+      appliedEntityPorts: appliedEntityPorts ?? [],
+      evidenceStorage,
+      outbox: new SqlTeatEventOutbox(),
+      clock: systemOpsClock,
+    }),
+};
diff --git a/backend/domains/ops/evidence/src/handwritten/evidence-commands.service.ts b/backend/domains/ops/evidence/src/handwritten/evidence-commands.service.ts
new file mode 100644
index 0000000..eae3d60
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/evidence-commands.service.ts
@@ -0,0 +1,183 @@
+// CTG-0003 §4 (M11, R-0008, TASK-0007) — fachada dos comandos manuscritos de
+// evidência e custódia usada pelos dois controladores. Cada comando é uma
+// classe própria (`src/handwritten/*.command.ts`, CTG-0002 §13.3); aqui só
+// mora a composição e a leitura projetada da §4.8.
+import {
+  AddCustodyEventCommand,
+  type AddCustodyEventInput,
+  type AddCustodyEventResult,
+} from './add-custody-event.command.js';
+import {
+  hasDeliveredAccess,
+  projectEvidenceForRole,
+} from './bodycam-projection.js';
+import {
+  CompleteUploadCommand,
+  type CompleteUploadInput,
+  type CompleteUploadResult,
+} from './complete-upload.command.js';
+import {
+  CreateAccessRequestCommand,
+  type CreateAccessRequestInput,
+  type CreateAccessRequestResult,
+} from './create-access-request.command.js';
+import {
+  DecideAccessRequestCommand,
+  type AccessDecision,
+  type DecideAccessRequestInput,
+  type DecideAccessRequestResult,
+} from './decide-access-request.command.js';
+import {
+  DeliverAccessRequestCommand,
+  type DeliverAccessRequestInput,
+  type DeliverAccessRequestResult,
+} from './deliver-access-request.command.js';
+import {
+  inTenantTransaction,
+  findRow,
+  listRows,
+  stringOf,
+  tenantMismatch,
+  type EvidenceDeps,
+  type EvidenceRow,
+} from './evidence-runtime.js';
+import {
+  GenerateProbativePackageCommand,
+  type GenerateProbativePackageInput,
+  type GenerateProbativePackageResult,
+} from './generate-probative-package.command.js';
+import {
+  InitiateUploadCommand,
+  type InitiateUploadInput,
+  type InitiateUploadResult,
+} from './initiate-upload.command.js';
+import {
+  LinkEvidenceCommand,
+  type LinkEvidenceInput,
+  type LinkEvidenceResult,
+} from './link-evidence.command.js';
+import {
+  PurgeUnverifiedCommand,
+  type PurgeUnverifiedInput,
+  type PurgeUnverifiedResult,
+} from './purge-unverified.command.js';
+import {
+  ValidateEvidenceCommand,
+  type ValidateEvidenceInput,
+  type ValidateEvidenceResult,
+} from './validate-evidence.command.js';
+
+export class EvidenceCommandsService {
+  private readonly initiateUpload: InitiateUploadCommand;
+  private readonly completeUpload: CompleteUploadCommand;
+  private readonly validateEvidence: ValidateEvidenceCommand;
+  private readonly linkEvidence: LinkEvidenceCommand;
+  private readonly addCustodyEvent: AddCustodyEventCommand;
+  private readonly generatePackage: GenerateProbativePackageCommand;
+  private readonly purgeUnverified: PurgeUnverifiedCommand;
+  private readonly createAccessRequest: CreateAccessRequestCommand;
+  private readonly decideAccessRequest: DecideAccessRequestCommand;
+  private readonly deliverAccessRequest: DeliverAccessRequestCommand;
+
+  constructor(private readonly deps: EvidenceDeps) {
+    this.initiateUpload = new InitiateUploadCommand(deps);
+    this.completeUpload = new CompleteUploadCommand(deps);
+    this.validateEvidence = new ValidateEvidenceCommand(deps);
+    this.linkEvidence = new LinkEvidenceCommand(deps);
+    this.addCustodyEvent = new AddCustodyEventCommand(deps);
+    this.generatePackage = new GenerateProbativePackageCommand(deps);
+    this.purgeUnverified = new PurgeUnverifiedCommand(deps);
+    this.createAccessRequest = new CreateAccessRequestCommand(deps);
+    this.decideAccessRequest = new DecideAccessRequestCommand(deps);
+    this.deliverAccessRequest = new DeliverAccessRequestCommand(deps);
+  }
+
+  initiate(input: InitiateUploadInput): Promise<InitiateUploadResult> {
+    return this.initiateUpload.execute(input);
+  }
+
+  complete(
+    evidenceId: string,
+    input: CompleteUploadInput,
+  ): Promise<CompleteUploadResult> {
+    return this.completeUpload.execute(evidenceId, input);
+  }
+
+  validate(
+    evidenceId: string,
+    input: ValidateEvidenceInput,
+  ): Promise<ValidateEvidenceResult> {
+    return this.validateEvidence.execute(evidenceId, input);
+  }
+
+  link(
+    evidenceId: string,
+    input: LinkEvidenceInput,
+  ): Promise<LinkEvidenceResult> {
+    return this.linkEvidence.execute(evidenceId, input);
+  }
+
+  custodyEvent(
+    evidenceId: string,
+    input: AddCustodyEventInput,
+  ): Promise<AddCustodyEventResult> {
+    return this.addCustodyEvent.execute(evidenceId, input);
+  }
+
+  probativePackage(
+    input: GenerateProbativePackageInput,
+  ): Promise<GenerateProbativePackageResult> {
+    return this.generatePackage.execute(input);
+  }
+
+  purge(input: PurgeUnverifiedInput): Promise<PurgeUnverifiedResult> {
+    return this.purgeUnverified.execute(input);
+  }
+
+  requestAccess(
+    input: CreateAccessRequestInput,
+  ): Promise<CreateAccessRequestResult> {
+    return this.createAccessRequest.execute(input);
+  }
+
+  decideAccess(
+    requestId: string,
+    decision: AccessDecision,
+    input: DecideAccessRequestInput,
+  ): Promise<DecideAccessRequestResult> {
+    return this.decideAccessRequest.execute(requestId, decision, input);
+  }
+
+  deliverAccess(
+    requestId: string,
+    input: DeliverAccessRequestInput,
+  ): Promise<DeliverAccessRequestResult> {
+    return this.deliverAccessRequest.execute(requestId, input);
+  }
+
+  /** §4.8 — toda leitura de evidência passa pela projeção de bodycam. */
+  list(): Promise<EvidenceRow[]> {
+    return inTenantTransaction(this.deps, async (tx) => {
+      const rows = await listRows(this.deps, tx, 'evidence');
+      const accessRequests = await listRows(this.deps, tx, 'accessRequests');
+      return rows.map((row) =>
+        projectEvidenceForRole(
+          row,
+          hasDeliveredAccess(accessRequests, stringOf(row.id)),
+        ),
+      );
+    });
+  }
+
+  get(evidenceId: string): Promise<EvidenceRow> {
+    return inTenantTransaction(this.deps, async (tx) => {
+      const row = await findRow(this.deps, tx, 'evidence', evidenceId);
+      if (!row) throw tenantMismatch({ evidenceId });
+      const accessRequests = await listRows(this.deps, tx, 'accessRequests');
+      return projectEvidenceForRole(
+        row,
+        hasDeliveredAccess(accessRequests, evidenceId),
+      );
+    });
+  }
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts b/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts
index 9295e58..1188c8b 100644
--- a/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts
+++ b/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts
@@ -1,50 +1,111 @@
-import { Body, Controller, Get, Post } from '@nestjs/common';
+// CTG-0003 §4.1…§4.8 (R-0008, TASK-0007) — rotas de comando de evidência e
+// custódia sob `v1/ops/evidence` (prefixo corrigido em CTG-0002 §1). Os
+// métodos só extraem parâmetros e chamam o comando (CODESTYLE §Backend).
+import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
 import { Action, Audit, Resource } from '@detran/shared';
-import { EvidenceCustodyService } from './evidence-custody.service.js';
+
+import type { AddCustodyEventInput } from './add-custody-event.command.js';
+import type { CompleteUploadInput } from './complete-upload.command.js';
+import { EvidenceCommandsService } from './evidence-commands.service.js';
+import type { GenerateProbativePackageInput } from './generate-probative-package.command.js';
+import type { InitiateUploadInput } from './initiate-upload.command.js';
+import type { LinkEvidenceInput } from './link-evidence.command.js';
+import type { PurgeUnverifiedInput } from './purge-unverified.command.js';
+import type { ValidateEvidenceInput } from './validate-evidence.command.js';

 @Controller('v1/ops/evidence')
 export class EvidenceCustodyController {
-  constructor(private readonly service: EvidenceCustodyService) {}
+  constructor(private readonly commands: EvidenceCommandsService) {}

-  @Get() @Resource('ops:evidence') @Action('read') list() {
-    return this.service.list('evidence');
+  /**
+   * §4.8 — a leitura de evidência passa pela projeção de bodycam. As duas
+   * rotas ficam sob `evidence/…` porque é onde o CRUD gerado de
+   * `BP-OPS-EVIDENCE-001` monta (`v1/ops/evidence/evidence`): o controlador
+   * manuscrito é registrado antes (adenda CTG-0003 §12 item 1) e é ele quem
+   * responde.
+   */
+  @Get('evidence') @Resource('ops:evidence') @Action('read') list() {
+    return this.commands.list();
   }

-  @Post()
+  @Post('upload-intents')
+  @HttpCode(200)
   @Resource('ops:evidence')
   @Action('initiate-upload')
-  @Audit({ action: 'OPS_EVIDENCE_CAPTURE', entity: 'ops.evidence_evidence' })
-  create(@Body() dto: Record<string, unknown>) {
-    return this.service.create('evidence', dto);
+  @Audit({
+    action: 'OPS_EVIDENCE_INITIATE_UPLOAD',
+    entity: 'ops.storage_intent',
+  })
+  initiateUpload(@Body() body: InitiateUploadInput) {
+    return this.commands.initiate(body);
+  }
+
+  @Post('probative-packages/generate')
+  @Resource('ops:probative-package')
+  @Action('generate')
+  @Audit({
+    action: 'OPS_PROBATIVE_PACKAGE_GENERATE',
+    entity: 'ops.evidence_probative_package',
+  })
+  generateProbativePackage(@Body() body: GenerateProbativePackageInput) {
+    return this.commands.probativePackage(body);
+  }
+
+  @Post('maintenance/purge-expired-unverified')
+  @HttpCode(200)
+  @Resource('ops:evidence')
+  @Action('purge-unverified')
+  @Audit({
+    action: 'OPS_EVIDENCE_PURGE_UNVERIFIED',
+    entity: 'ops.evidence_evidence',
+  })
+  purgeExpiredUnverified(@Body() body: PurgeUnverifiedInput) {
+    return this.commands.purge(body ?? {});
+  }
+
+  @Post(':id/complete-upload')
+  @HttpCode(200)
+  @Resource('ops:evidence')
+  @Action('complete-upload')
+  @Audit({
+    action: 'OPS_EVIDENCE_COMPLETE_UPLOAD',
+    entity: 'ops.evidence_evidence',
+  })
+  completeUpload(@Param('id') id: string, @Body() body: CompleteUploadInput) {
+    return this.commands.complete(id, body);
   }

-  @Post('links')
+  @Post(':id/validate')
+  @HttpCode(200)
+  @Resource('ops:evidence')
+  @Action('validate')
+  @Audit({ action: 'OPS_EVIDENCE_VALIDATE', entity: 'ops.evidence_evidence' })
+  validate(@Param('id') id: string, @Body() body: ValidateEvidenceInput) {
+    return this.commands.validate(id, body ?? {});
+  }
+
+  @Post(':id/links')
   @Resource('ops:evidence')
   @Action('link')
   @Audit({ action: 'OPS_EVIDENCE_LINK', entity: 'ops.evidence_link' })
-  link(@Body() dto: Record<string, unknown>) {
-    return this.service.create('links', dto);
+  link(@Param('id') id: string, @Body() body: LinkEvidenceInput) {
+    return this.commands.link(id, body);
   }

-  @Post('custody-events')
+  @Post(':id/custody-events')
   @Resource('ops:evidence')
   @Action('add-custody-event')
   @Audit({
     action: 'OPS_EVIDENCE_CUSTODY_EVENT',
     entity: 'ops.evidence_custody_event',
   })
-  custody(@Body() dto: Record<string, unknown>) {
-    return this.service.create('custody-events', dto);
+  custodyEvent(@Param('id') id: string, @Body() body: AddCustodyEventInput) {
+    return this.commands.custodyEvent(id, body);
   }

-  @Post('probative-packages')
-  @Resource('ops:probative-package')
-  @Action('generate')
-  @Audit({
-    action: 'OPS_PROBATIVE_PACKAGE_GENERATE',
-    entity: 'ops.evidence_probative_package',
-  })
-  package(@Body() dto: Record<string, unknown>) {
-    return this.service.create('probative-packages', dto);
+  @Get('evidence/:id') @Resource('ops:evidence') @Action('read') get(
+    @Param('id') id: string,
+  ) {
+    return this.commands.get(id);
   }
 }
diff --git a/backend/domains/ops/evidence/src/handwritten/evidence-custody.provider.ts b/backend/domains/ops/evidence/src/handwritten/evidence-custody.provider.ts
deleted file mode 100644
index 43ee8a1..0000000
--- a/backend/domains/ops/evidence/src/handwritten/evidence-custody.provider.ts
+++ /dev/null
@@ -1,25 +0,0 @@
-import { RequestContext } from '@stynx-nyx/core';
-import { Database } from '@stynx-nyx/data';
-import { OpsTenantRepository } from '@detran/ops-core';
-import { EvidenceCustodyService } from './evidence-custody.service.js';
-
-const surfaces = {
-  evidence: 'ops.evidence_evidence',
-  links: 'ops.evidence_link',
-  'custody-events': 'ops.evidence_custody_event',
-  'probative-packages': 'ops.evidence_probative_package',
-} as const;
-
-export const EVIDENCE_CUSTODY_PROVIDER = {
-  provide: EvidenceCustodyService,
-  inject: [Database, RequestContext],
-  useFactory: (database: Database, requestContext: RequestContext) =>
-    new EvidenceCustodyService(
-      Object.fromEntries(
-        Object.entries(surfaces).map(([name, table]) => [
-          name,
-          new OpsTenantRepository(database, requestContext, table),
-        ]),
-      ),
-    ),
-};
diff --git a/backend/domains/ops/evidence/src/handwritten/evidence-custody.service.ts b/backend/domains/ops/evidence/src/handwritten/evidence-custody.service.ts
deleted file mode 100644
index 929a8fd..0000000
--- a/backend/domains/ops/evidence/src/handwritten/evidence-custody.service.ts
+++ /dev/null
@@ -1,19 +0,0 @@
-import { OpsTenantRepository } from '@detran/ops-core';
-
-export class EvidenceCustodyService {
-  constructor(
-    private readonly repositories: Record<string, OpsTenantRepository>,
-  ) {}
-
-  list(surface: string) {
-    const repository = this.repositories[surface];
-    if (!repository) throw new Error(`Unbound evidence surface: ${surface}`);
-    return repository.list();
-  }
-
-  create(surface: string, dto: Record<string, unknown>) {
-    const repository = this.repositories[surface];
-    if (!repository) throw new Error(`Unbound evidence surface: ${surface}`);
-    return repository.create(dto);
-  }
-}
diff --git a/backend/domains/ops/evidence/src/handwritten/evidence-runtime.ts b/backend/domains/ops/evidence/src/handwritten/evidence-runtime.ts
new file mode 100644
index 0000000..87ae368
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/evidence-runtime.ts
@@ -0,0 +1,376 @@
+// CTG-0003 §4 (M11, R-0008, TASK-0007) — dependências e utilidades comuns aos
+// comandos manuscritos de evidência e custódia.
+//
+// Os comandos nunca escrevem SQL de tabela fora da transação do comando: a
+// porta `EvidenceRowStore` é a superfície mínima por tabela (a mesma de
+// `OpsTenantRepository` e a que os harnesses de teste implementam, CTG-0002
+// §4 / `@detran/ops-core`). Quando a porta não expõe a operação — é o caso do
+// wiring de produção, que injeta só leitura — a escrita acontece por SQL
+// parametrizado **na transação em curso**, que é o que o invariante "mesma
+// transação" da §4.2 exige.
+import { randomUUID } from 'node:crypto';
+
+import {
+  asQueryable,
+  type OpsClock,
+  type SqlQueryable,
+} from '@detran/ops-core';
+import type { AppliedEntityPort, EvidenceStoragePort } from '@detran/ops-core';
+import {
+  DetranError,
+  withTenantContext,
+  type TeatEventOutbox,
+} from '@detran/shared';
+import type { RequestContext } from '@stynx-nyx/core';
+import type { Database, Transaction } from '@stynx-nyx/data';
+
+export type EvidenceRow = Record<string, unknown>;
+
+/**
+ * Vocabulário de modelagem de `evidence_custody_event.event_type` (§11.8 —
+ * onze tokens, sem check na coluna) e rol fechado do art. 13 para
+ * `evidence_access_request.requester_role` (RN-TEAT-142, check
+ * `ck_ops_evidence_access_requester_role`). Moram aqui, e não no comando que
+ * os consome, porque `handwritten/events.ts` também precisa deles para os
+ * esquemas zod — e o comando importa `events.ts`.
+ */
+export const CUSTODY_EVENT_TYPES = [
+  'uploaded',
+  'validated',
+  'rejected',
+  'linked',
+  'packaged',
+  'access_approved',
+  'access_denied',
+  'access_delivered',
+  'purged_unverified',
+  'quarantined',
+  'restored',
+] as const;
+
+export type CustodyEventType = (typeof CUSTODY_EVENT_TYPES)[number];
+
+export function isCustodyEventType(value: string): value is CustodyEventType {
+  return (CUSTODY_EVENT_TYPES as readonly string[]).includes(value);
+}
+
+export const EVIDENCE_ACCESS_REQUESTER_ROLES = [
+  'magistrado',
+  'ministerio-publico',
+  'defensoria-publica',
+  'autoridade-policial',
+  'autoridade-administrativa',
+] as const;
+
+export type EvidenceAccessRequesterRole =
+  (typeof EVIDENCE_ACCESS_REQUESTER_ROLES)[number];
+
+export function isEvidenceAccessRequesterRole(
+  value: string,
+): value is EvidenceAccessRequesterRole {
+  return (EVIDENCE_ACCESS_REQUESTER_ROLES as readonly string[]).includes(value);
+}
+
+export function requesterNotInRol(requesterRole: string): DetranError {
+  return new DetranError('TEAT.EVIDENCE_ACCESS_REQUESTER_NOT_IN_ROL', {
+    status: 422,
+    context: { requesterRole, allowed: [...EVIDENCE_ACCESS_REQUESTER_ROLES] },
+    message: 'Requerente fora do rol do art. 13 da Portaria.',
+  });
+}
+
+/** Superfície mínima de uma tabela de `ops` usada pelos comandos. */
+export interface EvidenceRowStore {
+  list?(): Promise<EvidenceRow[]>;
+  find?(id: string): Promise<EvidenceRow | undefined>;
+  findOne?(id: string): Promise<EvidenceRow | undefined>;
+  create?(values: EvidenceRow): Promise<EvidenceRow>;
+  update?(
+    id: string,
+    patch: EvidenceRow,
+    tx?: unknown,
+  ): Promise<EvidenceRow | undefined>;
+}
+
+export interface EvidenceDeps {
+  database: Pick<Database, 'tx'>;
+  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
+  repositories: Record<string, EvidenceRowStore | undefined>;
+  appliedEntityPorts?: readonly AppliedEntityPort[];
+  evidenceStorage?: EvidenceStoragePort;
+  outbox?: TeatEventOutbox;
+  clock: OpsClock;
+}
+
+export interface EvidenceScope {
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+}
+
+/** Tabelas tocadas pelos comandos desta tarefa (CTG-0003 §4). */
+export const EVIDENCE_TABLES = {
+  evidence: 'ops.evidence_evidence',
+  storageIntents: 'ops.storage_intent',
+  evidenceLinks: 'ops.evidence_link',
+  custodyEvents: 'ops.evidence_custody_event',
+  probativePackages: 'ops.evidence_probative_package',
+  probativePackageItems: 'ops.evidence_probative_package_item',
+  accessRequests: 'ops.evidence_access_request',
+} as const;
+
+export type EvidenceTableName = keyof typeof EVIDENCE_TABLES;
+
+export function tenantScope(deps: EvidenceDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Um comando de evidência exige contexto de requisição');
+  const snapshot = deps.requestContext.snapshot();
+  const tenantId = snapshot.tenantId ?? '';
+  const actorId = snapshot.actorId ?? '';
+  if (!tenantId || !actorId)
+    throw new Error('Um comando de evidência exige tenantId e actorId');
+  return { tenantId, actorId };
+}
+
+export function scopeOf(deps: EvidenceDeps): EvidenceScope {
+  const { tenantId, actorId } = tenantScope(deps);
+  return { tenantId, actorId, occurredAt: deps.clock.now() };
+}
+
+/** `withTenantContext` (role `app`, RLS na volta) — nunca conexão de owner. */
+export function inTenantTransaction<T>(
+  deps: EvidenceDeps,
+  work: (tx: Transaction) => Promise<T>,
+): Promise<T> {
+  return withTenantContext(deps.database, deps.requestContext, work);
+}
+
+function storeOf(
+  deps: EvidenceDeps,
+  table: EvidenceTableName,
+): EvidenceRowStore | undefined {
+  return deps.repositories[table];
+}
+
+function sqlOf(tx: unknown): SqlQueryable | undefined {
+  return asQueryable(tx as Transaction);
+}
+
+function assertColumns(values: EvidenceRow): string[] {
+  const columns = Object.keys(values);
+  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
+    throw new Error('Coluna inválida em escrita de ops');
+  return columns;
+}
+
+export async function findRow(
+  deps: EvidenceDeps,
+  tx: unknown,
+  table: EvidenceTableName,
+  id: string,
+): Promise<EvidenceRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.find === 'function') return store.find(id);
+  if (typeof store?.findOne === 'function') return store.findOne(id);
+  const sql = sqlOf(tx);
+  if (!sql) return undefined;
+  const result = await sql.query(
+    `select * from ${EVIDENCE_TABLES[table]} where id = $1`,
+    [id],
+  );
+  return result.rows[0];
+}
+
+export async function listRows(
+  deps: EvidenceDeps,
+  tx: unknown,
+  table: EvidenceTableName,
+): Promise<EvidenceRow[]> {
+  const store = storeOf(deps, table);
+  if (typeof store?.list === 'function') return store.list();
+  const sql = sqlOf(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${EVIDENCE_TABLES[table]} order by created_at desc`,
+  );
+  return result.rows;
+}
+
+/**
+ * Leitura por coluna: a porta de repositório só sabe `list`/`find`, então o
+ * filtro acontece em memória quando ela existe e vira `where` parametrizado
+ * quando a escrita é da transação (wiring de produção).
+ */
+export async function findRowsWhere(
+  deps: EvidenceDeps,
+  tx: unknown,
+  table: EvidenceTableName,
+  column: string,
+  value: unknown,
+): Promise<EvidenceRow[]> {
+  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
+  const store = storeOf(deps, table);
+  if (typeof store?.list === 'function')
+    return (await store.list()).filter((row) => row[column] === value);
+  const sql = sqlOf(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${EVIDENCE_TABLES[table]} where ${column} = $1`,
+    [value],
+  );
+  return result.rows;
+}
+
+export async function insertRow(
+  deps: EvidenceDeps,
+  tx: unknown,
+  table: EvidenceTableName,
+  values: EvidenceRow,
+): Promise<EvidenceRow> {
+  const store = storeOf(deps, table);
+  if (typeof store?.create === 'function') return store.create(values);
+  const sql = sqlOf(tx);
+  if (!sql)
+    throw new Error(`Sem porta nem transação para escrever em ${table}`);
+  const columns = assertColumns(values);
+  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+  const result = await sql.query(
+    `insert into ${EVIDENCE_TABLES[table]} (${columns.join(', ')})
+     values (${placeholders}) returning *`,
+    columns.map((column) => normalize(values[column])),
+  );
+  return (result.rows[0] ?? values) as EvidenceRow;
+}
+
+export async function patchRow(
+  deps: EvidenceDeps,
+  tx: unknown,
+  table: EvidenceTableName,
+  id: string,
+  patch: EvidenceRow,
+): Promise<EvidenceRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.update === 'function') return store.update(id, patch, tx);
+  const sql = sqlOf(tx);
+  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
+  const columns = assertColumns(patch);
+  const assignments = columns
+    .map((column, index) => `${column} = $${index + 2}`)
+    .join(', ');
+  const result = await sql.query(
+    `update ${EVIDENCE_TABLES[table]}
+        set ${assignments}, updated_at = now()
+      where id = $1 returning *`,
+    [id, ...columns.map((column) => normalize(patch[column]))],
+  );
+  return result.rows[0];
+}
+
+/** `jsonb` recebe JSON textual; os demais valores vão como estão. */
+function normalize(value: unknown): unknown {
+  if (value === null || value === undefined) return null;
+  if (typeof value === 'object' && !(value instanceof Date))
+    return JSON.stringify(value);
+  return value;
+}
+
+export function newId(): string {
+  return randomUUID();
+}
+
+export function stringOf(value: unknown): string {
+  return typeof value === 'string' ? value : String(value ?? '');
+}
+
+export function isoOf(value: unknown): string {
+  if (value instanceof Date) return value.toISOString();
+  return stringOf(value);
+}
+
+export function objectKeyOf(tenantId: string, evidenceId: string): string {
+  return `evidence/${tenantId}/${evidenceId}`;
+}
+
+/** CTG-0003 §13 item 5 (OD-T29): estado inválido de evidência é 422. */
+export function stateTransitionFailed(): DetranError {
+  return validationFailed([{ path: 'status', rule: 'transition' }]);
+}
+
+export function validationFailed(
+  fields: readonly { path: string; rule: string }[],
+): DetranError {
+  return new DetranError('TEAT.VALIDATION_FAILED', {
+    status: 422,
+    context: { fields: [...fields] },
+    message: 'Requisição inválida para a regra do comando.',
+  });
+}
+
+export function tenantMismatch(context: Record<string, unknown>): DetranError {
+  return new DetranError('TEAT.TENANT_MISMATCH', {
+    status: 404,
+    context,
+    message: 'Recurso inexistente no tenant do contexto.',
+  });
+}
+
+export function quarantined(evidenceId: string): DetranError {
+  return new DetranError('TEAT.EVIDENCE_QUARANTINED', {
+    status: 409,
+    context: { evidenceId },
+    message: 'Evidência em quarentena.',
+  });
+}
+
+/**
+ * A porta responde "a entidade já foi aplicada no servidor?" (CTG-0002 §4.8).
+ * Sem porta para o tipo, a resposta é "não aplicada": nunca se presume o
+ * contrário.
+ */
+export async function assertEntityApplied(
+  deps: EvidenceDeps,
+  tx: Transaction,
+  entityType: string,
+  entityId: string,
+): Promise<void> {
+  const port = deps.appliedEntityPorts?.find(
+    (candidate) => candidate.entityType === entityType,
+  );
+  const applied = port ? await port.isApplied(entityId, tx) : false;
+  if (applied) return;
+  throw new DetranError('TEAT.EVIDENCE_ENTITY_NOT_APPLIED', {
+    status: 409,
+    context: { entityType, entityId },
+    message: 'Entidade ainda não aplicada no servidor.',
+  });
+}
+
+/**
+ * Ordem do próximo fato de custódia do agregado — a versão do envelope
+ * (`outboxIdempotencyKey`, CTG-0001 §2). Contada antes da escrita do evento.
+ */
+export async function nextCustodyVersion(
+  deps: EvidenceDeps,
+  tx: unknown,
+  evidenceId: string,
+): Promise<number> {
+  const existing = await findRowsWhere(
+    deps,
+    tx,
+    'custodyEvents',
+    'evidence_id',
+    evidenceId,
+  );
+  return existing.length + 1;
+}
+
+export async function appendEvent(
+  deps: EvidenceDeps,
+  tx: Transaction,
+  envelope: Parameters<TeatEventOutbox['append']>[1],
+): Promise<void> {
+  await deps.outbox?.append(tx, envelope);
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/generate-probative-package.command.spec.ts b/backend/domains/ops/evidence/src/handwritten/generate-probative-package.command.spec.ts
new file mode 100644
index 0000000..e2d39d0
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/generate-probative-package.command.spec.ts
@@ -0,0 +1,180 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §4.6 e §10 (R-0008, TASK-0006) — C-0003-11: `POST
+ * /v1/ops/evidence/probative-packages/generate`.
+ * `handwritten/generate-probative-package.command.ts` nasce em TASK-0007.
+ * Nome esperado do export: `GenerateProbativePackageCommand`, construtor
+ * `(deps)`, método `execute`.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+const AIT_ID = '00000000-0000-7000-8000-0000f0000002';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    list: vi.fn(async () => [...store]),
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: {
+      evidence: repository(),
+      evidenceLinks: repository(),
+      probativePackages: repository(),
+      probativePackageItems: repository(),
+      custodyEvents: repository(),
+      ...(overrides.repositories ?? {}),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+function input(
+  overrides: Record<string, unknown> = {},
+): Record<string, unknown> {
+  return {
+    traffic_agency_id: AGENCY_ID,
+    entity_type: 'ait',
+    entity_id: AIT_ID,
+    generated_by_user_ref: ACTOR_ID,
+    purpose: 'instrucao-processual',
+    ...overrides,
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function generateProbativePackage(
+  dependencies: Deps,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule(
+      './generate-probative-package.command.js',
+    )) as Record<string, unknown>;
+  } catch (cause) {
+    throw new Error(
+      'ops/evidence/src/handwritten/generate-probative-package.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.GenerateProbativePackageCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'generate-probative-package.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'generate-probative-package.command.ts não expõe execute|handle|run (CTG-0003 §4.6)',
+    );
+  }
+  return (await (method as (value: unknown) => Promise<unknown>).call(
+    command,
+    body,
+  )) as Record<string, unknown>;
+}
+
+describe('CTG-0003 §4.6 — probative-packages/generate: cobertura mínima (C-0003-11)', () => {
+  it('C-0003-11 — dado probative-packages/generate para um AIT sem evidência validated|linked então 422 TEAT.PROBATIVE_PACKAGE_INCOMPLETE com { entityType, entityId, found: 0 }', async () => {
+    const dependencies = deps();
+    await expect(
+      generateProbativePackage(dependencies, input()),
+    ).rejects.toMatchObject({
+      code: 'TEAT.PROBATIVE_PACKAGE_INCOMPLETE',
+      status: 422,
+      context: expect.objectContaining({
+        entityType: 'ait',
+        entityId: AIT_ID,
+        found: 0,
+      }),
+    });
+    expect(dependencies.repositories.probativePackages.rows).toEqual([]);
+  });
+
+  it('dado ao menos uma evidência validated ligada à entidade então o pacote é gerado com sucesso', async () => {
+    const dependencies = deps({
+      repositories: {
+        evidence: repository([
+          {
+            id: '00000000-0000-7000-8000-0000ef000005',
+            tenant_id: TENANT_ID,
+            status: 'validated',
+            hash_value: 'sha256:aaaa',
+            evidence_type: 'foto',
+            captured_at: '2026-09-10T10:00:00-04:00',
+          },
+        ]),
+        evidenceLinks: repository([
+          {
+            id: 'link-1',
+            tenant_id: TENANT_ID,
+            evidence_id: '00000000-0000-7000-8000-0000ef000005',
+            entity_type: 'ait',
+            entity_id: AIT_ID,
+          },
+        ]),
+        probativePackages: repository(),
+        probativePackageItems: repository(),
+        custodyEvents: repository(),
+      },
+    });
+    const response = await generateProbativePackage(dependencies, input());
+    expect(response.manifest_hash).toEqual(expect.stringMatching(/^sha256:/));
+    expect(dependencies.repositories.probativePackageItems.rows).toHaveLength(
+      1,
+    );
+  });
+});
diff --git a/backend/domains/ops/evidence/src/handwritten/generate-probative-package.command.ts b/backend/domains/ops/evidence/src/handwritten/generate-probative-package.command.ts
new file mode 100644
index 0000000..c49e73f
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/generate-probative-package.command.ts
@@ -0,0 +1,198 @@
+// CTG-0003 §4.6 (R-0008, TASK-0007) — `POST
+// /v1/ops/evidence/probative-packages/generate`.
+//
+// Os itens saem na ordem `captured_at asc, id asc`; o `manifest_hash` cobre
+// os `item_hash`; toda evidência incluída passa a `packaged` com o evento de
+// custódia correspondente.
+import { DetranError } from '@detran/shared';
+
+import {
+  appendEvent,
+  findRow,
+  findRowsWhere,
+  insertRow,
+  inTenantTransaction,
+  isoOf,
+  newId,
+  nextCustodyVersion,
+  patchRow,
+  quarantined,
+  scopeOf,
+  stringOf,
+  validationFailed,
+  type EvidenceDeps,
+  type EvidenceRow,
+} from './evidence-runtime.js';
+import { probativePackageGeneratedEvent } from './events.js';
+import { manifestHashOf, probativeManifest } from './manifest.js';
+
+const PACKAGEABLE_STATUSES = ['validated', 'linked'] as const;
+
+export interface GenerateProbativePackageInput {
+  traffic_agency_id: string;
+  entity_type: string;
+  entity_id: string;
+  generated_by_user_ref: string;
+  purpose: string;
+}
+
+export interface ProbativePackageItemView {
+  sequence: number;
+  evidence_id: string;
+  item_hash: string;
+}
+
+export interface GenerateProbativePackageResult {
+  id: string;
+  manifest_hash: string;
+  package_uri: string;
+  items: ProbativePackageItemView[];
+}
+
+export class GenerateProbativePackageCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(
+    input: GenerateProbativePackageInput,
+  ): Promise<GenerateProbativePackageResult> {
+    const entityType = stringOf(input?.entity_type ?? '').trim();
+    const entityId = stringOf(input?.entity_id ?? '').trim();
+    const purpose = stringOf(input?.purpose ?? '').trim();
+    const trafficAgencyId = stringOf(input?.traffic_agency_id ?? '').trim();
+    const fields = [
+      ...(entityType ? [] : [{ path: 'entity_type', rule: 'required' }]),
+      ...(entityId ? [] : [{ path: 'entity_id', rule: 'required' }]),
+      ...(purpose ? [] : [{ path: 'purpose', rule: 'required' }]),
+      ...(trafficAgencyId
+        ? []
+        : [{ path: 'traffic_agency_id', rule: 'required' }]),
+    ];
+    if (fields.length > 0) throw validationFailed(fields);
+    const scope = scopeOf(this.deps);
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const links = (
+        await findRowsWhere(
+          this.deps,
+          tx,
+          'evidenceLinks',
+          'entity_id',
+          entityId,
+        )
+      ).filter((link) => stringOf(link.entity_type) === entityType);
+
+      const linked: EvidenceRow[] = [];
+      for (const evidenceId of new Set(
+        links.map((link) => stringOf(link.evidence_id)),
+      )) {
+        const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
+        if (evidence) linked.push(evidence);
+      }
+
+      const inQuarantine = linked.find(
+        (evidence) => evidence.status === 'quarantined',
+      );
+      if (inQuarantine) throw quarantined(stringOf(inQuarantine.id));
+
+      const eligible = linked
+        .filter((evidence) =>
+          (PACKAGEABLE_STATUSES as readonly unknown[]).includes(
+            evidence.status,
+          ),
+        )
+        .sort(byCapturedAtThenId);
+
+      if (eligible.length === 0)
+        throw new DetranError('TEAT.PROBATIVE_PACKAGE_INCOMPLETE', {
+          status: 422,
+          context: { entityType, entityId, found: 0 },
+          message: 'Nenhuma evidência validada ou vinculada para a entidade.',
+        });
+
+      const packageId = newId();
+      const packageUri = `/v1/ops/evidence/probative-packages/${packageId}`;
+      const items = eligible.map((evidence, index) => ({
+        sequence: index + 1,
+        evidenceId: stringOf(evidence.id),
+        itemType: stringOf(evidence.evidence_type),
+        itemHash: stringOf(evidence.hash_value),
+      }));
+      const manifestHash = manifestHashOf(
+        probativeManifest({ entityType, entityId, purpose, items }),
+      );
+
+      await insertRow(this.deps, tx, 'probativePackages', {
+        id: packageId,
+        traffic_agency_id: trafficAgencyId,
+        entity_type: entityType,
+        entity_id: entityId,
+        generated_by_user_ref: stringOf(
+          input.generated_by_user_ref || scope.actorId,
+        ),
+        generated_at: scope.occurredAt,
+        purpose,
+        manifest_hash: manifestHash,
+        package_uri: packageUri,
+      });
+
+      for (const item of items) {
+        await insertRow(this.deps, tx, 'probativePackageItems', {
+          package_id: packageId,
+          item_type: item.itemType,
+          evidence_id: item.evidenceId,
+          entity_type: entityType,
+          entity_id: entityId,
+          item_hash: item.itemHash,
+          sequence: item.sequence,
+        });
+        await patchRow(this.deps, tx, 'evidence', item.evidenceId, {
+          status: 'packaged',
+        });
+        const version = await nextCustodyVersion(
+          this.deps,
+          tx,
+          item.evidenceId,
+        );
+        await insertRow(this.deps, tx, 'custodyEvents', {
+          evidence_id: item.evidenceId,
+          event_type: 'packaged',
+          event_at: scope.occurredAt,
+          user_ref: scope.actorId,
+          system_name: 'detran-backend',
+          details_json: { packageId, sequence: item.sequence, version },
+        });
+      }
+
+      await appendEvent(
+        this.deps,
+        tx,
+        probativePackageGeneratedEvent(scope, {
+          packageId,
+          entityType,
+          entityId,
+          purpose,
+          manifestHash,
+          itemCount: items.length,
+        }),
+      );
+
+      return {
+        id: packageId,
+        manifest_hash: manifestHash,
+        package_uri: packageUri,
+        items: items.map((item) => ({
+          sequence: item.sequence,
+          evidence_id: item.evidenceId,
+          item_hash: item.itemHash,
+        })),
+      };
+    });
+  }
+}
+
+function byCapturedAtThenId(left: EvidenceRow, right: EvidenceRow): number {
+  const leftAt = isoOf(left.captured_at);
+  const rightAt = isoOf(right.captured_at);
+  if (leftAt !== rightAt) return leftAt < rightAt ? -1 : 1;
+  return stringOf(left.id) < stringOf(right.id) ? -1 : 1;
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/initiate-upload.command.spec.ts b/backend/domains/ops/evidence/src/handwritten/initiate-upload.command.spec.ts
new file mode 100644
index 0000000..b2a3d57
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/initiate-upload.command.spec.ts
@@ -0,0 +1,243 @@
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §4.1 e §10 (R-0008, TASK-0006) — C-0003-01…05: `POST
+ * /v1/ops/evidence/upload-intents` (M11). Nada aqui existe ainda:
+ * `handwritten/initiate-upload.command.ts` é criado pelo Engineer em
+ * TASK-0007 (CTG-0003 §11). O módulo é carregado por `import()` dinâmico
+ * dentro de cada teste para que o arquivo colete e cada caso falhe isolado.
+ *
+ * Nome esperado do export (precedente CTG-0002 §13.3, citado no prompt desta
+ * tarefa): `InitiateUploadCommand`, construtor `(deps)`, método `execute`. O
+ * carregador tolera outros nomes plausíveis e cai no primeiro export
+ * construtível, para não derrubar o arquivo se o Engineer divergir — a
+ * divergência vira nota no relatório, nunca ajuste do teste.
+ *
+ * Canônico aqui (CTG-0003 §4.1, `teat-error-catalog.md` §6): os códigos de
+ * erro, as chaves de `context`, a forma da resposta 201 e a proveniência de
+ * `upload_url`/`expires_at` da porta `EvidenceStoragePort` — nunca constante
+ * do domínio (M11). Não canônico: o nome do símbolo exportado e a forma do
+ * objeto `deps`.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const AIT_INTEGRADO_ID = '00000000-0000-7000-8000-0000f0000001';
+const NOW = '2026-09-14T14:00:00.000Z';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    list: vi.fn(async () => [...store]),
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  appliedEntityPorts: readonly {
+    entityType: string;
+    isApplied: ReturnType<typeof vi.fn>;
+  }[];
+  evidenceStorage: { presignUpload: ReturnType<typeof vi.fn> };
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function appliedEntityPort(entityType: string, applied = true) {
+  return {
+    entityType,
+    isApplied: vi.fn(async () => applied),
+  };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: {
+      evidence: repository(),
+      storageIntents: repository(),
+      ...(overrides.repositories ?? {}),
+    },
+    appliedEntityPorts: overrides.appliedEntityPorts ?? [
+      appliedEntityPort('ait', true),
+    ],
+    evidenceStorage: overrides.evidenceStorage ?? {
+      presignUpload: vi.fn(
+        async (input: { objectKey: string }) =>
+          ({
+            uploadUrl: `local://${input.objectKey}`,
+            expiresAt: '2027-01-01T00:00:00.000Z',
+          }) as const,
+      ),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+function input(
+  overrides: Record<string, unknown> = {},
+): Record<string, unknown> {
+  return {
+    traffic_agency_id: AGENCY_ID,
+    local_evidence_id: '00000000-0000-7000-8000-0000ef900001',
+    idempotency_key: 'upload-intent-001',
+    entity_type: 'ait',
+    entity_id: AIT_INTEGRADO_ID,
+    evidence_type: 'foto',
+    origin: 'campo',
+    mime_type: 'image/jpeg',
+    size_bytes: 204800,
+    hash_algorithm: 'sha256',
+    hash_value:
+      'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
+    filename: 'foto-001.jpg',
+    ...overrides,
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+const COMMAND_EXPORTS = [
+  'InitiateUploadCommand',
+  'InitiateEvidenceUploadCommand',
+] as const;
+const COMMAND_METHODS = ['execute', 'handle', 'run'] as const;
+
+async function initiateUpload(
+  dependencies: Deps,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./initiate-upload.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'ops/evidence/src/handwritten/initiate-upload.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    COMMAND_EXPORTS.map((name) => loaded[name]).find(
+      (value) => typeof value === 'function',
+    ) ?? Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'initiate-upload.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = COMMAND_METHODS.map((name) => command[name]).find(
+    (value) => typeof value === 'function',
+  );
+  if (typeof method !== 'function') {
+    throw new Error(
+      `initiate-upload.command.ts não expõe nenhum de ${COMMAND_METHODS.join('|')} (CTG-0003 §4.1)`,
+    );
+  }
+  return (await (method as (value: unknown) => Promise<unknown>).call(
+    command,
+    body,
+  )) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+describe('CTG-0003 §4.1 — upload-intents: pré-condições e idempotência (C-0003-01…05)', () => {
+  it('C-0003-01 — dado upload-intents sem hash_value então 400 TEAT.EVIDENCE_HASH_REQUIRED', async () => {
+    const dependencies = deps();
+    const body = input();
+    delete body.hash_value;
+    await expect(initiateUpload(dependencies, body)).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_HASH_REQUIRED',
+      status: 400,
+    });
+  });
+
+  it('C-0003-02 — dado entity_type=ait com entity_id que a AppliedEntityPort diz não aplicado então 409 TEAT.EVIDENCE_ENTITY_NOT_APPLIED com { entityType, entityId }', async () => {
+    const dependencies = deps({
+      appliedEntityPorts: [appliedEntityPort('ait', false)],
+    });
+    await expect(initiateUpload(dependencies, input())).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_ENTITY_NOT_APPLIED',
+      status: 409,
+      context: expect.objectContaining({
+        entityType: 'ait',
+        entityId: AIT_INTEGRADO_ID,
+      }),
+    });
+  });
+
+  it('C-0003-03 — dado upload-intents repetido com a mesma idempotency_key e o mesmo corpo então a resposta é idêntica e existe uma única storage_intent', async () => {
+    const dependencies = deps();
+    const body = input();
+    const first = await initiateUpload(dependencies, body);
+    const second = await initiateUpload(dependencies, body);
+    expect(second).toEqual(first);
+    expect(dependencies.repositories.storageIntents.rows).toHaveLength(1);
+  });
+
+  it('C-0003-04 — dado o mesmo idempotency_key com corpo diferente então 409 TEAT.IDEMPOTENCY_REPLAY', async () => {
+    const dependencies = deps();
+    await initiateUpload(dependencies, input());
+    await expect(
+      initiateUpload(dependencies, input({ filename: 'outro-arquivo.jpg' })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.IDEMPOTENCY_REPLAY',
+      status: 409,
+    });
+  });
+
+  it('C-0003-05 — dado upload-intents bem-sucedido então upload_url e expires_at vêm da porta (local://<object_key> no stub), sem constante de expiração no domínio', async () => {
+    const dependencies = deps();
+    const response = await initiateUpload(dependencies, input());
+    expect(dependencies.evidenceStorage.presignUpload).toHaveBeenCalled();
+    expect(response.upload_url).toMatch(/^local:\/\//);
+    expect(response.expires_at).toBe('2027-01-01T00:00:00.000Z');
+    expect(response.storage_intent_id).toBeDefined();
+    expect(response.evidence_id).toBeDefined();
+  });
+});
diff --git a/backend/domains/ops/evidence/src/handwritten/initiate-upload.command.ts b/backend/domains/ops/evidence/src/handwritten/initiate-upload.command.ts
new file mode 100644
index 0000000..9ea66b2
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/initiate-upload.command.ts
@@ -0,0 +1,306 @@
+// CTG-0003 §4.1 (M11, R-0008, TASK-0007) — `POST /v1/ops/evidence/upload-intents`.
+//
+// A intenção é idempotente por `idempotency_key` (índice único
+// `ux_storage_intent_tenant_id_idempotency_key`): a repetição com o mesmo
+// corpo devolve a **mesma** resposta; com corpo diferente, 409
+// `TEAT.IDEMPOTENCY_REPLAY`. A expiração vem sempre da porta
+// `EvidenceStoragePort`, nunca de constante do domínio (M11).
+import { DetranError } from '@detran/shared';
+
+import {
+  assertEntityApplied,
+  findRow,
+  findRowsWhere,
+  insertRow,
+  inTenantTransaction,
+  isoOf,
+  newId,
+  objectKeyOf,
+  stringOf,
+  tenantScope,
+  validationFailed,
+  type EvidenceDeps,
+  type EvidenceRow,
+} from './evidence-runtime.js';
+import { sha256Hex, stableJson } from './manifest.js';
+
+/** `mime_type` aceito pela coleção `evidence` do substrato de storage. */
+const ALLOWED_MIME_TYPES = [
+  'image/jpeg',
+  'image/png',
+  'application/pdf',
+  'video/mp4',
+] as const;
+
+const MAX_SIZE_BYTES = 52_428_800;
+/** §4.1; OD-T53 (adenda §13): o digest tem 64 hex, sem exceção. */
+const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/i;
+const UUID_PATTERN =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+export interface InitiateUploadInput {
+  traffic_agency_id: string;
+  local_evidence_id: string;
+  idempotency_key: string;
+  entity_type: string;
+  entity_id: string;
+  evidence_type: string;
+  origin: string;
+  mime_type: string;
+  size_bytes: number;
+  hash_algorithm: string;
+  hash_value: string;
+  filename: string;
+  captured_by_user_ref?: string;
+  agent_id?: string;
+  device_id?: string;
+  captured_at?: string;
+  location_json?: Record<string, unknown>;
+  metadata_json?: Record<string, unknown>;
+}
+
+export interface InitiateUploadResult {
+  storage_intent_id: string;
+  upload_url: string;
+  expires_at: string;
+  evidence_id: string;
+}
+
+interface ParsedInput extends InitiateUploadInput {
+  requestHash: string;
+}
+
+export class InitiateUploadCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(input: InitiateUploadInput): Promise<InitiateUploadResult> {
+    const parsed = parse(input);
+    const { tenantId, actorId } = tenantScope(this.deps);
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const replay = await this.findByIdempotencyKey(
+        tx,
+        parsed.idempotency_key,
+      );
+      if (replay) return this.replayOf(tx, replay, parsed);
+
+      await assertEntityApplied(
+        this.deps,
+        tx,
+        parsed.entity_type,
+        parsed.entity_id,
+      );
+      await this.assertHashIsFree(tx, parsed.hash_value);
+
+      const evidenceId = newId();
+      const objectKey = objectKeyOf(tenantId, evidenceId);
+      const presigned = await this.presign(parsed, objectKey);
+
+      await insertRow(this.deps, tx, 'evidence', {
+        id: evidenceId,
+        traffic_agency_id: parsed.traffic_agency_id,
+        evidence_type: parsed.evidence_type,
+        origin: parsed.origin,
+        // §13 item 3 (OD-T32): a coluna é `not null`; a chave já decidida é a
+        // do objeto, e `status='pending_upload'` é quem diz que nada chegou.
+        storage_uri: objectKey,
+        mime_type: parsed.mime_type,
+        size_bytes: parsed.size_bytes,
+        hash_algorithm: parsed.hash_algorithm,
+        hash_value: parsed.hash_value,
+        captured_by_user_ref: parsed.captured_by_user_ref ?? actorId,
+        agent_id: parsed.agent_id ?? null,
+        device_id: parsed.device_id ?? null,
+        captured_at: parsed.captured_at ?? this.deps.clock.now(),
+        location_json: parsed.location_json ?? null,
+        metadata_json: metadataOf(parsed),
+        status: 'pending_upload',
+      });
+
+      const intent = await insertRow(this.deps, tx, 'storageIntents', {
+        evidence_id: evidenceId,
+        idempotency_key: parsed.idempotency_key,
+        local_evidence_id: parsed.local_evidence_id,
+        object_key: objectKey,
+        expires_at: presigned.expiresAt,
+        status: 'pending',
+      });
+
+      return {
+        storage_intent_id: stringOf(intent.id),
+        upload_url: presigned.uploadUrl,
+        expires_at: presigned.expiresAt,
+        evidence_id: evidenceId,
+      };
+    });
+  }
+
+  private presign(
+    parsed: ParsedInput,
+    objectKey: string,
+  ): Promise<{ uploadUrl: string; expiresAt: string }> {
+    const storage = this.deps.evidenceStorage;
+    if (!storage)
+      throw new Error('EvidenceStoragePort não está ligada ao comando');
+    return storage.presignUpload({
+      objectKey,
+      mimeType: parsed.mime_type,
+      sizeBytes: parsed.size_bytes,
+      hashValue: parsed.hash_value,
+    });
+  }
+
+  private async findByIdempotencyKey(
+    tx: unknown,
+    idempotencyKey: string,
+  ): Promise<EvidenceRow | undefined> {
+    const intents = await findRowsWhere(
+      this.deps,
+      tx,
+      'storageIntents',
+      'idempotency_key',
+      idempotencyKey,
+    );
+    return intents[0];
+  }
+
+  /**
+   * §4.1 nota final: `(tenant_id, hash_value)` é único, então um segundo
+   * conteúdo idêntico com outra chave é replay da intenção que já detém o
+   * hash — nunca uma segunda linha.
+   */
+  private async assertHashIsFree(
+    tx: unknown,
+    hashValue: string,
+  ): Promise<void> {
+    const owner = (
+      await findRowsWhere(this.deps, tx, 'evidence', 'hash_value', hashValue)
+    )[0];
+    if (!owner) return;
+    const intents = await findRowsWhere(
+      this.deps,
+      tx,
+      'storageIntents',
+      'evidence_id',
+      owner.id,
+    );
+    throw idempotencyReplay(stringOf(intents[0]?.idempotency_key ?? ''));
+  }
+
+  private async replayOf(
+    tx: unknown,
+    intent: EvidenceRow,
+    parsed: ParsedInput,
+  ): Promise<InitiateUploadResult> {
+    const evidence = await findRow(
+      this.deps,
+      tx,
+      'evidence',
+      stringOf(intent.evidence_id),
+    );
+    if (fingerprintOf(evidence) !== parsed.requestHash)
+      throw idempotencyReplay(parsed.idempotency_key);
+    const presigned = await this.presign(parsed, stringOf(intent.object_key));
+    return {
+      storage_intent_id: stringOf(intent.id),
+      upload_url: presigned.uploadUrl,
+      expires_at: presigned.expiresAt,
+      evidence_id: stringOf(intent.evidence_id),
+    };
+  }
+}
+
+function idempotencyReplay(idempotencyKey: string): DetranError {
+  return new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
+    status: 409,
+    context: { idempotencyKey },
+    message: 'Chave de idempotência já usada com outro pedido.',
+  });
+}
+
+/**
+ * `filename` e a impressão digital do pedido moram em `metadata_json`: a DDL
+ * 17 não tem coluna para nenhum dos dois, e sem a impressão não há como
+ * distinguir "mesma chave, mesmo corpo" de "mesma chave, corpo diferente"
+ * (§4.1). Registrado no relatório de TASK-0007.
+ */
+function metadataOf(parsed: ParsedInput): Record<string, unknown> {
+  return {
+    ...(parsed.metadata_json ?? {}),
+    filename: parsed.filename,
+    upload_request_hash: parsed.requestHash,
+  };
+}
+
+function fingerprintOf(evidence: EvidenceRow | undefined): string {
+  const metadata = evidence?.metadata_json;
+  if (!metadata || typeof metadata !== 'object') return '';
+  return stringOf(
+    (metadata as Record<string, unknown>).upload_request_hash ?? '',
+  );
+}
+
+function parse(input: InitiateUploadInput): ParsedInput {
+  const hashValue = stringOf(input?.hash_value ?? '').trim();
+  if (!hashValue)
+    throw new DetranError('TEAT.EVIDENCE_HASH_REQUIRED', {
+      status: 400,
+      context: { field: 'hash_value' },
+      message: 'O hash do conteúdo é obrigatório na intenção de upload.',
+    });
+
+  const fields: { path: string; rule: string }[] = [];
+  const requireUuid = (path: keyof InitiateUploadInput): void => {
+    const value = stringOf(input[path] ?? '');
+    if (!UUID_PATTERN.test(value)) fields.push({ path, rule: 'uuid' });
+  };
+  const requireText = (
+    path: keyof InitiateUploadInput,
+    maxLength: number,
+  ): void => {
+    const value = stringOf(input[path] ?? '').trim();
+    if (!value || value.length > maxLength)
+      fields.push({ path, rule: 'required' });
+  };
+
+  requireUuid('traffic_agency_id');
+  // Adenda CTG-0003 §12 item 3: a DDL 17 é canônica (`uuid not null`).
+  requireUuid('local_evidence_id');
+  requireUuid('entity_id');
+  requireText('idempotency_key', 160);
+  requireText('entity_type', 80);
+  requireText('evidence_type', 60);
+  requireText('origin', 60);
+  requireText('filename', 180);
+  if (!HASH_PATTERN.test(hashValue))
+    fields.push({ path: 'hash_value', rule: 'pattern' });
+  if (stringOf(input.hash_algorithm ?? '') !== 'sha256')
+    fields.push({ path: 'hash_algorithm', rule: 'enum' });
+  if (
+    !(ALLOWED_MIME_TYPES as readonly string[]).includes(
+      stringOf(input.mime_type),
+    )
+  )
+    fields.push({ path: 'mime_type', rule: 'enum' });
+  const sizeBytes = Number(input.size_bytes);
+  if (
+    !Number.isInteger(sizeBytes) ||
+    sizeBytes < 1 ||
+    sizeBytes > MAX_SIZE_BYTES
+  )
+    fields.push({ path: 'size_bytes', rule: 'range' });
+  if (fields.length > 0) throw validationFailed(fields);
+
+  const parsed: InitiateUploadInput = {
+    ...input,
+    hash_value: hashValue,
+    size_bytes: sizeBytes,
+    captured_at: input.captured_at ? isoOf(input.captured_at) : undefined,
+  };
+  return { ...parsed, requestHash: requestHashOf(parsed) };
+}
+
+function requestHashOf(input: InitiateUploadInput): string {
+  const { idempotency_key: _key, ...rest } = input;
+  return sha256Hex(stableJson(rest));
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/link-evidence.command.ts b/backend/domains/ops/evidence/src/handwritten/link-evidence.command.ts
new file mode 100644
index 0000000..f88f514
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/link-evidence.command.ts
@@ -0,0 +1,126 @@
+// CTG-0003 §4.4 (R-0008, TASK-0007) — `POST /v1/ops/evidence/{id}/links`.
+//
+// `uploaded` avança para `linked`; `validated` permanece `validated` — é
+// estado mais forte (§4.4).
+import {
+  appendEvent,
+  assertEntityApplied,
+  findRow,
+  findRowsWhere,
+  insertRow,
+  inTenantTransaction,
+  nextCustodyVersion,
+  patchRow,
+  quarantined,
+  scopeOf,
+  stateTransitionFailed,
+  stringOf,
+  tenantMismatch,
+  validationFailed,
+  type EvidenceDeps,
+} from './evidence-runtime.js';
+import { evidenceLinkedEvent } from './events.js';
+
+const LINKABLE_STATUSES = ['uploaded', 'validated'] as const;
+
+export interface LinkEvidenceInput {
+  entity_type: string;
+  entity_id: string;
+  role: string;
+  mandatory?: boolean;
+  user_ref?: string;
+}
+
+export interface LinkEvidenceResult {
+  id: string;
+  evidence_id: string;
+  entity_type: string;
+  entity_id: string;
+  role: string;
+  mandatory: boolean;
+}
+
+export class LinkEvidenceCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(
+    evidenceId: string,
+    input: LinkEvidenceInput,
+  ): Promise<LinkEvidenceResult> {
+    const entityType = stringOf(input?.entity_type ?? '').trim();
+    const entityId = stringOf(input?.entity_id ?? '').trim();
+    const role = stringOf(input?.role ?? '').trim();
+    const fields = [
+      ...(entityType ? [] : [{ path: 'entity_type', rule: 'required' }]),
+      ...(entityId ? [] : [{ path: 'entity_id', rule: 'required' }]),
+      ...(role ? [] : [{ path: 'role', rule: 'required' }]),
+    ];
+    if (fields.length > 0) throw validationFailed(fields);
+    const mandatory = input.mandatory === true;
+    const scope = scopeOf(this.deps);
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
+      if (!evidence) throw tenantMismatch({ evidenceId });
+      if (evidence.status === 'quarantined') throw quarantined(evidenceId);
+      await assertEntityApplied(this.deps, tx, entityType, entityId);
+      if (!(LINKABLE_STATUSES as readonly unknown[]).includes(evidence.status))
+        throw stateTransitionFailed();
+
+      const link = await insertRow(this.deps, tx, 'evidenceLinks', {
+        evidence_id: evidenceId,
+        entity_type: entityType,
+        entity_id: entityId,
+        role,
+        mandatory,
+      });
+      if (evidence.status === 'uploaded')
+        await patchRow(this.deps, tx, 'evidence', evidenceId, {
+          status: 'linked',
+        });
+
+      const version = await nextCustodyVersion(this.deps, tx, evidenceId);
+      await insertRow(this.deps, tx, 'custodyEvents', {
+        evidence_id: evidenceId,
+        event_type: 'linked',
+        event_at: scope.occurredAt,
+        user_ref: stringOf(input.user_ref ?? scope.actorId),
+        system_name: 'detran-backend',
+        details_json: { linkId: stringOf(link.id) },
+      });
+
+      const links = await findRowsWhere(
+        this.deps,
+        tx,
+        'evidenceLinks',
+        'evidence_id',
+        evidenceId,
+      );
+      await appendEvent(
+        this.deps,
+        tx,
+        evidenceLinkedEvent(
+          scope,
+          {
+            evidenceId,
+            linkId: stringOf(link.id),
+            entityType,
+            entityId,
+            role,
+            mandatory,
+          },
+          Math.max(links.length, version),
+        ),
+      );
+
+      return {
+        id: stringOf(link.id),
+        evidence_id: evidenceId,
+        entity_type: entityType,
+        entity_id: entityId,
+        role,
+        mandatory,
+      };
+    });
+  }
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/local-evidence-storage.ts b/backend/domains/ops/evidence/src/handwritten/local-evidence-storage.ts
new file mode 100644
index 0000000..6766fcf
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/local-evidence-storage.ts
@@ -0,0 +1,34 @@
+// CTG-0003 §4.1 (M11, R-0008, TASK-0007) — `EvidenceStoragePort` do perfil
+// local/test: devolve `local://<object_key>` e a expiração **da porta**.
+//
+// A janela da intenção é `source_pending` no `parameter-catalogue.md` §TEAT:
+// não há constante de expiração no domínio (M11). Enquanto o parâmetro não
+// existir, o perfil local recebe a janela por configuração explícita de quem
+// monta a porta (`DETRAN_LOCAL_EVIDENCE_UPLOAD_TTL_SECONDS` no wiring do app);
+// sem valor, a porta usa a janela de upload que lhe for passada na construção.
+import type { EvidenceStoragePort } from '@detran/ops-core';
+import type { OpsClock } from '@detran/ops-core';
+
+export interface LocalEvidenceStorageOptions {
+  clock: OpsClock;
+  /** Janela da URL assinada, em segundos — vem do wiring, nunca do domínio. */
+  expiresInSeconds: number;
+}
+
+export class LocalEvidenceStorage implements EvidenceStoragePort {
+  constructor(private readonly options: LocalEvidenceStorageOptions) {}
+
+  async presignUpload(input: {
+    objectKey: string;
+    mimeType: string;
+    sizeBytes: number;
+  }): Promise<{ uploadUrl: string; expiresAt: string }> {
+    const issuedAt = new Date(this.options.clock.now()).getTime();
+    return {
+      uploadUrl: `local://${input.objectKey}`,
+      expiresAt: new Date(
+        issuedAt + this.options.expiresInSeconds * 1000,
+      ).toISOString(),
+    };
+  }
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/manifest.ts b/backend/domains/ops/evidence/src/handwritten/manifest.ts
new file mode 100644
index 0000000..8e89bf7
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/manifest.ts
@@ -0,0 +1,54 @@
+// CTG-0003 §4.6 (M11, R-0008, TASK-0007) — manifesto canônico do pacote
+// probatório. Mesma `stableJson` de `ait-lifecycle.service.ts`: chaves
+// ordenadas recursivamente, sem espaços, para que o `manifest_hash` seja
+// determinístico entre execuções e entre máquinas.
+import { createHash } from 'node:crypto';
+
+export function stableJson(value: unknown): string {
+  return JSON.stringify(sortDeep(value));
+}
+
+function sortDeep(value: unknown): unknown {
+  if (Array.isArray(value)) return value.map((entry) => sortDeep(entry));
+  if (value && typeof value === 'object' && !(value instanceof Date)) {
+    const source = value as Record<string, unknown>;
+    return Object.fromEntries(
+      Object.keys(source)
+        .sort()
+        .map((key) => [key, sortDeep(source[key])]),
+    );
+  }
+  return value;
+}
+
+export function sha256Hex(payload: string): string {
+  return createHash('sha256').update(payload, 'utf8').digest('hex');
+}
+
+/** `'sha256:' + sha256hex(<json canônico>)` (CTG-0003 §3 e §4.6). */
+export function manifestHashOf(manifest: unknown): string {
+  return `sha256:${sha256Hex(stableJson(manifest))}`;
+}
+
+export interface ProbativeManifestItem {
+  sequence: number;
+  evidenceId: string;
+  itemType: string;
+  itemHash: string;
+}
+
+export interface ProbativeManifest {
+  entityType: string;
+  entityId: string;
+  purpose: string;
+  items: ProbativeManifestItem[];
+}
+
+export function probativeManifest(input: ProbativeManifest): ProbativeManifest {
+  return {
+    entityType: input.entityType,
+    entityId: input.entityId,
+    purpose: input.purpose,
+    items: input.items,
+  };
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/purge-unverified.command.ts b/backend/domains/ops/evidence/src/handwritten/purge-unverified.command.ts
new file mode 100644
index 0000000..2406b31
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/purge-unverified.command.ts
@@ -0,0 +1,133 @@
+// CTG-0003 §4.7 (M11, R-0008, TASK-0007) — `POST
+// /v1/ops/evidence/maintenance/purge-expired-unverified`.
+//
+// Bodycam **nunca** é purgada: a retenção é `teat.bodycam.retention_days`,
+// `source_pending` no `parameter-catalogue.md` §TEAT (DT-049). Sem valor não
+// há prazo, e sem prazo não há eliminação (M11).
+import {
+  appendEvent,
+  findRowsWhere,
+  insertRow,
+  inTenantTransaction,
+  isoOf,
+  listRows,
+  nextCustodyVersion,
+  patchRow,
+  scopeOf,
+  stringOf,
+  validationFailed,
+  type EvidenceDeps,
+  type EvidenceRow,
+} from './evidence-runtime.js';
+import { BODYCAM_EVIDENCE_TYPE } from './bodycam-projection.js';
+import { custodyRecordedEvent } from './events.js';
+
+const DEFAULT_BATCH_SIZE = 200;
+const MAX_BATCH_SIZE = 1000;
+
+export interface PurgeUnverifiedInput {
+  limit?: number;
+}
+
+export interface PurgeUnverifiedResult {
+  purged: number;
+  skippedBodycam: number;
+  examined: number;
+}
+
+export class PurgeUnverifiedCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(
+    input: PurgeUnverifiedInput = {},
+  ): Promise<PurgeUnverifiedResult> {
+    const limit = limitOf(input);
+    const scope = scopeOf(this.deps);
+    const now = new Date(scope.occurredAt).getTime();
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const pending = (
+        await findRowsWhere(
+          this.deps,
+          tx,
+          'evidence',
+          'status',
+          'pending_upload',
+        )
+      ).slice(0, limit);
+      const intents = await listRows(this.deps, tx, 'storageIntents');
+
+      let purged = 0;
+      let skippedBodycam = 0;
+      let examined = 0;
+
+      for (const evidence of pending) {
+        const intent = expiredIntentOf(intents, stringOf(evidence.id), now);
+        if (!intent) continue;
+        examined += 1;
+        if (evidence.evidence_type === BODYCAM_EVIDENCE_TYPE) {
+          skippedBodycam += 1;
+          continue;
+        }
+
+        const evidenceId = stringOf(evidence.id);
+        const storageIntentId = stringOf(intent.id);
+        const expiresAt = isoOf(intent.expires_at);
+        await patchRow(this.deps, tx, 'evidence', evidenceId, {
+          status: 'rejected',
+        });
+        await patchRow(this.deps, tx, 'storageIntents', storageIntentId, {
+          status: 'expired',
+        });
+        const version = await nextCustodyVersion(this.deps, tx, evidenceId);
+        const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
+          evidence_id: evidenceId,
+          event_type: 'purged_unverified',
+          event_at: scope.occurredAt,
+          user_ref: scope.actorId,
+          system_name: 'detran-backend',
+          details_json: { storageIntentId, expiresAt },
+        });
+        await appendEvent(
+          this.deps,
+          tx,
+          custodyRecordedEvent(
+            scope,
+            {
+              evidenceId,
+              custodyEventId: stringOf(custodyEvent.id),
+              eventType: 'purged_unverified',
+              eventAt: scope.occurredAt,
+            },
+            version,
+          ),
+        );
+        purged += 1;
+      }
+
+      return { purged, skippedBodycam, examined };
+    });
+  }
+}
+
+function expiredIntentOf(
+  intents: readonly EvidenceRow[],
+  evidenceId: string,
+  now: number,
+): EvidenceRow | undefined {
+  return intents.find(
+    (intent) =>
+      stringOf(intent.evidence_id) === evidenceId &&
+      intent.status === 'pending' &&
+      new Date(isoOf(intent.expires_at)).getTime() < now,
+  );
+}
+
+function limitOf(input: PurgeUnverifiedInput): number {
+  if (input?.limit === undefined || input.limit === null)
+    return DEFAULT_BATCH_SIZE;
+  const limit = Number(input.limit);
+  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_BATCH_SIZE)
+    throw validationFailed([{ path: 'limit', rule: 'range' }]);
+  return limit;
+}
diff --git a/backend/domains/ops/evidence/src/handwritten/validate-evidence.command.spec.ts b/backend/domains/ops/evidence/src/handwritten/validate-evidence.command.spec.ts
new file mode 100644
index 0000000..81db1af
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/validate-evidence.command.spec.ts
@@ -0,0 +1,166 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §4.3 e §10 (R-0008, TASK-0006) — C-0003-09 e a fração de
+ * `validate` de C-0003-08: `POST /v1/ops/evidence/{id}/validate` (M11).
+ * `handwritten/validate-evidence.command.ts` nasce em TASK-0007. Nome
+ * esperado do export: `ValidateEvidenceCommand`, construtor `(deps)`, método
+ * `execute`.
+ *
+ * Canônico: o conjunto persistido `ck_ops_evidence_status` do blueprint
+ * **não tem** o token `invalid` — só `rejected` (CTG-0003 §13 item 6, OD-T33).
+ * `decision='invalid'` grava `status='rejected'`, nunca inventa um token novo.
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const EVIDENCE_UPLOADED = '00000000-0000-7000-8000-0000ef000003';
+const EVIDENCE_QUARANTINED = '00000000-0000-7000-8000-0000ef000004';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: {
+      evidence: repository([
+        {
+          id: EVIDENCE_UPLOADED,
+          tenant_id: TENANT_ID,
+          status: 'uploaded',
+        },
+        {
+          id: EVIDENCE_QUARANTINED,
+          tenant_id: TENANT_ID,
+          status: 'quarantined',
+        },
+      ]),
+      custodyEvents: repository(),
+      ...(overrides.repositories ?? {}),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function validateEvidence(
+  dependencies: Deps,
+  evidenceId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./validate-evidence.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'ops/evidence/src/handwritten/validate-evidence.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.ValidateEvidenceCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'validate-evidence.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'validate-evidence.command.ts não expõe execute|handle|run (CTG-0003 §4.3)',
+    );
+  }
+  return (await (
+    method as (id: string, value: unknown) => Promise<unknown>
+  ).call(command, evidenceId, body)) as Record<string, unknown>;
+}
+
+describe('CTG-0003 §4.3 — validate: decisão e quarentena (C-0003-08b, C-0003-09)', () => {
+  it('C-0003-08b — dada a evidência …ef000004 (quarantined) quando validate então 409 TEAT.EVIDENCE_QUARANTINED, e esse código precede a guarda de estado (uploaded esperado)', async () => {
+    const dependencies = deps();
+    await expect(
+      validateEvidence(dependencies, EVIDENCE_QUARANTINED, {
+        decision: 'valid',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.EVIDENCE_QUARANTINED',
+      status: 409,
+    });
+  });
+
+  it('C-0003-09 — dado validate com decision=invalid então status=rejected — nunca um token invalid, que não existe no check do blueprint', async () => {
+    const dependencies = deps();
+    const response = await validateEvidence(dependencies, EVIDENCE_UPLOADED, {
+      decision: 'invalid',
+      reason: 'hash não confere com o laudo pericial',
+    });
+    expect(response.status).toBe('rejected');
+    expect(response.status).not.toBe('invalid');
+    expect(
+      dependencies.repositories.evidence.rows.find(
+        (row) => row.id === EVIDENCE_UPLOADED,
+      )?.status,
+    ).toBe('rejected');
+  });
+
+  it('dado validate com decision=valid (default) então status=validated', async () => {
+    const dependencies = deps();
+    const response = await validateEvidence(
+      dependencies,
+      EVIDENCE_UPLOADED,
+      {},
+    );
+    expect(response.status).toBe('validated');
+  });
+});
diff --git a/backend/domains/ops/evidence/src/handwritten/validate-evidence.command.ts b/backend/domains/ops/evidence/src/handwritten/validate-evidence.command.ts
new file mode 100644
index 0000000..47a8541
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/validate-evidence.command.ts
@@ -0,0 +1,110 @@
+// CTG-0003 §4.3 (M11, R-0008, TASK-0007) — `POST /v1/ops/evidence/{id}/validate`.
+//
+// `decision` é enum fechado (`valid|invalid`); `invalid` grava `rejected`,
+// porque o check `ck_ops_evidence_status` não tem o token `invalid` (§13
+// item 6, OD-T33). A validação não publica evento de domínio (§11.7): o
+// registro observável é o `custody.event`.
+import {
+  appendEvent,
+  findRow,
+  insertRow,
+  inTenantTransaction,
+  nextCustodyVersion,
+  patchRow,
+  quarantined,
+  scopeOf,
+  stateTransitionFailed,
+  stringOf,
+  tenantMismatch,
+  validationFailed,
+  type EvidenceDeps,
+} from './evidence-runtime.js';
+import { custodyRecordedEvent } from './events.js';
+
+const DECISIONS = ['valid', 'invalid'] as const;
+type Decision = (typeof DECISIONS)[number];
+
+const STATUS_BY_DECISION: Record<Decision, 'validated' | 'rejected'> = {
+  valid: 'validated',
+  invalid: 'rejected',
+};
+
+const CUSTODY_EVENT_BY_DECISION: Record<Decision, 'validated' | 'rejected'> = {
+  valid: 'validated',
+  invalid: 'rejected',
+};
+
+export interface ValidateEvidenceInput {
+  decision?: Decision;
+  reason?: string;
+  user_ref?: string;
+}
+
+export interface ValidateEvidenceResult {
+  id: string;
+  status: 'validated' | 'rejected';
+  custody_event_id: string | null;
+}
+
+export class ValidateEvidenceCommand {
+  constructor(private readonly deps: EvidenceDeps) {}
+
+  async execute(
+    evidenceId: string,
+    input: ValidateEvidenceInput = {},
+  ): Promise<ValidateEvidenceResult> {
+    const decision = (input?.decision ?? 'valid') as Decision;
+    if (!DECISIONS.includes(decision))
+      throw validationFailed([{ path: 'decision', rule: 'enum' }]);
+    const scope = scopeOf(this.deps);
+    const target = STATUS_BY_DECISION[decision];
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
+      if (!evidence) throw tenantMismatch({ evidenceId });
+      if (evidence.status === 'quarantined') throw quarantined(evidenceId);
+
+      // Idempotência: repetir a mesma decisão sobre a evidência que já a
+      // carrega não é transição nenhuma, e por isso não é 422 (§4.3 trata
+      // `validate` como decisão registrada, não como avanço obrigatório).
+      if (evidence.status === target)
+        return { id: evidenceId, status: target, custody_event_id: null };
+
+      if (evidence.status !== 'uploaded') throw stateTransitionFailed();
+
+      await patchRow(this.deps, tx, 'evidence', evidenceId, {
+        status: target,
+      });
+      const version = await nextCustodyVersion(this.deps, tx, evidenceId);
+      const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
+        evidence_id: evidenceId,
+        event_type: CUSTODY_EVENT_BY_DECISION[decision],
+        event_at: scope.occurredAt,
+        user_ref: stringOf(input.user_ref ?? scope.actorId),
+        system_name: 'detran-backend',
+        details_json: { reason: input.reason ?? null },
+      });
+
+      await appendEvent(
+        this.deps,
+        tx,
+        custodyRecordedEvent(
+          scope,
+          {
+            evidenceId,
+            custodyEventId: stringOf(custodyEvent.id),
+            eventType: CUSTODY_EVENT_BY_DECISION[decision],
+            eventAt: scope.occurredAt,
+          },
+          version,
+        ),
+      );
+
+      return {
+        id: evidenceId,
+        status: target,
+        custody_event_id: stringOf(custodyEvent.id),
+      };
+    });
+  }
+}
diff --git a/backend/domains/ops/evidence/tests/integration/complete-upload.integration.spec.ts b/backend/domains/ops/evidence/tests/integration/complete-upload.integration.spec.ts
new file mode 100644
index 0000000..8ac91b7
--- /dev/null
+++ b/backend/domains/ops/evidence/tests/integration/complete-upload.integration.spec.ts
@@ -0,0 +1,148 @@
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  commandDeps,
+  dropTenant,
+  FIXTURES,
+  importModule,
+  isolatedTenant,
+  newClient,
+  outboxEnvelopes,
+  runCommand,
+  seedPendingEvidence,
+} from './harness.js';
+
+/**
+ * CTG-0003 §4.2 e §10 (R-0008, TASK-0006) — C-0003-29…30: `complete-upload`
+ * grava `evidence`, `evidence_custody_event` e `evidence_link` na mesma
+ * transação e publica os dois envelopes `EVIDENCIA_CAPTURADA`/`EVIDENCIA_VINCULADA`
+ * na outbox (M16). Tenant isolado (`rait-test-strategy.md` §6): a evidência
+ * pendente é criada só para este arquivo, nunca a fixture compartilhada.
+ */
+
+const COMMAND_EXPORTS = [
+  'CompleteUploadCommand',
+  'CompleteEvidenceUploadCommand',
+];
+const COMMAND_METHODS = ['execute', 'handle', 'run'];
+
+const client: pg.Client = newClient();
+let tenantId: string;
+let actorId: string;
+let startedAt: string;
+
+beforeAll(async () => {
+  await client.connect();
+  const isolated = await isolatedTenant(client, 'ops-evidence-complete-upload');
+  tenantId = isolated.tenantId;
+  actorId = isolated.actorId;
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+});
+
+afterAll(async () => {
+  await dropTenant(client, tenantId);
+  await client.end();
+});
+
+describe('CTG-0003 §4.2 — complete-upload: transação única e outbox (C-0003-29…30)', () => {
+  it('C-0003-29 — dado complete-upload então, na mesma transação, existem status=uploaded, evidence_custody_event e evidence_link', async () => {
+    const seeded = await seedPendingEvidence(
+      client,
+      tenantId,
+      actorId,
+      FIXTURES.agencyId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId);
+    await runCommand(
+      () => importModule('../../src/handwritten/complete-upload.command.js'),
+      'ops/evidence/src/handwritten/complete-upload.command.ts',
+      COMMAND_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      seeded.evidenceId,
+      {
+        storage_intent_id: seeded.storageIntentId,
+        idempotency_key: `complete-${seeded.evidenceId.slice(0, 8)}`,
+        entity_type: 'ait',
+        entity_id: FIXTURES.aitIntegrado,
+        accepted_hash: seeded.hashValue,
+      },
+    );
+    const evidence = await dependencies.repositories.evidence.find(
+      seeded.evidenceId,
+    );
+    expect(evidence?.status).toBe('uploaded');
+    const custodyEvents = await dependencies.repositories.custodyEvents.list();
+    expect(
+      custodyEvents.some(
+        (event) =>
+          event.evidence_id === seeded.evidenceId &&
+          event.event_type === 'uploaded',
+      ),
+    ).toBe(true);
+    const links = await dependencies.repositories.evidenceLinks.list();
+    expect(
+      links.some(
+        (link) =>
+          link.evidence_id === seeded.evidenceId &&
+          link.entity_id === FIXTURES.aitIntegrado,
+      ),
+    ).toBe(true);
+  });
+
+  it('C-0003-30 — dado complete-upload então saem dois envelopes na outbox, EVIDENCIA_CAPTURADA e EVIDENCIA_VINCULADA', async () => {
+    const seeded = await seedPendingEvidence(
+      client,
+      tenantId,
+      actorId,
+      FIXTURES.agencyId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: {
+        append: async (
+          tx: unknown,
+          envelope: Record<string, unknown>,
+        ): Promise<{ id: string }> => {
+          await client.query(
+            `insert into integration.outbox
+               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+             values ($1, $2, $3, $4, $5, $6)
+             on conflict (tenant_id, idempotency_key) do nothing
+             returning id`,
+            [
+              tenantId,
+              envelope.type,
+              (envelope.aggregate as { kind: string }).kind,
+              (envelope.aggregate as { id: string }).id,
+              JSON.stringify(envelope),
+              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+            ],
+          );
+          return { id: 'ignored' };
+        },
+      },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/complete-upload.command.js'),
+      'ops/evidence/src/handwritten/complete-upload.command.ts',
+      COMMAND_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      seeded.evidenceId,
+      {
+        storage_intent_id: seeded.storageIntentId,
+        idempotency_key: `complete-${seeded.evidenceId.slice(0, 8)}`,
+        entity_type: 'ait',
+        entity_id: FIXTURES.aitIntegrado,
+        accepted_hash: seeded.hashValue,
+      },
+    );
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    const domainEvents = envelopes.map((envelope) => envelope.domainEvent);
+    expect(domainEvents).toContain('EVIDENCIA_CAPTURADA');
+    expect(domainEvents).toContain('EVIDENCIA_VINCULADA');
+  });
+});
diff --git a/backend/domains/ops/evidence/tests/integration/deliver-access-request.integration.spec.ts b/backend/domains/ops/evidence/tests/integration/deliver-access-request.integration.spec.ts
new file mode 100644
index 0000000..e329480
--- /dev/null
+++ b/backend/domains/ops/evidence/tests/integration/deliver-access-request.integration.spec.ts
@@ -0,0 +1,140 @@
+import { randomUUID } from 'node:crypto';
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  commandDeps,
+  dropTenant,
+  FIXTURES,
+  importModule,
+  isolatedTenant,
+  newClient,
+  outboxEnvelopes,
+  runCommand,
+} from './harness.js';
+
+/**
+ * CTG-0003 §4.11 e §10 (R-0008, TASK-0006) — C-0003-33: `deliver` leva a
+ * requisição de acesso a `delivered` com `delivery_media_ref`/`delivered_at`
+ * (o check `ck_ops_evidence_access_delivered_complete` não é violado) e
+ * publica `CUSTODIA_EVENTO` com `eventType='access_delivered'`.
+ */
+
+const COMMAND_EXPORTS = ['DeliverAccessRequestCommand'];
+const COMMAND_METHODS = ['execute', 'handle', 'run'];
+
+const client: pg.Client = newClient();
+let tenantId: string;
+let actorId: string;
+let startedAt: string;
+
+beforeAll(async () => {
+  await client.connect();
+  const isolated = await isolatedTenant(
+    client,
+    'ops-evidence-deliver-access-request',
+  );
+  tenantId = isolated.tenantId;
+  actorId = isolated.actorId;
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+});
+
+afterAll(async () => {
+  await dropTenant(client, tenantId);
+  await client.end();
+});
+
+async function seedApprovedRequest(): Promise<{
+  evidenceId: string;
+  accessRequestId: string;
+}> {
+  const evidenceId = randomUUID();
+  const accessRequestId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.evidence_evidence
+       (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri,
+        mime_type, size_bytes, hash_algorithm, hash_value, captured_at, status)
+     values ($1, $2, $3, 'bodycam', 'campo', $4, 'video/mp4', 5242880, 'sha256', $5,
+             '2026-09-10T10:00:00-04:00', 'validated')`,
+    [
+      evidenceId,
+      tenantId,
+      FIXTURES.agencyId,
+      `evidence/${tenantId}/${evidenceId}`,
+      `sha256:${evidenceId.replace(/-/g, '').padEnd(64, '0')}`,
+    ],
+  );
+  await client.query(
+    `insert into ops.evidence_access_request
+       (id, tenant_id, evidence_id, requester_name, requester_role,
+        investigation_ref, purpose, legal_basis, status, decided_by_user_ref)
+     values ($1, $2, $3, 'Requerente Fixture', 'magistrado',
+             'INV-0099', 'instrucao', 'Art. 13', 'approved', $4)`,
+    [accessRequestId, tenantId, evidenceId, actorId],
+  );
+  return { evidenceId, accessRequestId };
+}
+
+describe('CTG-0003 §4.11 — deliver: estado, checks e CUSTODIA_EVENTO (C-0003-33)', () => {
+  it('C-0003-33 — dado deliver então a linha vai a delivered com delivery_media_ref e delivered_at, e sai CUSTODIA_EVENTO com eventType=access_delivered', async () => {
+    const seeded = await seedApprovedRequest();
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: {
+        append: async (
+          _tx: unknown,
+          envelope: Record<string, unknown>,
+        ): Promise<{ id: string }> => {
+          await client.query(
+            `insert into integration.outbox
+               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+             values ($1, $2, $3, $4, $5, $6)
+             on conflict (tenant_id, idempotency_key) do nothing`,
+            [
+              tenantId,
+              envelope.type,
+              (envelope.aggregate as { kind: string }).kind,
+              (envelope.aggregate as { id: string }).id,
+              JSON.stringify(envelope),
+              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+            ],
+          );
+          return { id: 'ignored' };
+        },
+      },
+    });
+
+    await runCommand(
+      () =>
+        importModule('../../src/handwritten/deliver-access-request.command.js'),
+      'ops/evidence/src/handwritten/deliver-access-request.command.ts',
+      COMMAND_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      seeded.accessRequestId,
+      { delivery_media_ref: 'DVD-0099-2026' },
+    );
+
+    const row = await dependencies.repositories.accessRequests.find(
+      seeded.accessRequestId,
+    );
+    expect(row?.status).toBe('delivered');
+    expect(row?.delivery_media_ref).toBe('DVD-0099-2026');
+    expect(row?.delivered_at).toBeTruthy();
+
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    expect(
+      envelopes.some(
+        (envelope) =>
+          envelope.domainEvent === 'CUSTODIA_EVENTO' &&
+          (envelope.data as { eventType?: string })?.eventType ===
+            'access_delivered',
+      ),
+    ).toBe(true);
+  });
+});
diff --git a/backend/domains/ops/evidence/tests/integration/generate-probative-package.integration.spec.ts b/backend/domains/ops/evidence/tests/integration/generate-probative-package.integration.spec.ts
new file mode 100644
index 0000000..554b1ff
--- /dev/null
+++ b/backend/domains/ops/evidence/tests/integration/generate-probative-package.integration.spec.ts
@@ -0,0 +1,136 @@
+import { randomUUID } from 'node:crypto';
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  commandDeps,
+  dropTenant,
+  FIXTURES,
+  importModule,
+  isolatedTenant,
+  newClient,
+  runCommand,
+} from './harness.js';
+
+/**
+ * CTG-0003 §4.6 e §10 (R-0008, TASK-0006) — C-0003-31:
+ * `probative-packages/generate` com três evidências: `sequence` 1..3 na
+ * ordem `captured_at asc, id asc`, `manifest_hash` cobrindo os três
+ * `item_hash`, e as três evidências passam a `packaged`.
+ */
+
+const COMMAND_EXPORTS = [
+  'GenerateProbativePackageCommand',
+  'GenerateProbativePackage',
+];
+const COMMAND_METHODS = ['execute', 'handle', 'run'];
+
+const client: pg.Client = newClient();
+let tenantId: string;
+let actorId: string;
+
+beforeAll(async () => {
+  await client.connect();
+  const isolated = await isolatedTenant(
+    client,
+    'ops-evidence-generate-probative-package',
+  );
+  tenantId = isolated.tenantId;
+  actorId = isolated.actorId;
+});
+
+afterAll(async () => {
+  await dropTenant(client, tenantId);
+  await client.end();
+});
+
+async function seedValidatedEvidence(
+  capturedAt: string,
+  entityId: string,
+): Promise<string> {
+  const evidenceId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.evidence_evidence
+       (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri,
+        mime_type, size_bytes, hash_algorithm, hash_value, captured_at, status)
+     values ($1, $2, $3, 'foto', 'campo', $4, 'image/jpeg', 204800, 'sha256', $5,
+             $6, 'validated')`,
+    [
+      evidenceId,
+      tenantId,
+      FIXTURES.agencyId,
+      `evidence/${tenantId}/${evidenceId}`,
+      `sha256:${evidenceId.replace(/-/g, '').padEnd(64, '0')}`,
+      capturedAt,
+    ],
+  );
+  await client.query(
+    `insert into ops.evidence_link (id, tenant_id, evidence_id, entity_type, entity_id, role, mandatory)
+     values ($1, $2, $3, 'ait', $4, 'foto', false)`,
+    [randomUUID(), tenantId, evidenceId, entityId],
+  );
+  return evidenceId;
+}
+
+describe('CTG-0003 §4.6 — probative-packages/generate: ordem e efeito (C-0003-31)', () => {
+  it('C-0003-31 — dado probative-packages/generate com três evidências então sequence 1,2,3 na ordem captured_at asc, manifest_hash cobre os três item_hash e as três evidências passam a packaged', async () => {
+    const entityId = randomUUID();
+    const evidenceLatest = await seedValidatedEvidence(
+      '2026-09-12T10:00:00-04:00',
+      entityId,
+    );
+    const evidenceEarliest = await seedValidatedEvidence(
+      '2026-09-10T10:00:00-04:00',
+      entityId,
+    );
+    const evidenceMiddle = await seedValidatedEvidence(
+      '2026-09-11T10:00:00-04:00',
+      entityId,
+    );
+
+    const dependencies = commandDeps(client, tenantId, actorId);
+    const response = await runCommand(
+      () =>
+        importModule(
+          '../../src/handwritten/generate-probative-package.command.js',
+        ),
+      'ops/evidence/src/handwritten/generate-probative-package.command.ts',
+      COMMAND_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      {
+        traffic_agency_id: FIXTURES.agencyId,
+        entity_type: 'ait',
+        entity_id: entityId,
+        generated_by_user_ref: actorId,
+        purpose: 'instrucao-processual',
+      },
+    );
+
+    expect(response.manifest_hash).toEqual(expect.stringMatching(/^sha256:/));
+    const items = (response.items ?? []) as Array<{
+      sequence: number;
+      evidence_id: string;
+    }>;
+    expect(items.map((item) => item.sequence)).toEqual([1, 2, 3]);
+    expect(items.map((item) => item.evidence_id)).toEqual([
+      evidenceEarliest,
+      evidenceMiddle,
+      evidenceLatest,
+    ]);
+
+    for (const evidenceId of [
+      evidenceEarliest,
+      evidenceMiddle,
+      evidenceLatest,
+    ]) {
+      const evidence =
+        await dependencies.repositories.evidence.find(evidenceId);
+      expect(evidence?.status).toBe('packaged');
+    }
+  });
+});
diff --git a/backend/domains/ops/evidence/tests/integration/harness.ts b/backend/domains/ops/evidence/tests/integration/harness.ts
new file mode 100644
index 0000000..5da06ee
--- /dev/null
+++ b/backend/domains/ops/evidence/tests/integration/harness.ts
@@ -0,0 +1,360 @@
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { vi } from 'vitest';
+
+/**
+ * Harness de integração de `@detran/ops-evidence` (R-0008, TASK-0006,
+ * CTG-0003 §10). Não é um arquivo de teste: `vitest.config.ts` inclui só
+ * `tests/integration/**\/*.integration.spec.ts`. Padrão herdado de
+ * `backend/domains/ops/offline-sync/tests/integration/harness.ts` (TASK-0004).
+ */
+const { Client } = pg;
+
+export const CONNECTION_STRING =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+
+/** Tenant e ids canônicos das fixtures (00/10/25/26/27-fixtures-*.sql). */
+export const FIXTURES = {
+  tenantId: '00000000-0000-7000-8000-00000000a001',
+  agencyId: '00000000-0000-7000-8000-0000e2000001',
+  actorId: '00000000-0000-4000-8000-0000b0000001',
+  aitIntegrado: '00000000-0000-7000-8000-0000f0000001',
+  evidenceBodycamValidated: '00000000-0000-7000-8000-0000ef000001',
+  evidencePendingUpload: '00000000-0000-7000-8000-0000ef000002',
+  evidenceUploaded: '00000000-0000-7000-8000-0000ef000003',
+  evidenceQuarantined: '00000000-0000-7000-8000-0000ef000004',
+  storageIntentExpired: '00000000-0000-7000-8000-0000ef100001',
+  storageIntentValid: '00000000-0000-7000-8000-0000ef100002',
+  accessRequestRequested: '00000000-0000-7000-8000-0000ef400001',
+  accessRequestApproved: '00000000-0000-7000-8000-0000ef400002',
+} as const;
+
+export const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+export function newClient(): pg.Client {
+  return new Client({ connectionString: CONNECTION_STRING });
+}
+
+/** `Database`-like do STYNX: transação com `role_app_backend` e contexto de tenant. */
+export function database(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+): { tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> } {
+  return {
+    async tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> {
+      await client.query('begin');
+      try {
+        await client.query('set local role role_app_backend');
+        await client.query(`select set_config('app.tenant_id', $1, true)`, [
+          tenantId,
+        ]);
+        await client.query(`select set_config('app.actor_id', $1, true)`, [
+          actorId,
+        ]);
+        const result = await work({ query: client.query.bind(client) });
+        await client.query('commit');
+        return result;
+      } catch (error) {
+        await client.query('rollback');
+        throw error;
+      }
+    },
+  };
+}
+
+export function requestContext(tenantId: string, actorId: string) {
+  return {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId }),
+  };
+}
+
+interface SqlTransaction {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+export class SqlOpsRepository {
+  constructor(
+    private readonly db: ReturnType<typeof database>,
+    private readonly table: string,
+  ) {
+    if (!/^ops\.[a-z_]+$/.test(table)) throw new Error(`Unsafe table ${table}`);
+  }
+
+  list(): Promise<Record<string, unknown>[]> {
+    return this.db.tx(
+      async (tx) =>
+        (
+          await (tx as SqlTransaction).query(
+            `select * from ${this.table} order by created_at desc`,
+          )
+        ).rows,
+    );
+  }
+
+  find(id: string): Promise<Record<string, unknown> | undefined> {
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `select * from ${this.table} where id = $1`,
+        [id],
+      );
+      return result.rows[0];
+    });
+  }
+
+  findOne(id: string): Promise<Record<string, unknown> | undefined> {
+    return this.find(id);
+  }
+
+  create(values: Record<string, unknown>): Promise<Record<string, unknown>> {
+    const entries = Object.entries(values);
+    const columns = entries.map(([key]) => key);
+    if (columns.some((key) => !/^[a-z_]+$/.test(key)))
+      throw new Error('Invalid ops write field');
+    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `insert into ${this.table} (${columns.join(', ')}) values (${placeholders}) returning *`,
+        entries.map(([, value]) => value),
+      );
+      return result.rows[0] as Record<string, unknown>;
+    });
+  }
+
+  update(
+    id: string,
+    patch: Record<string, unknown>,
+  ): Promise<Record<string, unknown> | undefined> {
+    const entries = Object.entries(patch);
+    const assignments = entries
+      .map(([key], index) => `${key} = $${index + 2}`)
+      .join(', ');
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `update ${this.table} set ${assignments} where id = $1 returning *`,
+        [id, ...entries.map(([, value]) => value)],
+      );
+      return result.rows[0];
+    });
+  }
+}
+
+export function repositories(db: ReturnType<typeof database>) {
+  return {
+    evidence: new SqlOpsRepository(db, 'ops.evidence_evidence'),
+    storageIntents: new SqlOpsRepository(db, 'ops.storage_intent'),
+    evidenceLinks: new SqlOpsRepository(db, 'ops.evidence_link'),
+    custodyEvents: new SqlOpsRepository(db, 'ops.evidence_custody_event'),
+    probativePackages: new SqlOpsRepository(
+      db,
+      'ops.evidence_probative_package',
+    ),
+    probativePackageItems: new SqlOpsRepository(
+      db,
+      'ops.evidence_probative_package_item',
+    ),
+    accessRequests: new SqlOpsRepository(db, 'ops.evidence_access_request'),
+  };
+}
+
+/**
+ * Dependências do comando. **Proposta do Inspector, não valor canônico**
+ * (mesmo precedente de `offline-sync/tests/integration/harness.ts`).
+ */
+export function commandDeps(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+  overrides: Record<string, unknown> = {},
+) {
+  const db = database(client, tenantId, actorId);
+  return {
+    database: db,
+    requestContext: requestContext(tenantId, actorId),
+    repositories: repositories(db),
+    appliedEntityPorts: [
+      { entityType: 'ait', isApplied: vi.fn(async () => true) },
+    ],
+    evidenceStorage: {
+      presignUpload: vi.fn(async (input: { objectKey: string }) => ({
+        uploadUrl: `local://${input.objectKey}`,
+        expiresAt: '2027-01-01T00:00:00.000Z',
+      })),
+    },
+    outbox: { append: vi.fn(async () => ({ id: randomUUID() })) },
+    clock: { now: () => new Date().toISOString() },
+    ...overrides,
+  };
+}
+
+export async function runCommand(
+  load: () => Promise<unknown>,
+  label: string,
+  exportNames: readonly string[],
+  methodNames: readonly string[],
+  dependencies: unknown,
+  ...args: unknown[]
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await load()) as Record<string, unknown>;
+  } catch (cause) {
+    throw new Error(`${label} ainda não existe (TASK-0007, CTG-0003 §11)`, {
+      cause,
+    });
+  }
+  const exported =
+    exportNames
+      .map((name) => loaded[name])
+      .find((value) => typeof value === 'function') ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function')
+    throw new Error(`${label} não exporta nada construtível`);
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const instance = new Command(dependencies);
+  const method = methodNames
+    .map((name) => instance[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function')
+    throw new Error(`${label} não expõe nenhum de ${methodNames.join('|')}`);
+  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
+    instance,
+    ...args,
+  )) as Record<string, unknown>;
+}
+
+/**
+ * Tenant isolado por arquivo. Precedente sancionado por
+ * `rait-test-strategy.md` §6 ("só para isolamento de tenant em integration")
+ * e já usado por `offline-sync/tests/integration/harness.ts`: as fixtures
+ * compartilhadas (`27-fixtures-teat-evidence.sql`) nunca são mutadas por um
+ * teste de integração.
+ */
+export async function isolatedTenant(
+  client: pg.Client,
+  slug: string,
+): Promise<{ tenantId: string; actorId: string }> {
+  const tenantId = randomUUID();
+  const actorId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
+    [
+      tenantId,
+      `${slug}-${tenantId.slice(0, 8)}`,
+      `${slug} ${tenantId.slice(0, 8)}`,
+    ],
+  );
+  await client.query(
+    `insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'Actor')`,
+    [actorId, tenantId, `${actorId}@test.invalid`],
+  );
+  await client.query(
+    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
+     on conflict (tenant_id, user_id) do update set is_active = true`,
+    [tenantId, actorId],
+  );
+  return { tenantId, actorId };
+}
+
+export async function dropTenant(
+  client: pg.Client,
+  tenantId: string,
+): Promise<void> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  for (const table of [
+    'ops.evidence_probative_package_item',
+    'ops.evidence_probative_package',
+    'ops.evidence_access_request',
+    'ops.evidence_custody_event',
+    'ops.evidence_link',
+    'ops.storage_intent',
+    'ops.evidence_evidence',
+    'integration.outbox',
+  ]) {
+    await client.query(`delete from ${table} where tenant_id = $1`, [tenantId]);
+  }
+  await client.query('delete from auth.memberships where tenant_id = $1', [
+    tenantId,
+  ]);
+  await client.query('delete from auth.users where tenant_id = $1', [tenantId]);
+  await client.query('delete from auth.tenants where id = $1', [tenantId]);
+}
+
+/** Uma evidência `pending_upload` com `storage_intent` vigente, no tenant isolado. */
+export async function seedPendingEvidence(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+  agencyId: string,
+  overrides: {
+    hashValue?: string;
+    expiresAt?: string;
+  } = {},
+): Promise<{ evidenceId: string; storageIntentId: string; hashValue: string }> {
+  const evidenceId = randomUUID();
+  const storageIntentId = randomUUID();
+  const hashValue =
+    overrides.hashValue ??
+    `sha256:${randomUUID().replace(/-/g, '').padEnd(64, '0')}`;
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.evidence_evidence
+       (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri,
+        mime_type, size_bytes, hash_algorithm, hash_value, captured_by_user_ref,
+        captured_at, status)
+     values ($1, $2, $3, 'foto', 'campo', $4, 'image/jpeg', 204800, 'sha256', $5, $6,
+             '2026-09-14T09:00:00-04:00', 'pending_upload')`,
+    [
+      evidenceId,
+      tenantId,
+      agencyId,
+      `evidence/${tenantId}/${evidenceId}`,
+      hashValue,
+      actorId,
+    ],
+  );
+  await client.query(
+    `insert into ops.storage_intent
+       (id, tenant_id, evidence_id, idempotency_key, local_evidence_id,
+        object_key, expires_at, status)
+     values ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
+    [
+      storageIntentId,
+      tenantId,
+      evidenceId,
+      `intent-${storageIntentId.slice(0, 8)}`,
+      randomUUID(),
+      `evidence/${tenantId}/${evidenceId}`,
+      overrides.expiresAt ?? '2027-01-01T00:00:00-04:00',
+    ],
+  );
+  return { evidenceId, storageIntentId, hashValue };
+}
+
+export async function outboxEnvelopes(
+  client: pg.Client,
+  tenantId: string,
+  since: string,
+): Promise<Record<string, unknown>[]> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const result = await client.query<{ payload: Record<string, unknown> }>(
+    `select payload from integration.outbox
+      where tenant_id = $1 and created_at >= $2
+      order by created_at, id`,
+    [tenantId, since],
+  );
+  return result.rows.map((row) => row.payload);
+}
diff --git a/backend/domains/ops/evidence/tests/integration/purge-unverified.integration.spec.ts b/backend/domains/ops/evidence/tests/integration/purge-unverified.integration.spec.ts
new file mode 100644
index 0000000..8f6bdb1
--- /dev/null
+++ b/backend/domains/ops/evidence/tests/integration/purge-unverified.integration.spec.ts
@@ -0,0 +1,126 @@
+import { randomUUID } from 'node:crypto';
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  commandDeps,
+  dropTenant,
+  FIXTURES,
+  importModule,
+  isolatedTenant,
+  newClient,
+  runCommand,
+  seedPendingEvidence,
+} from './harness.js';
+
+/**
+ * CTG-0003 §4.7 e §10 (R-0008, TASK-0006) — C-0003-32:
+ * `purge-expired-unverified` leva a foto `pending_upload` com intenção
+ * vencida a `rejected` + `custody_event('purged_unverified')`, e **nunca**
+ * purga bodycam (`teat.bodycam.retention_days` `source_pending`, M11).
+ */
+
+const COMMAND_EXPORTS = [
+  'PurgeUnverifiedCommand',
+  'PurgeExpiredUnverifiedCommand',
+];
+const COMMAND_METHODS = ['execute', 'handle', 'run'];
+
+const client: pg.Client = newClient();
+let tenantId: string;
+let actorId: string;
+
+beforeAll(async () => {
+  await client.connect();
+  const isolated = await isolatedTenant(
+    client,
+    'ops-evidence-purge-unverified',
+  );
+  tenantId = isolated.tenantId;
+  actorId = isolated.actorId;
+});
+
+afterAll(async () => {
+  await dropTenant(client, tenantId);
+  await client.end();
+});
+
+async function seedExpiredBodycam(): Promise<string> {
+  const evidenceId = randomUUID();
+  const storageIntentId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.evidence_evidence
+       (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri,
+        mime_type, size_bytes, hash_algorithm, hash_value, captured_at, status)
+     values ($1, $2, $3, 'bodycam', 'campo', $4, 'video/mp4', 5242880, 'sha256', $5,
+             '2026-08-01T09:00:00-04:00', 'pending_upload')`,
+    [
+      evidenceId,
+      tenantId,
+      FIXTURES.agencyId,
+      `evidence/${tenantId}/${evidenceId}`,
+      `sha256:${evidenceId.replace(/-/g, '').padEnd(64, '0')}`,
+    ],
+  );
+  await client.query(
+    `insert into ops.storage_intent
+       (id, tenant_id, evidence_id, idempotency_key, local_evidence_id,
+        object_key, expires_at, status)
+     values ($1, $2, $3, $4, $5, $6, '2026-08-15T00:00:00-04:00', 'pending')`,
+    [
+      storageIntentId,
+      tenantId,
+      evidenceId,
+      `intent-${storageIntentId.slice(0, 8)}`,
+      randomUUID(),
+      `evidence/${tenantId}/${evidenceId}`,
+    ],
+  );
+  return evidenceId;
+}
+
+describe('CTG-0003 §4.7 — purge-expired-unverified: foto purgada, bodycam preservada (C-0003-32)', () => {
+  it('C-0003-32 — dado uma foto pending_upload com intenção vencida e uma bodycam também pending_upload com intenção vencida então a foto vai a rejected com custody_event(purged_unverified) e a bodycam permanece pending_upload (skippedBodycam: 1)', async () => {
+    const photo = await seedPendingEvidence(
+      client,
+      tenantId,
+      actorId,
+      FIXTURES.agencyId,
+      { expiresAt: '2026-08-15T00:00:00-04:00' },
+    );
+    const bodycamId = await seedExpiredBodycam();
+
+    const dependencies = commandDeps(client, tenantId, actorId);
+    const response = await runCommand(
+      () => importModule('../../src/handwritten/purge-unverified.command.js'),
+      'ops/evidence/src/handwritten/purge-unverified.command.ts',
+      COMMAND_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      {},
+    );
+
+    expect(response.skippedBodycam).toBeGreaterThanOrEqual(1);
+    expect(response.purged).toBeGreaterThanOrEqual(1);
+
+    const photoRow = await dependencies.repositories.evidence.find(
+      photo.evidenceId,
+    );
+    expect(photoRow?.status).toBe('rejected');
+    const custodyEvents = await dependencies.repositories.custodyEvents.list();
+    expect(
+      custodyEvents.some(
+        (event) =>
+          event.evidence_id === photo.evidenceId &&
+          event.event_type === 'purged_unverified',
+      ),
+    ).toBe(true);
+
+    const bodycamRow = await dependencies.repositories.evidence.find(bodycamId);
+    expect(bodycamRow?.status).toBe('pending_upload');
+  });
+});
diff --git a/backend/domains/ops/snapshots/src/handwritten/events.ts b/backend/domains/ops/snapshots/src/handwritten/events.ts
new file mode 100644
index 0000000..94fd523
--- /dev/null
+++ b/backend/domains/ops/snapshots/src/handwritten/events.ts
@@ -0,0 +1,51 @@
+// CTG-0003 §5.1 e §11.7 (M16, R-0008, TASK-0007) — a consulta externa **não**
+// publica evento nesta rodada: o route contract §8 não nomeia token de
+// consulta (OD-T21, ratificada na adenda §13). O arquivo existe porque §11 o
+// lista no layout do módulo e é onde o envelope entra quando o token for
+// decidido.
+//
+// O molde do envelope (`backend/domains/inf/ait/src/handwritten/events.ts`,
+// `additionalProperties: false` ⇒ `strictObject`) já fica montado aqui, de
+// modo que declarar o primeiro evento do grupo seja só acrescentar o `data` e
+// a entrada no mapa — nenhum token é inventado antes da decisão.
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+
+const actor = z.strictObject({
+  kind: z.enum(['user', 'system', 'timer']),
+  id: z.string(),
+  role: z.string().optional(),
+});
+
+export function snapshotEnvelopeSchema<Data extends ZodType>(
+  type: string,
+  domainEvent: string,
+  aggregateKind: string,
+  data: Data,
+) {
+  return z.strictObject({
+    id: z.string(),
+    type: z.literal(type),
+    domainEvent: z.literal(domainEvent),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.string(),
+    actor,
+    correlationId: z.string(),
+    causationId: z.string().optional(),
+    aggregate: z.strictObject({
+      kind: z.literal(aggregateKind),
+      id: z.string(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+/** Nenhum `type` SSE reservado para consultas externas nesta rodada (§11.7). */
+export const SNAPSHOT_EVENT_TYPES = [] as const;
+
+export type SnapshotEventType = (typeof SNAPSHOT_EVENT_TYPES)[number];
+
+/** Vazio por decisão de contrato, não por omissão (§8 não nomeia o token). */
+export const SNAPSHOT_EVENT_SCHEMAS: Record<string, ZodType> = {};
diff --git a/backend/domains/ops/snapshots/src/handwritten/external-query.command.spec.ts b/backend/domains/ops/snapshots/src/handwritten/external-query.command.spec.ts
new file mode 100644
index 0000000..045b3be
--- /dev/null
+++ b/backend/domains/ops/snapshots/src/handwritten/external-query.command.spec.ts
@@ -0,0 +1,319 @@
+import { describe, expect, it, vi } from 'vitest';
+
+/**
+ * CTG-0003 §5.1/§5.2 e §10 (R-0008, TASK-0006) — C-0003-15…19: `POST/GET
+ * /v1/ops/snapshots/external-queries` (M12). `handwritten/external-query.command.ts`
+ * nasce em TASK-0007 (CTG-0003 §11). Nome esperado do export:
+ * `ExternalQueryCommand`, construtor `(deps)`, métodos `execute` (create) e
+ * `list` (leitura).
+ *
+ * Canônico (CTG-0003 §5.1, ADR-0003): as portas `WsdenatranReadPort`/`RenachPort`
+ * chegam por `SNAPSHOT_QUERY_PORTS`; nenhum `fetch` sai daqui — o stub prova
+ * (C-0003-35, em `tests/integration/`). Fixtures: `snapshots_vehicle`
+ * `…ef600001` (plate `BRA2E19`, `make_model='Fixture Sedan 1.6'`).
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const VEHICLE_ID = '00000000-0000-7000-8000-0000ef600001';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    list: vi.fn(async () => [...store]),
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findBy: vi.fn(
+      async (predicate: (row: Record<string, unknown>) => boolean) =>
+        store.find(predicate),
+    ),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+  };
+}
+
+interface VehicleRecord {
+  plate?: string;
+  makeModelDescription?: string;
+  [key: string]: unknown;
+}
+
+interface Ports {
+  wsdenatranRead: { findVehicleByPlate: ReturnType<typeof vi.fn> };
+  renach: {
+    findDriverByCpf: ReturnType<typeof vi.fn>;
+    findDriverByLicense: ReturnType<typeof vi.fn>;
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  ports: Ports;
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({ query: vi.fn(async () => ({ rows: [] })) });
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: {
+      vehicles: repository([
+        {
+          id: VEHICLE_ID,
+          tenant_id: TENANT_ID,
+          plate: 'BRA2E19',
+          make_model: 'Fixture Sedan 1.6',
+          source: 'wsdenatran',
+        },
+      ]),
+      persons: repository(),
+      personDocuments: repository(),
+      vehicleSnapshots: repository(),
+      externalQueries: repository(),
+      ...(overrides.repositories ?? {}),
+    },
+    ports: overrides.ports ?? {
+      wsdenatranRead: {
+        findVehicleByPlate: vi.fn(
+          async (): Promise<VehicleRecord | undefined> => undefined,
+        ),
+      },
+      renach: {
+        findDriverByCpf: vi.fn(async () => undefined),
+        findDriverByLicense: vi.fn(async () => undefined),
+      },
+    },
+    clock: overrides.clock ?? { now: () => '2026-09-14T14:00:00.000Z' },
+  };
+}
+
+function input(
+  overrides: Record<string, unknown> = {},
+): Record<string, unknown> {
+  return {
+    query_type: 'vehicle_by_plate',
+    parameters: { plate: 'BRA2E19' },
+    purpose: 'fiscalizacao-de-transito',
+    agent_id: ACTOR_ID,
+    ...overrides,
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function loadCommand(
+  dependencies: Deps,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./external-query.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'ops/snapshots/src/handwritten/external-query.command.ts ainda não existe (TASK-0007, CTG-0003 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.ExternalQueryCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'external-query.command.ts não exporta um comando construtível (CTG-0003 §11)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  return new Command(dependencies);
+}
+
+async function createQuery(
+  dependencies: Deps,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  const command = await loadCommand(dependencies);
+  const method = ['execute', 'create', 'handle']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'external-query.command.ts não expõe execute|create|handle (CTG-0003 §5.1)',
+    );
+  }
+  return (await (method as (value: unknown) => Promise<unknown>).call(
+    command,
+    body,
+  )) as Record<string, unknown>;
+}
+
+async function listQueries(
+  dependencies: Deps,
+): Promise<Record<string, unknown>[]> {
+  const command = await loadCommand(dependencies);
+  const method = ['list', 'read']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'external-query.command.ts não expõe list|read (CTG-0003 §5.2)',
+    );
+  }
+  const result = (await (method as () => Promise<unknown>).call(command)) as {
+    items?: Record<string, unknown>[];
+  };
+  return Array.isArray(result) ? result : (result.items ?? []);
+}
+
+describe('CTG-0003 §5.1 — external-queries: forma, portas e efeito (C-0003-15…18)', () => {
+  it('C-0003-15 — dado external-queries sem purpose então 400 TEAT.QUERY_PURPOSE_REQUIRED', async () => {
+    const dependencies = deps();
+    const body = input();
+    delete body.purpose;
+    await expect(createQuery(dependencies, body)).rejects.toMatchObject({
+      code: 'TEAT.QUERY_PURPOSE_REQUIRED',
+      status: 400,
+    });
+  });
+
+  it('dado query_type inválido então 400 TEAT.ENUM_INVALID', async () => {
+    const dependencies = deps();
+    await expect(
+      createQuery(dependencies, input({ query_type: 'foo' })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ENUM_INVALID',
+      status: 400,
+    });
+  });
+
+  it('C-0003-16 — dado o stub de WsdenatranReadPort.findVehicleByPlate devolvendo undefined então 404 TEAT.QUERY_NOT_FOUND e uma snapshots_external_query status=not_found', async () => {
+    const dependencies = deps();
+    await expect(createQuery(dependencies, input())).rejects.toMatchObject({
+      code: 'TEAT.QUERY_NOT_FOUND',
+      status: 404,
+      context: expect.objectContaining({ queryType: 'vehicle_by_plate' }),
+    });
+    expect(dependencies.repositories.externalQueries.rows).toContainEqual(
+      expect.objectContaining({ status: 'not_found' }),
+    );
+  });
+
+  it('C-0003-17 — dado o stub lançando então 503 TEAT.QUERY_UPSTREAM_UNAVAILABLE e uma snapshots_external_query status=failed', async () => {
+    const dependencies = deps({
+      ports: {
+        wsdenatranRead: {
+          findVehicleByPlate: vi.fn(async () => {
+            throw new Error('upstream unavailable');
+          }),
+        },
+        renach: {
+          findDriverByCpf: vi.fn(async () => undefined),
+          findDriverByLicense: vi.fn(async () => undefined),
+        },
+      },
+    });
+    await expect(createQuery(dependencies, input())).rejects.toMatchObject({
+      code: 'TEAT.QUERY_UPSTREAM_UNAVAILABLE',
+      status: 503,
+      context: expect.objectContaining({ queryType: 'vehicle_by_plate' }),
+    });
+    expect(dependencies.repositories.externalQueries.rows).toContainEqual(
+      expect.objectContaining({ status: 'failed' }),
+    );
+  });
+
+  it('C-0003-18a — dado um VehicleRecord com make_model diferente do já congelado então divergence_recorded=true', async () => {
+    const dependencies = deps({
+      ports: {
+        wsdenatranRead: {
+          findVehicleByPlate: vi.fn(async () => ({
+            plate: 'BRA2E19',
+            makeModelDescription: 'Outro Modelo 2.0',
+          })),
+        },
+        renach: {
+          findDriverByCpf: vi.fn(async () => undefined),
+          findDriverByLicense: vi.fn(async () => undefined),
+        },
+      },
+    });
+    const response = await createQuery(dependencies, input());
+    expect(response.divergence_recorded).toBe(true);
+  });
+
+  it('C-0003-18b — dado um VehicleRecord idêntico ao já congelado então divergence_recorded=false', async () => {
+    const dependencies = deps({
+      ports: {
+        wsdenatranRead: {
+          findVehicleByPlate: vi.fn(async () => ({
+            plate: 'BRA2E19',
+            makeModelDescription: 'Fixture Sedan 1.6',
+          })),
+        },
+        renach: {
+          findDriverByCpf: vi.fn(async () => undefined),
+          findDriverByLicense: vi.fn(async () => undefined),
+        },
+      },
+    });
+    const response = await createQuery(dependencies, input());
+    expect(response.divergence_recorded).toBe(false);
+  });
+});
+
+describe('CTG-0003 §5.2 — GET external-queries: sem dado pessoal exposto (C-0003-19)', () => {
+  it('C-0003-19 — dado GET external-queries então nenhum item traz parameters, só parameters_hash', async () => {
+    const dependencies = deps({
+      repositories: {
+        vehicles: repository(),
+        persons: repository(),
+        personDocuments: repository(),
+        vehicleSnapshots: repository(),
+        externalQueries: repository([
+          {
+            id: 'query-1',
+            tenant_id: TENANT_ID,
+            traffic_agency_id: AGENCY_ID,
+            query_type: 'vehicle_by_plate',
+            parameters_hash: 'sha256:abc',
+            purpose: 'fiscalizacao-de-transito',
+            queried_at: '2026-09-14T10:00:00-04:00',
+            status: 'ok',
+            user_ref: ACTOR_ID,
+          },
+        ]),
+      },
+    });
+    const items = await listQueries(dependencies);
+    expect(items).toHaveLength(1);
+    for (const item of items) {
+      expect(item.parameters).toBeUndefined();
+      expect(item.parameters_hash).toBe('sha256:abc');
+    }
+  });
+});
diff --git a/backend/domains/ops/snapshots/src/handwritten/external-query.command.ts b/backend/domains/ops/snapshots/src/handwritten/external-query.command.ts
new file mode 100644
index 0000000..f8448b0
--- /dev/null
+++ b/backend/domains/ops/snapshots/src/handwritten/external-query.command.ts
@@ -0,0 +1,429 @@
+// CTG-0003 §5.1 e §5.2 (M12, R-0008, TASK-0007) — `POST/GET
+// /v1/ops/snapshots/external-queries`.
+//
+// A consulta sai por `SNAPSHOT_QUERY_PORTS`; nenhum `fetch` nasce aqui
+// (ADR-0003, C-0003-35). Toda tentativa é escriturada em
+// `ops.snapshots_external_query`, inclusive as que falham — a auditoria da
+// consulta é o efeito, e por isso a linha de `not_found`/`failed` é gravada
+// em transação própria antes da exceção. As leituras de congelamento
+// acontecem antes da transação de escrita, que fica com um único ciclo.
+import { DetranError } from '@detran/shared';
+
+import {
+  findRowsWhere,
+  insertRow,
+  inTenantTransaction,
+  listRows,
+  parametersHashOf,
+  patchRow,
+  stringOf,
+  tenantScope,
+  validationFailed,
+  type DriverRecord,
+  type SnapshotRow,
+  type SnapshotsDeps,
+  type VehicleRecord,
+} from './snapshots-runtime.js';
+
+export const EXTERNAL_QUERY_TYPES = [
+  'vehicle_by_plate',
+  'driver_by_cpf',
+  'driver_by_license',
+] as const;
+
+export type ExternalQueryType = (typeof EXTERNAL_QUERY_TYPES)[number];
+
+/**
+ * `snapshots_external_query.external_system_id` é `not null` e nenhum
+ * blueprint `ops` define uma tabela de sistemas externos: os identificadores
+ * por porta são os fixados em CTG-0003 §13 item 10 (OD-T34).
+ */
+const EXTERNAL_SYSTEM_IDS: Record<ExternalQueryType, string> = {
+  vehicle_by_plate: '00000000-0000-7000-8000-0000ef800001',
+  driver_by_cpf: '00000000-0000-7000-8000-0000ef800002',
+  driver_by_license: '00000000-0000-7000-8000-0000ef800002',
+};
+
+const SOURCE_BY_TYPE: Record<ExternalQueryType, 'wsdenatran' | 'renach'> = {
+  vehicle_by_plate: 'wsdenatran',
+  driver_by_cpf: 'renach',
+  driver_by_license: 'renach',
+};
+
+/** Campos congelados comparados campo a campo (§5.1, `divergence_recorded`). */
+const VEHICLE_COMPARED_FIELDS = [
+  'plate',
+  'renavam',
+  'chassis',
+  'uf',
+  'make_model',
+] as const;
+
+const PERSON_COMPARED_FIELDS = ['name', 'cpf', 'birth_date'] as const;
+
+export interface CreateExternalQueryInput {
+  query_type: string;
+  parameters: Record<string, unknown>;
+  purpose: string;
+  traffic_agency_id?: string;
+  agent_id?: string;
+  device_id?: string;
+}
+
+export interface CreateExternalQueryResult {
+  snapshot_id: string;
+  source: string;
+  queried_at: string;
+  result: VehicleRecord | DriverRecord;
+  divergence_recorded: boolean;
+}
+
+export interface ExternalQueryListItem {
+  id: string;
+  query_type: string;
+  purpose: string;
+  queried_at: string;
+  status: string;
+  parameters_hash: string;
+  user_ref: string;
+  agent_id: string | null;
+  device_id: string | null;
+}
+
+export interface ExternalQueryListFilters {
+  query_type?: string;
+  purpose?: string;
+  agent_id?: string;
+  from?: string;
+  to?: string;
+}
+
+interface ParsedQuery {
+  queryType: ExternalQueryType;
+  parameters: Record<string, unknown>;
+  purpose: string;
+  parametersHash: string;
+  trafficAgencyId?: string;
+  agentId: string | null;
+  deviceId: string | null;
+}
+
+export class ExternalQueryCommand {
+  constructor(private readonly deps: SnapshotsDeps) {}
+
+  async execute(
+    input: CreateExternalQueryInput,
+  ): Promise<CreateExternalQueryResult> {
+    const parsed = parse(input);
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const queriedAt = this.deps.clock.now();
+    const source = SOURCE_BY_TYPE[parsed.queryType];
+    const base = this.queryRow(parsed, queriedAt, actorId, tenantId);
+
+    let record: VehicleRecord | DriverRecord | undefined;
+    try {
+      record = await this.callPort(parsed);
+    } catch (cause) {
+      await this.record({
+        ...base,
+        status: 'failed',
+        result_summary: codeOf(cause),
+      });
+      throw new DetranError('TEAT.QUERY_UPSTREAM_UNAVAILABLE', {
+        status: 503,
+        context: { queryType: parsed.queryType },
+        message: 'Sistema nacional indisponível para a consulta.',
+        cause,
+      });
+    }
+
+    if (!record) {
+      await this.record({ ...base, status: 'not_found' });
+      throw new DetranError('TEAT.QUERY_NOT_FOUND', {
+        status: 404,
+        context: { queryType: parsed.queryType },
+        message: 'Consulta sem registro no sistema nacional.',
+      });
+    }
+
+    const found = record;
+    const frozen =
+      parsed.queryType === 'vehicle_by_plate'
+        ? vehicleRow(found as VehicleRecord, parsed, source)
+        : personRow(found as DriverRecord, parsed, source);
+    const existing = await this.findFrozen(parsed, frozen);
+    const divergenceRecorded = existing
+      ? comparedFieldsOf(parsed).some(
+          (field) =>
+            normalizeField(existing[field]) !== normalizeField(frozen[field]),
+        )
+      : false;
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const query = await insertRow(this.deps, tx, 'externalQueries', {
+        ...base,
+        status: 'ok',
+        result_summary: source,
+        result_snapshot_json: found as unknown as Record<string, unknown>,
+      });
+
+      const table =
+        parsed.queryType === 'vehicle_by_plate' ? 'vehicles' : 'persons';
+      const stored = existing
+        ? ((await patchRow(
+            this.deps,
+            tx,
+            table,
+            stringOf(existing.id),
+            frozen,
+          )) ?? existing)
+        : await insertRow(this.deps, tx, table, frozen);
+
+      if (parsed.queryType !== 'vehicle_by_plate') {
+        const driver = found as DriverRecord;
+        if (driver.licenseNumber)
+          await insertRow(this.deps, tx, 'personDocuments', {
+            person_id: stringOf(stored.id),
+            document_type: 'cnh',
+            document_number: stringOf(driver.licenseNumber),
+            issuing_uf: driver.licenseState ?? null,
+            valid_until: driver.licenseExpiresAt ?? null,
+            license_category: driver.currentCategory ?? null,
+            status: driver.licenseStatus ?? null,
+            source,
+          });
+        return {
+          snapshot_id: stringOf(stored.id),
+          source,
+          queried_at: queriedAt,
+          result: found,
+          divergence_recorded: divergenceRecorded,
+        };
+      }
+
+      const vehicle = found as VehicleRecord;
+      const snapshot = await insertRow(this.deps, tx, 'vehicleSnapshots', {
+        vehicle_id: stringOf(stored.id),
+        plate_snapshot: stringOf(frozen.plate),
+        renavam_snapshot: vehicle.renavam ?? null,
+        make_model_snapshot: vehicle.makeModelDescription ?? null,
+        species_snapshot: null,
+        category_snapshot: null,
+        color_snapshot: null,
+        data_source: source,
+        external_query_id: stringOf(query.id),
+        divergence_recorded: divergenceRecorded,
+        payload_json: vehicle as unknown as Record<string, unknown>,
+      });
+
+      return {
+        snapshot_id: stringOf(snapshot.id),
+        source,
+        queried_at: queriedAt,
+        result: found,
+        divergence_recorded: divergenceRecorded,
+      };
+    });
+  }
+
+  /** §5.2 — `parameters` nunca sai na leitura: só o hash. */
+  async list(
+    filters: ExternalQueryListFilters = {},
+  ): Promise<{ items: ExternalQueryListItem[]; nextCursor: null }> {
+    const rows = await inTenantTransaction(this.deps, (tx) =>
+      listRows(this.deps, tx, 'externalQueries'),
+    );
+    const items = rows
+      .filter((row) => matches(row, filters))
+      .map((row) => ({
+        id: stringOf(row.id),
+        query_type: stringOf(row.query_type),
+        purpose: stringOf(row.purpose),
+        queried_at: isoOf(row.queried_at),
+        status: stringOf(row.status),
+        parameters_hash: stringOf(row.parameters_hash),
+        user_ref: stringOf(row.user_ref),
+        agent_id: row.agent_id ? stringOf(row.agent_id) : null,
+        device_id: row.device_id ? stringOf(row.device_id) : null,
+      }));
+    return { items, nextCursor: null };
+  }
+
+  private callPort(
+    parsed: ParsedQuery,
+  ): Promise<VehicleRecord | DriverRecord | undefined> {
+    const ports = this.deps.ports;
+    if (parsed.queryType === 'vehicle_by_plate')
+      return ports.wsdenatranRead.findVehicleByPlate(
+        stringOf(parsed.parameters.plate),
+      );
+    if (parsed.queryType === 'driver_by_cpf')
+      return ports.renach.findDriverByCpf(stringOf(parsed.parameters.cpf));
+    return ports.renach.findDriverByLicense(
+      stringOf(parsed.parameters.license_number),
+    );
+  }
+
+  private findFrozen(
+    parsed: ParsedQuery,
+    frozen: SnapshotRow,
+  ): Promise<SnapshotRow | undefined> {
+    const table =
+      parsed.queryType === 'vehicle_by_plate' ? 'vehicles' : 'persons';
+    const column = table === 'vehicles' ? 'plate' : 'cpf';
+    const value = stringOf(frozen[column] ?? '');
+    if (!value) return Promise.resolve(undefined);
+    return inTenantTransaction(this.deps, async (tx) => {
+      const rows = await findRowsWhere(this.deps, tx, table, column, value);
+      return rows[0];
+    });
+  }
+
+  /**
+   * A DTO da §5.1 não carrega o órgão e `traffic_agency_id` é `not null` sem
+   * tabela referenciada: vem do corpo quando informado e, na falta dele, a
+   * consulta fica escriturada no escopo do próprio tenant. Registrado no
+   * relatório de TASK-0007.
+   */
+  private queryRow(
+    parsed: ParsedQuery,
+    queriedAt: string,
+    actorId: string,
+    tenantId: string,
+  ): SnapshotRow {
+    return {
+      traffic_agency_id: parsed.trafficAgencyId ?? tenantId,
+      user_ref: actorId,
+      agent_id: parsed.agentId,
+      device_id: parsed.deviceId,
+      external_system_id: EXTERNAL_SYSTEM_IDS[parsed.queryType],
+      query_type: parsed.queryType,
+      parameters_hash: parsed.parametersHash,
+      purpose: parsed.purpose,
+      queried_at: queriedAt,
+      protocol: null,
+    };
+  }
+
+  private async record(values: SnapshotRow): Promise<void> {
+    await inTenantTransaction(this.deps, async (tx) => {
+      await insertRow(this.deps, tx, 'externalQueries', values);
+    });
+  }
+}
+
+function comparedFieldsOf(parsed: ParsedQuery): readonly string[] {
+  return parsed.queryType === 'vehicle_by_plate'
+    ? VEHICLE_COMPARED_FIELDS
+    : PERSON_COMPARED_FIELDS;
+}
+
+function vehicleRow(
+  record: VehicleRecord,
+  parsed: ParsedQuery,
+  source: string,
+): SnapshotRow {
+  return {
+    plate: stringOf(record.plate ?? parsed.parameters.plate ?? ''),
+    renavam: record.renavam ?? null,
+    chassis: record.chassis ?? null,
+    uf: record.jurisdictionState ?? null,
+    make_model: record.makeModelDescription ?? null,
+    source,
+  };
+}
+
+function personRow(
+  record: DriverRecord,
+  parsed: ParsedQuery,
+  source: string,
+): SnapshotRow {
+  const cpf = stringOf(record.cpf ?? parsed.parameters.cpf ?? '');
+  return {
+    person_type: 'natural',
+    name: record.name ?? null,
+    cpf: cpf || null,
+    birth_date: record.birthDate ?? null,
+    mother_name: record.motherName ?? null,
+    source,
+  };
+}
+
+function normalizeField(value: unknown): string {
+  if (value === null || value === undefined) return '';
+  if (value instanceof Date) return value.toISOString();
+  return String(value);
+}
+
+function isoOf(value: unknown): string {
+  if (value instanceof Date) return value.toISOString();
+  return stringOf(value);
+}
+
+function codeOf(cause: unknown): string {
+  const candidate = cause as { code?: unknown } | null;
+  return typeof candidate?.code === 'string'
+    ? candidate.code
+    : 'upstream_error';
+}
+
+function matches(row: SnapshotRow, filters: ExternalQueryListFilters): boolean {
+  if (filters.query_type && row.query_type !== filters.query_type) return false;
+  if (filters.purpose && row.purpose !== filters.purpose) return false;
+  if (filters.agent_id && stringOf(row.agent_id) !== filters.agent_id)
+    return false;
+  const queriedAt = isoOf(row.queried_at);
+  if (filters.from && queriedAt < filters.from) return false;
+  if (filters.to && queriedAt > filters.to) return false;
+  return true;
+}
+
+function parse(input: CreateExternalQueryInput): ParsedQuery {
+  const purpose = stringOf(input?.purpose ?? '').trim();
+  if (!purpose)
+    throw new DetranError('TEAT.QUERY_PURPOSE_REQUIRED', {
+      status: 400,
+      context: { field: 'purpose' },
+      message: 'A finalidade da consulta é obrigatória.',
+    });
+
+  const queryType = stringOf(input?.query_type ?? '');
+  if (!(EXTERNAL_QUERY_TYPES as readonly string[]).includes(queryType))
+    throw new DetranError('TEAT.ENUM_INVALID', {
+      status: 400,
+      context: { field: 'query_type', allowed: [...EXTERNAL_QUERY_TYPES] },
+      message: 'Tipo de consulta externa fora do conjunto admitido.',
+    });
+
+  const parameters =
+    input?.parameters && typeof input.parameters === 'object'
+      ? (input.parameters as Record<string, unknown>)
+      : {};
+  const fields: { path: string; rule: string }[] = [];
+  if (queryType === 'vehicle_by_plate') {
+    const plate = stringOf(parameters.plate ?? '').trim();
+    if (plate.length < 7 || plate.length > 8)
+      fields.push({ path: 'parameters.plate', rule: 'length' });
+  } else if (queryType === 'driver_by_cpf') {
+    const cpf = stringOf(parameters.cpf ?? '').trim();
+    if (!/^\d{11}$/.test(cpf))
+      fields.push({ path: 'parameters.cpf', rule: 'pattern' });
+  } else {
+    const license = stringOf(parameters.license_number ?? '').trim();
+    if (!license)
+      fields.push({ path: 'parameters.license_number', rule: 'required' });
+  }
+  if (fields.length > 0) throw validationFailed(fields);
+
+  return {
+    queryType: queryType as ExternalQueryType,
+    parameters,
+    purpose,
+    parametersHash: parametersHashOf(parameters),
+    trafficAgencyId: input.traffic_agency_id
+      ? stringOf(input.traffic_agency_id)
+      : undefined,
+    agentId: input.agent_id ? stringOf(input.agent_id) : null,
+    deviceId: input.device_id ? stringOf(input.device_id) : null,
+  };
+}
diff --git a/backend/domains/ops/snapshots/src/handwritten/external-query.provider.ts b/backend/domains/ops/snapshots/src/handwritten/external-query.provider.ts
new file mode 100644
index 0000000..491892c
--- /dev/null
+++ b/backend/domains/ops/snapshots/src/handwritten/external-query.provider.ts
@@ -0,0 +1,50 @@
+// CTG-0003 §5 e §11 (R-0008, TASK-0007) — composição do comando de consulta
+// externa. `SNAPSHOT_QUERY_PORTS` é o token multi-provider de CTG-0002 §4.8;
+// no app ele recebe `createSenatranAdapter().ports` (ADR-0003).
+//
+// `repositories` fica vazio: no caminho de produção a leitura de
+// congelamento e a escrita acontecem por SQL parametrizado sob
+// `withTenantContext`; a porta de repositório existe para os dublês de teste.
+import { SNAPSHOT_QUERY_PORTS, systemOpsClock } from '@detran/ops-core';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+
+import { ExternalQueryCommand } from './external-query.command.js';
+import type { SnapshotQueryPorts } from './snapshots-runtime.js';
+
+const UNBOUND_PORTS: SnapshotQueryPorts = {
+  wsdenatranRead: {
+    findVehicleByPlate: () => {
+      throw new Error('SNAPSHOT_QUERY_PORTS não está ligado ao app');
+    },
+  },
+  renach: {
+    findDriverByCpf: () => {
+      throw new Error('SNAPSHOT_QUERY_PORTS não está ligado ao app');
+    },
+    findDriverByLicense: () => {
+      throw new Error('SNAPSHOT_QUERY_PORTS não está ligado ao app');
+    },
+  },
+};
+
+export const EXTERNAL_QUERY_PROVIDER = {
+  provide: ExternalQueryCommand,
+  inject: [
+    Database,
+    RequestContext,
+    { token: SNAPSHOT_QUERY_PORTS, optional: true },
+  ],
+  useFactory: (
+    database: Database,
+    requestContext: RequestContext,
+    ports?: SnapshotQueryPorts,
+  ): ExternalQueryCommand =>
+    new ExternalQueryCommand({
+      database,
+      requestContext,
+      repositories: {},
+      ports: ports ?? UNBOUND_PORTS,
+      clock: systemOpsClock,
+    }),
+};
diff --git a/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts b/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts
index a5104c7..39de02c 100644
--- a/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts
+++ b/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts
@@ -1,48 +1,36 @@
-import { Body, Controller, Get, Post } from '@nestjs/common';
+// CTG-0003 §5.1 e §5.2 (R-0008, TASK-0007) — `external-queries` sob
+// `v1/ops/snapshots`. `people`/`vehicles` continuam CRUD gerado de
+// `BP-OPS-SNAPSHOTS-001` (`ops:person`, `ops:vehicle`): as rotas manuscritas
+// que declaravam `ops:snapshot-person`/`ops:snapshot-vehicle` saíram com as
+// regras correspondentes de `policy.ts` (§7).
+import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
 import { Action, Audit, Resource } from '@detran/shared';

-import { FrozenSnapshotService } from './frozen-snapshot.service.js';
+import {
+  ExternalQueryCommand,
+  type CreateExternalQueryInput,
+  type ExternalQueryListFilters,
+} from './external-query.command.js';

 @Controller('v1/ops/snapshots')
+@Resource('ops:external-query')
 export class FrozenSnapshotController {
-  constructor(private readonly service: FrozenSnapshotService) {}
-  @Get('people') @Resource('ops:snapshot-person') @Action('read') people() {
-    return this.service.list('people');
-  }
-  @Post('people')
-  @Resource('ops:snapshot-person')
-  @Action('create')
-  @Audit({
-    action: 'OPS_SNAPSHOT_PERSON_CREATE',
-    entity: 'ops.snapshots_person',
-  })
-  createPerson(@Body() dto: Record<string, unknown>) {
-    return this.service.create('people', dto);
-  }
-  @Get('vehicles')
-  @Resource('ops:snapshot-vehicle')
-  @Action('read')
-  vehicles() {
-    return this.service.list('vehicles');
-  }
-  @Post('vehicles')
-  @Resource('ops:snapshot-vehicle')
-  @Action('create')
-  @Audit({
-    action: 'OPS_SNAPSHOT_VEHICLE_CREATE',
-    entity: 'ops.snapshots_vehicle',
-  })
-  createVehicle(@Body() dto: Record<string, unknown>) {
-    return this.service.create('vehicles', dto);
+  constructor(private readonly externalQuery: ExternalQueryCommand) {}
+
+  @Get('external-queries') @Action('read') list(
+    @Query() filters: ExternalQueryListFilters,
+  ) {
+    return this.externalQuery.list(filters ?? {});
   }
+
   @Post('external-queries')
-  @Resource('ops:external-query')
+  @HttpCode(200)
   @Action('create')
   @Audit({
     action: 'OPS_EXTERNAL_QUERY_RECORD',
     entity: 'ops.snapshots_external_query',
   })
-  createExternalQuery(@Body() dto: Record<string, unknown>) {
-    return this.service.create('external-queries', dto);
+  create(@Body() body: CreateExternalQueryInput) {
+    return this.externalQuery.execute(body);
   }
 }
diff --git a/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.provider.ts b/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.provider.ts
deleted file mode 100644
index 49a6509..0000000
--- a/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.provider.ts
+++ /dev/null
@@ -1,24 +0,0 @@
-import { RequestContext } from '@stynx-nyx/core';
-import { Database } from '@stynx-nyx/data';
-import { OpsTenantRepository } from '@detran/ops-core';
-import { FrozenSnapshotService } from './frozen-snapshot.service.js';
-
-const surfaces = {
-  people: 'ops.snapshots_person',
-  vehicles: 'ops.snapshots_vehicle',
-  'external-queries': 'ops.snapshots_external_query',
-} as const;
-
-export const FROZEN_SNAPSHOT_PROVIDER = {
-  provide: FrozenSnapshotService,
-  inject: [Database, RequestContext],
-  useFactory: (database: Database, requestContext: RequestContext) =>
-    new FrozenSnapshotService(
-      Object.fromEntries(
-        Object.entries(surfaces).map(([name, table]) => [
-          name,
-          new OpsTenantRepository(database, requestContext, table),
-        ]),
-      ),
-    ),
-};
diff --git a/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.service.ts b/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.service.ts
deleted file mode 100644
index 9c8a6c1..0000000
--- a/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.service.ts
+++ /dev/null
@@ -1,18 +0,0 @@
-import { OpsTenantRepository } from '@detran/ops-core';
-
-export class FrozenSnapshotService {
-  constructor(
-    private readonly repositories: Record<string, OpsTenantRepository>,
-  ) {}
-  list(surface: string) {
-    return (
-      this.repositories[surface]?.list() ??
-      Promise.reject(new Error(`Unbound snapshot surface: ${surface}`))
-    );
-  }
-  create(surface: string, dto: Record<string, unknown>) {
-    const repository = this.repositories[surface];
-    if (!repository) throw new Error(`Unbound snapshot surface: ${surface}`);
-    return repository.create(dto);
-  }
-}
diff --git a/backend/domains/ops/snapshots/src/handwritten/snapshots-runtime.ts b/backend/domains/ops/snapshots/src/handwritten/snapshots-runtime.ts
new file mode 100644
index 0000000..6de8351
--- /dev/null
+++ b/backend/domains/ops/snapshots/src/handwritten/snapshots-runtime.ts
@@ -0,0 +1,252 @@
+// CTG-0003 §5 (M12, R-0008, TASK-0007) — dependências e utilidades do comando
+// de consulta externa. Nenhum cliente HTTP mora aqui: toda consulta sai por
+// `SNAPSHOT_QUERY_PORTS` (`packages/senatran-adapter`, ADR-0003).
+import { createHash } from 'node:crypto';
+
+import {
+  asQueryable,
+  type OpsClock,
+  type SqlQueryable,
+} from '@detran/ops-core';
+import { DetranError, withTenantContext } from '@detran/shared';
+import type { RequestContext } from '@stynx-nyx/core';
+import type { Database, Transaction } from '@stynx-nyx/data';
+
+export type SnapshotRow = Record<string, unknown>;
+
+export interface SnapshotRowStore {
+  list?(): Promise<SnapshotRow[]>;
+  find?(id: string): Promise<SnapshotRow | undefined>;
+  findOne?(id: string): Promise<SnapshotRow | undefined>;
+  create?(values: SnapshotRow): Promise<SnapshotRow>;
+  update?(
+    id: string,
+    patch: SnapshotRow,
+    tx?: unknown,
+  ): Promise<SnapshotRow | undefined>;
+}
+
+/**
+ * Fatia de leitura de `WsdenatranReadPort`/`RenachPort` e a forma de
+ * `VehicleRecord`/`DriverRecord` (`packages/senatran-adapter/src/domain.ts`),
+ * declaradas estruturalmente: `createSenatranAdapter().ports` as satisfaz sem
+ * que `@detran/ops-snapshots` passe a depender do pacote do adapter — a
+ * fronteira do ADR-0003 continua sendo o adapter, e nenhum cliente HTTP entra
+ * neste módulo.
+ */
+export interface VehicleRecord {
+  plate?: string;
+  chassis?: string;
+  renavam?: string;
+  jurisdictionState?: string;
+  makeModelCode?: string;
+  makeModelDescription?: string;
+  ownerDocument?: string;
+  ownerName?: string;
+}
+
+export interface DriverRecord {
+  cpf?: string;
+  name?: string;
+  birthDate?: string;
+  licenseNumber?: string;
+  currentCategory?: string;
+  licenseState?: string;
+  licenseStatus?: string;
+  licenseExpiresAt?: string;
+  motherName?: string;
+}
+
+export interface SnapshotQueryPorts {
+  wsdenatranRead: {
+    findVehicleByPlate(plate: string): Promise<VehicleRecord | undefined>;
+  };
+  renach: {
+    findDriverByCpf(cpf: string): Promise<DriverRecord | undefined>;
+    findDriverByLicense(
+      licenseNumber: string,
+    ): Promise<DriverRecord | undefined>;
+  };
+}
+
+export interface SnapshotsDeps {
+  database: Pick<Database, 'tx'>;
+  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
+  repositories: Record<string, SnapshotRowStore | undefined>;
+  ports: SnapshotQueryPorts;
+  clock: OpsClock;
+}
+
+export const SNAPSHOT_TABLES = {
+  vehicles: 'ops.snapshots_vehicle',
+  persons: 'ops.snapshots_person',
+  personDocuments: 'ops.snapshots_person_document',
+  vehicleSnapshots: 'ops.snapshots_vehicle_snapshot',
+  externalQueries: 'ops.snapshots_external_query',
+} as const;
+
+export type SnapshotTableName = keyof typeof SNAPSHOT_TABLES;
+
+export function tenantScope(deps: SnapshotsDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Um comando de snapshots exige contexto de requisição');
+  const snapshot = deps.requestContext.snapshot();
+  const tenantId = snapshot.tenantId ?? '';
+  const actorId = snapshot.actorId ?? '';
+  if (!tenantId || !actorId)
+    throw new Error('Um comando de snapshots exige tenantId e actorId');
+  return { tenantId, actorId };
+}
+
+export function inTenantTransaction<T>(
+  deps: SnapshotsDeps,
+  work: (tx: Transaction) => Promise<T>,
+): Promise<T> {
+  return withTenantContext(deps.database, deps.requestContext, work);
+}
+
+function storeOf(
+  deps: SnapshotsDeps,
+  table: SnapshotTableName,
+): SnapshotRowStore | undefined {
+  return deps.repositories[table];
+}
+
+function sqlOf(tx: unknown): SqlQueryable | undefined {
+  return asQueryable(tx as Transaction);
+}
+
+function assertColumns(values: SnapshotRow): string[] {
+  const columns = Object.keys(values);
+  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
+    throw new Error('Coluna inválida em escrita de ops');
+  return columns;
+}
+
+export async function listRows(
+  deps: SnapshotsDeps,
+  tx: unknown,
+  table: SnapshotTableName,
+): Promise<SnapshotRow[]> {
+  const store = storeOf(deps, table);
+  if (typeof store?.list === 'function') return store.list();
+  const sql = sqlOf(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${SNAPSHOT_TABLES[table]} order by created_at desc`,
+  );
+  return result.rows;
+}
+
+export async function findRowsWhere(
+  deps: SnapshotsDeps,
+  tx: unknown,
+  table: SnapshotTableName,
+  column: string,
+  value: unknown,
+): Promise<SnapshotRow[]> {
+  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
+  const store = storeOf(deps, table);
+  if (typeof store?.list === 'function')
+    return (await store.list()).filter((row) => row[column] === value);
+  const sql = sqlOf(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${SNAPSHOT_TABLES[table]} where ${column} = $1`,
+    [value],
+  );
+  return result.rows;
+}
+
+export async function insertRow(
+  deps: SnapshotsDeps,
+  tx: unknown,
+  table: SnapshotTableName,
+  values: SnapshotRow,
+): Promise<SnapshotRow> {
+  const store = storeOf(deps, table);
+  if (typeof store?.create === 'function') return store.create(values);
+  const sql = sqlOf(tx);
+  if (!sql)
+    throw new Error(`Sem porta nem transação para escrever em ${table}`);
+  const columns = assertColumns(values);
+  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+  const result = await sql.query(
+    `insert into ${SNAPSHOT_TABLES[table]} (${columns.join(', ')})
+     values (${placeholders}) returning *`,
+    columns.map((column) => normalize(values[column])),
+  );
+  return (result.rows[0] ?? values) as SnapshotRow;
+}
+
+export async function patchRow(
+  deps: SnapshotsDeps,
+  tx: unknown,
+  table: SnapshotTableName,
+  id: string,
+  patch: SnapshotRow,
+): Promise<SnapshotRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.update === 'function') return store.update(id, patch, tx);
+  const sql = sqlOf(tx);
+  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
+  const columns = assertColumns(patch);
+  const assignments = columns
+    .map((column, index) => `${column} = $${index + 2}`)
+    .join(', ');
+  const result = await sql.query(
+    `update ${SNAPSHOT_TABLES[table]}
+        set ${assignments}, updated_at = now()
+      where id = $1 returning *`,
+    [id, ...columns.map((column) => normalize(patch[column]))],
+  );
+  return result.rows[0];
+}
+
+function normalize(value: unknown): unknown {
+  if (value === null || value === undefined) return null;
+  if (typeof value === 'object' && !(value instanceof Date))
+    return JSON.stringify(value);
+  return value;
+}
+
+export function stringOf(value: unknown): string {
+  return typeof value === 'string' ? value : String(value ?? '');
+}
+
+export function stableJson(value: unknown): string {
+  return JSON.stringify(sortDeep(value));
+}
+
+function sortDeep(value: unknown): unknown {
+  if (Array.isArray(value)) return value.map((entry) => sortDeep(entry));
+  if (value && typeof value === 'object' && !(value instanceof Date)) {
+    const source = value as Record<string, unknown>;
+    return Object.fromEntries(
+      Object.keys(source)
+        .sort()
+        .map((key) => [key, sortDeep(source[key])]),
+    );
+  }
+  return value;
+}
+
+/** `parameters_hash = 'sha256:' + sha256hex(<JSON canônico dos parâmetros>)`. */
+export function parametersHashOf(parameters: unknown): string {
+  return `sha256:${createHash('sha256')
+    .update(stableJson(parameters), 'utf8')
+    .digest('hex')}`;
+}
+
+export function validationFailed(
+  fields: readonly { path: string; rule: string }[],
+): DetranError {
+  return new DetranError('TEAT.VALIDATION_FAILED', {
+    status: 400,
+    context: { fields: [...fields] },
+    message: 'Parâmetros inválidos para o tipo de consulta.',
+  });
+}
diff --git a/backend/domains/ops/snapshots/tests/integration/external-query.integration.spec.ts b/backend/domains/ops/snapshots/tests/integration/external-query.integration.spec.ts
new file mode 100644
index 0000000..bc87ac7
--- /dev/null
+++ b/backend/domains/ops/snapshots/tests/integration/external-query.integration.spec.ts
@@ -0,0 +1,108 @@
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
+
+import {
+  commandDeps,
+  dropTenant,
+  importModule,
+  isolatedTenant,
+  newClient,
+  runCommand,
+  seedVehicle,
+} from './harness.js';
+
+/**
+ * CTG-0003 §5.1 e §10 (R-0008, TASK-0006) — C-0003-34: `external-queries`
+ * bem-sucedido grava, na mesma transação, o upsert do snapshot, a linha de
+ * `snapshots_vehicle_snapshot` e a de `snapshots_external_query` com
+ * `parameters_hash` determinístico.
+ */
+
+const COMMAND_EXPORTS = ['ExternalQueryCommand'];
+const COMMAND_METHODS = ['execute', 'create', 'handle'];
+
+const client: pg.Client = newClient();
+let tenantId: string;
+let actorId: string;
+
+beforeAll(async () => {
+  await client.connect();
+  const isolated = await isolatedTenant(client, 'ops-snapshots-external-query');
+  tenantId = isolated.tenantId;
+  actorId = isolated.actorId;
+});
+
+afterAll(async () => {
+  await dropTenant(client, tenantId);
+  await client.end();
+});
+
+describe('CTG-0003 §5.1 — external-queries: transação e parameters_hash determinístico (C-0003-34)', () => {
+  it('C-0003-34 — dado external-queries bem-sucedido então, na mesma transação, existem o upsert do snapshot, snapshots_vehicle_snapshot e snapshots_external_query com parameters_hash determinístico', async () => {
+    const vehicleId = await seedVehicle(
+      client,
+      tenantId,
+      'BRA2E19',
+      'Fixture Sedan 1.6',
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      ports: {
+        wsdenatranRead: {
+          findVehicleByPlate: vi.fn(async () => ({
+            plate: 'BRA2E19',
+            makeModelDescription: 'Fixture Sedan 1.6',
+          })),
+        },
+        renach: {
+          findDriverByCpf: vi.fn(async () => undefined),
+          findDriverByLicense: vi.fn(async () => undefined),
+        },
+      },
+    });
+
+    const first = await runCommand(
+      () => importModule('../../src/handwritten/external-query.command.js'),
+      'ops/snapshots/src/handwritten/external-query.command.ts',
+      COMMAND_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      {
+        query_type: 'vehicle_by_plate',
+        parameters: { plate: 'BRA2E19' },
+        purpose: 'fiscalizacao-de-transito',
+        agent_id: actorId,
+      },
+    );
+
+    const queries = await dependencies.repositories.externalQueries.list();
+    expect(queries).toHaveLength(1);
+    expect(queries[0]?.parameters_hash).toEqual(
+      expect.stringMatching(/^sha256:/),
+    );
+
+    const snapshots = await dependencies.repositories.vehicleSnapshots.list();
+    expect(
+      snapshots.some((snapshot) => snapshot.vehicle_id === vehicleId),
+    ).toBe(true);
+
+    const second = await runCommand(
+      () => importModule('../../src/handwritten/external-query.command.js'),
+      'ops/snapshots/src/handwritten/external-query.command.ts',
+      COMMAND_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      {
+        query_type: 'vehicle_by_plate',
+        parameters: { plate: 'BRA2E19' },
+        purpose: 'fiscalizacao-de-transito',
+        agent_id: actorId,
+      },
+    );
+    const queriesAfterSecond =
+      await dependencies.repositories.externalQueries.list();
+    const hashes = queriesAfterSecond.map((query) => query.parameters_hash);
+    expect(new Set(hashes).size).toBe(1);
+    expect(first.divergence_recorded).toBe(false);
+    expect(second.divergence_recorded).toBe(false);
+  });
+});
diff --git a/backend/domains/ops/snapshots/tests/integration/harness.ts b/backend/domains/ops/snapshots/tests/integration/harness.ts
new file mode 100644
index 0000000..b41fd16
--- /dev/null
+++ b/backend/domains/ops/snapshots/tests/integration/harness.ts
@@ -0,0 +1,248 @@
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { vi } from 'vitest';
+
+/**
+ * Harness de integração de `@detran/ops-snapshots` (R-0008, TASK-0006,
+ * CTG-0003 §10). Não é um arquivo de teste. Padrão herdado de
+ * `backend/domains/ops/offline-sync/tests/integration/harness.ts` (TASK-0004).
+ */
+const { Client } = pg;
+
+export const CONNECTION_STRING =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+
+export const FIXTURES = {
+  tenantId: '00000000-0000-7000-8000-00000000a001',
+  agencyId: '00000000-0000-7000-8000-0000e2000001',
+  actorId: '00000000-0000-4000-8000-0000b0000001',
+  vehicleId: '00000000-0000-7000-8000-0000ef600001',
+} as const;
+
+export const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+export function newClient(): pg.Client {
+  return new Client({ connectionString: CONNECTION_STRING });
+}
+
+export function database(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+): { tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> } {
+  return {
+    async tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> {
+      await client.query('begin');
+      try {
+        await client.query('set local role role_app_backend');
+        await client.query(`select set_config('app.tenant_id', $1, true)`, [
+          tenantId,
+        ]);
+        await client.query(`select set_config('app.actor_id', $1, true)`, [
+          actorId,
+        ]);
+        const result = await work({ query: client.query.bind(client) });
+        await client.query('commit');
+        return result;
+      } catch (error) {
+        await client.query('rollback');
+        throw error;
+      }
+    },
+  };
+}
+
+export function requestContext(tenantId: string, actorId: string) {
+  return {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId }),
+  };
+}
+
+interface SqlTransaction {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+export class SqlOpsRepository {
+  constructor(
+    private readonly db: ReturnType<typeof database>,
+    private readonly table: string,
+  ) {
+    if (!/^ops\.[a-z_]+$/.test(table)) throw new Error(`Unsafe table ${table}`);
+  }
+
+  list(): Promise<Record<string, unknown>[]> {
+    return this.db.tx(
+      async (tx) =>
+        (
+          await (tx as SqlTransaction).query(
+            `select * from ${this.table} order by created_at desc`,
+          )
+        ).rows,
+    );
+  }
+
+  find(id: string): Promise<Record<string, unknown> | undefined> {
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `select * from ${this.table} where id = $1`,
+        [id],
+      );
+      return result.rows[0];
+    });
+  }
+
+  findOne(id: string): Promise<Record<string, unknown> | undefined> {
+    return this.find(id);
+  }
+}
+
+export function repositories(db: ReturnType<typeof database>) {
+  return {
+    vehicles: new SqlOpsRepository(db, 'ops.snapshots_vehicle'),
+    persons: new SqlOpsRepository(db, 'ops.snapshots_person'),
+    personDocuments: new SqlOpsRepository(db, 'ops.snapshots_person_document'),
+    vehicleSnapshots: new SqlOpsRepository(
+      db,
+      'ops.snapshots_vehicle_snapshot',
+    ),
+    externalQueries: new SqlOpsRepository(db, 'ops.snapshots_external_query'),
+  };
+}
+
+export function commandDeps(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+  overrides: Record<string, unknown> = {},
+) {
+  const db = database(client, tenantId, actorId);
+  return {
+    database: db,
+    requestContext: requestContext(tenantId, actorId),
+    repositories: repositories(db),
+    ports: {
+      wsdenatranRead: {
+        findVehicleByPlate: vi.fn(async () => undefined),
+      },
+      renach: {
+        findDriverByCpf: vi.fn(async () => undefined),
+        findDriverByLicense: vi.fn(async () => undefined),
+      },
+    },
+    clock: { now: () => new Date().toISOString() },
+    ...overrides,
+  };
+}
+
+export async function runCommand(
+  load: () => Promise<unknown>,
+  label: string,
+  exportNames: readonly string[],
+  methodNames: readonly string[],
+  dependencies: unknown,
+  ...args: unknown[]
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await load()) as Record<string, unknown>;
+  } catch (cause) {
+    throw new Error(`${label} ainda não existe (TASK-0007, CTG-0003 §11)`, {
+      cause,
+    });
+  }
+  const exported =
+    exportNames
+      .map((name) => loaded[name])
+      .find((value) => typeof value === 'function') ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function')
+    throw new Error(`${label} não exporta nada construtível`);
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const instance = new Command(dependencies);
+  const method = methodNames
+    .map((name) => instance[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function')
+    throw new Error(`${label} não expõe nenhum de ${methodNames.join('|')}`);
+  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
+    instance,
+    ...args,
+  )) as Record<string, unknown>;
+}
+
+/** Tenant isolado por arquivo (`rait-test-strategy.md` §6). */
+export async function isolatedTenant(
+  client: pg.Client,
+  slug: string,
+): Promise<{ tenantId: string; actorId: string }> {
+  const tenantId = randomUUID();
+  const actorId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
+    [
+      tenantId,
+      `${slug}-${tenantId.slice(0, 8)}`,
+      `${slug} ${tenantId.slice(0, 8)}`,
+    ],
+  );
+  await client.query(
+    `insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'Actor')`,
+    [actorId, tenantId, `${actorId}@test.invalid`],
+  );
+  await client.query(
+    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
+     on conflict (tenant_id, user_id) do update set is_active = true`,
+    [tenantId, actorId],
+  );
+  return { tenantId, actorId };
+}
+
+export async function seedVehicle(
+  client: pg.Client,
+  tenantId: string,
+  plate: string,
+  makeModel: string,
+): Promise<string> {
+  const vehicleId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.snapshots_vehicle (id, tenant_id, plate, make_model, source)
+     values ($1, $2, $3, $4, 'wsdenatran')`,
+    [vehicleId, tenantId, plate, makeModel],
+  );
+  return vehicleId;
+}
+
+export async function dropTenant(
+  client: pg.Client,
+  tenantId: string,
+): Promise<void> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  for (const table of [
+    'ops.snapshots_vehicle_snapshot',
+    'ops.snapshots_external_query',
+    'ops.snapshots_person_document',
+    'ops.snapshots_person',
+    'ops.snapshots_vehicle',
+  ]) {
+    await client.query(`delete from ${table} where tenant_id = $1`, [tenantId]);
+  }
+  await client.query('delete from auth.memberships where tenant_id = $1', [
+    tenantId,
+  ]);
+  await client.query('delete from auth.users where tenant_id = $1', [tenantId]);
+  await client.query('delete from auth.tenants where id = $1', [tenantId]);
+}
diff --git a/backend/domains/ops/snapshots/tests/integration/senatran-boundary.integration.spec.ts b/backend/domains/ops/snapshots/tests/integration/senatran-boundary.integration.spec.ts
new file mode 100644
index 0000000..339c68f
--- /dev/null
+++ b/backend/domains/ops/snapshots/tests/integration/senatran-boundary.integration.spec.ts
@@ -0,0 +1,58 @@
+import { existsSync, readFileSync, readdirSync } from 'node:fs';
+import { dirname, join } from 'node:path';
+import { fileURLToPath } from 'node:url';
+import { describe, expect, it } from 'vitest';
+
+/**
+ * CTG-0003 §5.1/§10 e ADR-0003 (R-0008, TASK-0006) — C-0003-35: nenhum
+ * cliente HTTP direto sai de `@detran/ops-snapshots`; toda consulta externa
+ * passa por `SNAPSHOT_QUERY_PORTS` (`packages/senatran-adapter`). Este teste
+ * é local ao pacote e complementa — nunca substitui — `tools/verify-senatran-boundary.ts`
+ * (`pnpm verify:senatran-boundary`, já em `pnpm check`), que varre padrões
+ * específicos da família SENATRAN em todo o monorepo; aqui a varredura é
+ * genérica (qualquer cliente HTTP) e escopada a `src/handwritten/**`.
+ */
+
+const HERE = dirname(fileURLToPath(import.meta.url));
+const HANDWRITTEN_DIR = join(HERE, '..', '..', 'src', 'handwritten');
+
+const FORBIDDEN_CLIENTS = [
+  /\bfetch\s*\(/u,
+  /\bXMLHttpRequest\b/u,
+  /\baxios\b/u,
+  /\bhttps?\.request\s*\(/u,
+  /from ['"]node:https?['"]/u,
+  /from ['"]undici['"]/u,
+] as const;
+
+function walk(directory: string): string[] {
+  if (!existsSync(directory)) return [];
+  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
+    const path = join(directory, entry.name);
+    if (entry.isDirectory()) return walk(path);
+    return entry.isFile() && /\.(?:[cm]?[jt]s)$/u.test(entry.name)
+      ? [path]
+      : [];
+  });
+}
+
+describe('CTG-0003 §5.1 — fronteira SENATRAN em ops-snapshots (C-0003-35, ADR-0003)', () => {
+  it('C-0003-35 — dado verify:senatran-boundary sobre @detran/ops-snapshots então nenhum fetch/cliente HTTP fora de packages/senatran-adapter', () => {
+    const files = walk(HANDWRITTEN_DIR).filter(
+      (file) => !file.endsWith('.spec.ts'),
+    );
+    const violations: string[] = [];
+    for (const file of files) {
+      const source = readFileSync(file, 'utf8');
+      for (const pattern of FORBIDDEN_CLIENTS) {
+        if (pattern.test(source)) {
+          violations.push(`${file} matches ${pattern}`);
+        }
+      }
+    }
+    expect(
+      violations,
+      `cliente HTTP fora do adapter (ADR-0003):\n${violations.join('\n')}`,
+    ).toEqual([]);
+  });
+});
diff --git a/backend/domains/shared/src/policy.spec.ts b/backend/domains/shared/src/policy.spec.ts
index bbf8434..6574d07 100644
--- a/backend/domains/shared/src/policy.spec.ts
+++ b/backend/domains/shared/src/policy.spec.ts
@@ -103,11 +103,6 @@ describe('DETRAN unified policy kit', () => {
     expect(
       allowed(['integration-operator'], 'ops:application-version', 'read'),
     ).toBe(true);
-    // complete-upload and validate return with their routes in WP-T2
-    expect(
-      allowed(['processing-operator'], 'ops:evidence', 'complete-upload'),
-    ).toBe(false);
-    expect(allowed(['AUDITOR'], 'ops:evidence', 'validate')).toBe(false);
     expect(allowed(['agency-admin'], 'inf:speed-meter', 'create')).toBe(true);
     expect(allowed(['field-agent'], 'inf:speed-meter', 'create')).toBe(false);
     expect(allowed(['field-agent'], 'inf:speed-measurement', 'create')).toBe(
@@ -1432,3 +1427,334 @@ describe('R-0008 CTG-0002 §8 — política de campo, numeração e sincronizaç
     });
   });
 });
+
+/**
+ * CTG-0003 §7 (R-0008, TASK-0006) — evidência, custódia, bodycam, snapshots e
+ * catálogo/pacote normativo: as chaves novas de `TEAT_RULES` e de
+ * `OPS_SURFACE_RULES` que TASK-0007 escreve, e a remoção definitiva do par
+ * `snapshot-person`/`snapshot-vehicle` (os controladores gerados declaram
+ * `ops:person`/`ops:vehicle`, nunca `ops:snapshot-*`).
+ *
+ * Toda linha abaixo é transcrição literal da §7 do contrato; nenhum papel é
+ * inferido. Os pares que ainda não existem falham hoje por comportamento
+ * ausente (Engineer, TASK-0007), nunca por erro de escrita.
+ */
+describe('R-0008 CTG-0003 §7 — política de evidência, snapshots e normativo (TASK-0006)', () => {
+  const allowed = (roles: string[], resource: string, action: string) =>
+    isDetranActionAllowed({ roles, permissions: [] }, resource, action);
+
+  /** Os oito papéis canônicos da família TEAT (CTG-0001 §0, roles.ts). */
+  const TEAT_CANONICAL_ROLES = [
+    'field-agent',
+    'field-supervisor',
+    'processing-operator',
+    'traffic-authority',
+    'agency-admin',
+    'technical-admin',
+    'AUDITOR',
+    'integration-operator',
+  ] as const;
+
+  function expectGrantedOnlyTo(
+    resource: string,
+    action: string,
+    grantedRoles: readonly string[],
+  ): void {
+    for (const role of TEAT_CANONICAL_ROLES) {
+      if (role === 'technical-admin') {
+        // technical-admin está em GLOBAL_ADMIN_ROLES: '*' o libera para toda
+        // chave, sem entrar na lista estática de papéis concedidos.
+        expect(
+          allowed([role], resource, action),
+          `technical-admin deveria passar por GLOBAL_ADMIN_ROLES ('*') em ${resource}:${action}`,
+        ).toBe(true);
+        continue;
+      }
+      const expected = (grantedRoles as readonly string[]).includes(role);
+      expect(
+        allowed([role], resource, action),
+        `${resource}:${action} para o papel ${role} deveria ser ${expected}`,
+      ).toBe(expected);
+    }
+  }
+
+  describe('§7 — chaves novas de TEAT_RULES (comandos de evidência e acesso a bodycam)', () => {
+    it('ops:evidence:complete-upload — field-agent e processing-operator (origem)', () => {
+      expectGrantedOnlyTo('ops:evidence', 'complete-upload', [
+        'field-agent',
+        'processing-operator',
+      ]);
+    });
+
+    it('ops:evidence:validate — processing-operator, AUDITOR e technical-admin (origem "evidence:validate", auditor canonizado em AUDITOR)', () => {
+      expectGrantedOnlyTo('ops:evidence', 'validate', [
+        'processing-operator',
+        'AUDITOR',
+        'technical-admin',
+      ]);
+    });
+
+    it('ops:evidence:purge-unverified — só technical-admin (chave nova)', () => {
+      expectGrantedOnlyTo('ops:evidence', 'purge-unverified', [
+        'technical-admin',
+      ]);
+    });
+
+    it('ops:evidence-access-request:create — processing-operator e traffic-authority (origem)', () => {
+      expectGrantedOnlyTo('ops:evidence-access-request', 'create', [
+        'processing-operator',
+        'traffic-authority',
+      ]);
+    });
+
+    it('ops:evidence-access-request:update — processing-operator e traffic-authority (origem, sem rota nesta rodada — §4.11 nota final)', () => {
+      expectGrantedOnlyTo('ops:evidence-access-request', 'update', [
+        'processing-operator',
+        'traffic-authority',
+      ]);
+    });
+
+    it('ops:evidence-access-request:approve — só traffic-authority (origem)', () => {
+      expectGrantedOnlyTo('ops:evidence-access-request', 'approve', [
+        'traffic-authority',
+      ]);
+    });
+
+    it('ops:evidence-access-request:deny — só traffic-authority (origem)', () => {
+      expectGrantedOnlyTo('ops:evidence-access-request', 'deny', [
+        'traffic-authority',
+      ]);
+    });
+
+    it('ops:evidence-access-request:deliver — processing-operator e traffic-authority (origem)', () => {
+      expectGrantedOnlyTo('ops:evidence-access-request', 'deliver', [
+        'processing-operator',
+        'traffic-authority',
+      ]);
+    });
+  });
+
+  describe('§7 — chaves de comando já existentes, preservadas (CTG-0001/CTG-0002)', () => {
+    it('ops:evidence:initiate-upload — field-agent e processing-operator', () => {
+      expectGrantedOnlyTo('ops:evidence', 'initiate-upload', [
+        'field-agent',
+        'processing-operator',
+      ]);
+    });
+
+    it('ops:evidence:link — field-agent e processing-operator', () => {
+      expectGrantedOnlyTo('ops:evidence', 'link', [
+        'field-agent',
+        'processing-operator',
+      ]);
+    });
+
+    it('ops:evidence:add-custody-event — field-agent, processing-operator, AUDITOR e technical-admin', () => {
+      expectGrantedOnlyTo('ops:evidence', 'add-custody-event', [
+        'field-agent',
+        'processing-operator',
+        'AUDITOR',
+        'technical-admin',
+      ]);
+    });
+
+    it('ops:probative-package:generate — processing-operator, AUDITOR e technical-admin', () => {
+      expectGrantedOnlyTo('ops:probative-package', 'generate', [
+        'processing-operator',
+        'AUDITOR',
+        'technical-admin',
+      ]);
+    });
+
+    it('ops:external-query:create — field-agent, field-supervisor, processing-operator e traffic-authority (§5.1, mesma chave da superfície CRUD reaproveitada pelo comando)', () => {
+      expectGrantedOnlyTo('ops:external-query', 'create', [
+        'field-agent',
+        'field-supervisor',
+        'processing-operator',
+        'traffic-authority',
+      ]);
+    });
+
+    it('inf:normative-catalog:{publish,retire} — agency-admin e technical-admin', () => {
+      for (const action of ['publish', 'retire']) {
+        expectGrantedOnlyTo('inf:normative-catalog', action, [
+          'agency-admin',
+          'technical-admin',
+        ]);
+      }
+    });
+
+    it('inf:mobile-normative-package:{publish,retire} — agency-admin e technical-admin', () => {
+      for (const action of ['publish', 'retire']) {
+        expectGrantedOnlyTo('inf:mobile-normative-package', action, [
+          'agency-admin',
+          'technical-admin',
+        ]);
+      }
+    });
+
+    it('inf:mobile-normative-package:validate — field-agent, field-supervisor, agency-admin e technical-admin (§6.4 — field-agent lê conteúdo, não publica)', () => {
+      expectGrantedOnlyTo('inf:mobile-normative-package', 'validate', [
+        'field-agent',
+        'field-supervisor',
+        'agency-admin',
+        'technical-admin',
+      ]);
+    });
+  });
+
+  describe('§7 — chaves novas de OPS_SURFACE_RULES (superfícies CRUD do route contract §4.4/§4.5)', () => {
+    const surfaces: Array<[string, string, readonly string[]]> = [
+      [
+        'external-query',
+        'read',
+        [
+          'field-agent',
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+          'AUDITOR',
+        ],
+      ],
+      ['evidence', 'create', ['field-agent', 'processing-operator']],
+      ['evidence', 'update', ['processing-operator', 'technical-admin']],
+      [
+        'evidence-link',
+        'read',
+        [
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+          'AUDITOR',
+          'technical-admin',
+        ],
+      ],
+      [
+        'custody-event',
+        'read',
+        [
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+          'AUDITOR',
+          'technical-admin',
+        ],
+      ],
+      [
+        'probative-package',
+        'read',
+        [
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+          'AUDITOR',
+          'technical-admin',
+        ],
+      ],
+      [
+        'probative-package-item',
+        'read',
+        [
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+          'AUDITOR',
+          'technical-admin',
+        ],
+      ],
+      [
+        'storage-intent',
+        'read',
+        [
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+          'AUDITOR',
+          'technical-admin',
+        ],
+      ],
+      [
+        'evidence-access-request',
+        'read',
+        [
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+          'AUDITOR',
+          'technical-admin',
+        ],
+      ],
+      ['evidence-link', 'create', ['field-agent', 'processing-operator']],
+      [
+        'custody-event',
+        'create',
+        ['field-agent', 'processing-operator', 'AUDITOR', 'technical-admin'],
+      ],
+      [
+        'probative-package',
+        'create',
+        ['processing-operator', 'AUDITOR', 'technical-admin'],
+      ],
+      [
+        'probative-package-item',
+        'create',
+        ['processing-operator', 'technical-admin'],
+      ],
+      ['storage-intent', 'create', ['field-agent', 'processing-operator']],
+      [
+        'evidence-access-request',
+        'create',
+        ['processing-operator', 'traffic-authority'],
+      ],
+    ];
+
+    for (const [resource, action, roles] of surfaces) {
+      it(`ops:${resource}:${action} — ${roles.join(', ')}`, () => {
+        expectGrantedOnlyTo(`ops:${resource}`, action, roles);
+      });
+    }
+
+    const snapshotSurfaces = [
+      ['person', 'read'],
+      ['person', 'create'],
+      ['vehicle', 'read'],
+      ['vehicle', 'create'],
+      ['person-document', 'read'],
+      ['person-document', 'create'],
+      ['vehicle-snapshot', 'read'],
+      ['vehicle-snapshot', 'create'],
+    ] as const;
+
+    it('ops:{person,vehicle,person-document,vehicle-snapshot}:{read,create} — field-agent, field-supervisor, processing-operator, traffic-authority e technical-admin (§4.5, controladores gerados de BP-OPS-SNAPSHOTS-001)', () => {
+      for (const [resource, action] of snapshotSurfaces) {
+        expectGrantedOnlyTo(`ops:${resource}`, action, [
+          'field-agent',
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+        ]);
+      }
+    });
+  });
+
+  describe('§7 — remoção do alias duplicado da origem (`ops:snapshot-person`/`ops:snapshot-vehicle`)', () => {
+    it('dado ops:snapshot-{person,vehicle}:{read,create} então as quatro chaves não existem na matriz (a rota gerada é ops:person/ops:vehicle, nunca ops:snapshot-*)', () => {
+      for (const resource of ['snapshot-person', 'snapshot-vehicle']) {
+        for (const action of ['read', 'create']) {
+          expect(
+            `ops:${resource}:${action}` in DETRAN_POLICY_MATRIX,
+            `ops:${resource}:${action} deveria ter sido removida em M18 (CTG-0003 §7)`,
+          ).toBe(false);
+        }
+      }
+    });
+
+    it('dado qualquer papel canônico então nenhum recebe ops:snapshot-person:read, nem por permissionsForRoles', () => {
+      for (const role of TEAT_CANONICAL_ROLES) {
+        expect(
+          permissionsForRoles([role]).includes('ops:snapshot-person:read'),
+        ).toBe(false);
+      }
+    });
+  });
+});
diff --git a/backend/domains/shared/src/policy.ts b/backend/domains/shared/src/policy.ts
index 101dae8..d8b9e3a 100644
--- a/backend/domains/shared/src/policy.ts
+++ b/backend/domains/shared/src/policy.ts
@@ -554,31 +554,10 @@ const TEAT_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
     ],
   ],
   ['inf', 'ait-cancel-request-event', 'delete', ['technical-admin']],
-  // Superfície CRUD gerada sem regra hoje (§11.7): catálogo normativo,
-  // restrita a INF_ADMIN_ROLES (agency-admin, technical-admin).
-  [
-    'inf',
-    'normative-metrological-table',
-    'read',
-    ['agency-admin', 'technical-admin'],
-  ],
-  [
-    'inf',
-    'normative-metrological-table',
-    'create',
-    ['agency-admin', 'technical-admin'],
-  ],
-  [
-    'inf',
-    'normative-metrological-table',
-    'update',
-    ['agency-admin', 'technical-admin'],
-  ],
-  ['inf', 'normative-metrological-table', 'delete', ['technical-admin']],
-  ['inf', 'signature-policy', 'read', ['agency-admin', 'technical-admin']],
-  ['inf', 'signature-policy', 'create', ['agency-admin', 'technical-admin']],
-  ['inf', 'signature-policy', 'update', ['agency-admin', 'technical-admin']],
-  ['inf', 'signature-policy', 'delete', ['technical-admin']],
+  // CTG-0003 §7 (M18, TASK-0007): `normative-metrological-table` e
+  // `signature-policy` passaram para INF_RESOURCES/INF_ADMIN_RESOURCES — a
+  // superfície CRUD gerada delas segue a mesma regra das demais do domínio,
+  // em um lugar só.
   [
     'ops',
     'evidence',
@@ -598,6 +577,45 @@ const TEAT_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
     'generate',
     ['processing-operator', 'AUDITOR', 'technical-admin'],
   ],
+  // CTG-0003 §7 (M18, TASK-0007): comandos de evidência, custódia e acesso a
+  // conteúdo de bodycam (RN-TEAT-142). Papéis transcritos da origem
+  // `teat-policy.ts`; `auditor` canonizado em `AUDITOR` por ROLE_ALIASES.
+  [
+    'ops',
+    'evidence',
+    'complete-upload',
+    ['field-agent', 'processing-operator'],
+  ],
+  [
+    'ops',
+    'evidence',
+    'validate',
+    ['processing-operator', 'AUDITOR', 'technical-admin'],
+  ],
+  ['ops', 'evidence', 'purge-unverified', ['technical-admin']],
+  [
+    'ops',
+    'evidence-access-request',
+    'create',
+    ['processing-operator', 'traffic-authority'],
+  ],
+  // `update` não tem rota de comando nesta rodada (§4.11 nota final): é a
+  // superfície `PATCH` do CRUD gerado, registrada aqui para que
+  // `policy-routes.e2e.spec.ts` case nos dois sentidos.
+  [
+    'ops',
+    'evidence-access-request',
+    'update',
+    ['processing-operator', 'traffic-authority'],
+  ],
+  ['ops', 'evidence-access-request', 'approve', ['traffic-authority']],
+  ['ops', 'evidence-access-request', 'deny', ['traffic-authority']],
+  [
+    'ops',
+    'evidence-access-request',
+    'deliver',
+    ['processing-operator', 'traffic-authority'],
+  ],
   // M18: `ops:offline-numbering-reservation:{reserve,cancel}` removidas —
   // alias duplicado da origem; a rota única é `numbering-reservation`.
   ['ops', 'numbering-reservation', 'reserve', ['field-agent']],
@@ -809,6 +827,31 @@ const OPS_NUMBERING_ADMIN_ROLES: readonly DetranRole[] = [
   'technical-admin',
 ];

+/** CTG-0003 §7 — leitura da cadeia de custódia e do pacote probatório. */
+const OPS_CUSTODY_READ_ROLES: readonly DetranRole[] = [
+  'field-supervisor',
+  'processing-operator',
+  'traffic-authority',
+  'AUDITOR',
+  'technical-admin',
+];
+/** CTG-0003 §5.2 — auditoria das consultas externas. */
+const OPS_EXTERNAL_QUERY_READ_ROLES: readonly DetranRole[] = [
+  'field-agent',
+  'field-supervisor',
+  'processing-operator',
+  'traffic-authority',
+  'AUDITOR',
+];
+/** CTG-0003 §4.5/§7 — superfícies CRUD de BP-OPS-SNAPSHOTS-001. */
+const OPS_SNAPSHOT_SURFACE_ROLES: readonly DetranRole[] = [
+  'field-agent',
+  'field-supervisor',
+  'processing-operator',
+  'traffic-authority',
+  'technical-admin',
+];
+
 const OPS_SURFACE_RULES: Array<[string, string, readonly DetranRole[]]> = [
   ['parameter', 'read', ['agency-admin']],
   // CTG-0002 §8 (M18, TASK-0005) — superfícies do route contract §4.3 que
@@ -962,19 +1005,11 @@ const OPS_SURFACE_RULES: Array<[string, string, readonly DetranRole[]]> = [
     ],
   ],
   ['application-version', 'create', ['agency-admin', 'technical-admin']],
+  // CTG-0003 §7 (M18, TASK-0007): `ops:snapshot-person`/`ops:snapshot-vehicle`
+  // removidas — alias duplicado da origem. Os controladores gerados de
+  // BP-OPS-SNAPSHOTS-001 declaram `ops:person` e `ops:vehicle`, abaixo.
   [
-    'snapshot-person',
-    'read',
-    [
-      'field-agent',
-      'field-supervisor',
-      'processing-operator',
-      'traffic-authority',
-      'technical-admin',
-    ],
-  ],
-  [
-    'snapshot-person',
+    'external-query',
     'create',
     [
       'field-agent',
@@ -985,50 +1020,54 @@ const OPS_SURFACE_RULES: Array<[string, string, readonly DetranRole[]]> = [
     ],
   ],
   [
-    'snapshot-vehicle',
+    'evidence',
     'read',
     [
       'field-agent',
       'field-supervisor',
       'processing-operator',
       'traffic-authority',
+      'AUDITOR',
       'technical-admin',
     ],
   ],
-  [
-    'snapshot-vehicle',
+  // CTG-0003 §7 (M18, TASK-0007) — superfícies CRUD do route contract §4.4 e
+  // §4.5 que ainda não tinham regra. Sem regra a guarda falha fechado, e a
+  // rota some para todo papel que não seja administrador global.
+  ['external-query', 'read', OPS_EXTERNAL_QUERY_READ_ROLES],
+  ['evidence', 'create', ['field-agent', 'processing-operator']],
+  ['evidence', 'update', ['processing-operator', 'technical-admin']],
+  ['evidence-link', 'read', OPS_CUSTODY_READ_ROLES],
+  ['custody-event', 'read', OPS_CUSTODY_READ_ROLES],
+  ['probative-package', 'read', OPS_CUSTODY_READ_ROLES],
+  ['probative-package-item', 'read', OPS_CUSTODY_READ_ROLES],
+  ['storage-intent', 'read', OPS_CUSTODY_READ_ROLES],
+  ['evidence-access-request', 'read', OPS_CUSTODY_READ_ROLES],
+  ['evidence-link', 'create', ['field-agent', 'processing-operator']],
+  [
+    'custody-event',
     'create',
-    [
-      'field-agent',
-      'field-supervisor',
-      'processing-operator',
-      'traffic-authority',
-      'technical-admin',
-    ],
+    ['field-agent', 'processing-operator', 'AUDITOR', 'technical-admin'],
   ],
   [
-    'external-query',
+    'probative-package',
     'create',
-    [
-      'field-agent',
-      'field-supervisor',
-      'processing-operator',
-      'traffic-authority',
-      'technical-admin',
-    ],
+    ['processing-operator', 'AUDITOR', 'technical-admin'],
   ],
   [
-    'evidence',
-    'read',
-    [
-      'field-agent',
-      'field-supervisor',
-      'processing-operator',
-      'traffic-authority',
-      'AUDITOR',
-      'technical-admin',
-    ],
-  ],
+    'probative-package-item',
+    'create',
+    ['processing-operator', 'technical-admin'],
+  ],
+  ['storage-intent', 'create', ['field-agent', 'processing-operator']],
+  ['person', 'read', OPS_SNAPSHOT_SURFACE_ROLES],
+  ['person', 'create', OPS_SNAPSHOT_SURFACE_ROLES],
+  ['vehicle', 'read', OPS_SNAPSHOT_SURFACE_ROLES],
+  ['vehicle', 'create', OPS_SNAPSHOT_SURFACE_ROLES],
+  ['person-document', 'read', OPS_SNAPSHOT_SURFACE_ROLES],
+  ['person-document', 'create', OPS_SNAPSHOT_SURFACE_ROLES],
+  ['vehicle-snapshot', 'read', OPS_SNAPSHOT_SURFACE_ROLES],
+  ['vehicle-snapshot', 'create', OPS_SNAPSHOT_SURFACE_ROLES],
 ];

 const INF_READ_ROLES: readonly DetranRole[] = [
@@ -1060,6 +1099,9 @@ const INF_ADMIN_RESOURCES = new Set([
   'agency-parameter',
   'document-template',
   'mobile-normative-package',
+  // CTG-0003 §7 (M18, TASK-0007).
+  'normative-metrological-table',
+  'signature-policy',
   'measure-type',
   'tow-provider',
   'yard',
@@ -1080,6 +1122,9 @@ const INF_RESOURCES = [
   'agency-parameter',
   'document-template',
   'mobile-normative-package',
+  // CTG-0003 §7 (M18, TASK-0007).
+  'normative-metrological-table',
+  'signature-policy',
   'measure-type',
   'administrative-measure',
   'administrative-term',
diff --git a/docs/framework/blueprints/BP-INF-NORMATIVE-001.json b/docs/framework/blueprints/BP-INF-NORMATIVE-001.json
index 6f7c574..4806f52 100644
--- a/docs/framework/blueprints/BP-INF-NORMATIVE-001.json
+++ b/docs/framework/blueprints/BP-INF-NORMATIVE-001.json
@@ -22,15 +22,34 @@
       {
         "target": "normative-lifecycle.service",
         "symbol": "NormativeLifecycleService"
+      },
+      {
+        "target": "handwritten/normative-commands.provider",
+        "symbol": "NORMATIVE_COMMANDS_PROVIDER"
       }
     ],
     "handwrittenExports": [
       "normative-lifecycle.service",
+      "handwritten/normative-runtime",
+      "handwritten/manifest",
+      "handwritten/package-signer",
+      "handwritten/events",
+      "handwritten/publish-catalog.command",
+      "handwritten/generate-package.command",
+      "handwritten/publish-package.command",
+      "handwritten/validate-package.command",
+      "handwritten/package-content.query",
+      "handwritten/package-sync-metadata.query",
+      "handwritten/normative-commands.service",
+      "handwritten/normative-commands.provider",
       "normative-commands.controller"
     ],
     "moduleExports": ["NormativeLifecycleService"],
     "owners": ["detran-inf"],
-    "description": "Infraction catalog, framing rules, agency parameters, templates, and mobile package versioning ported from TEAT."
+    "description": "Infraction catalog, framing rules, agency parameters, templates, and mobile package versioning ported from TEAT.",
+    "dependencies": {
+      "zod": "^4.6.5"
+    }
   },
   "database": {
     "entities": [
@@ -213,15 +232,45 @@
         "table": "normative_metrological_table",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "catalog_id", "type": "uuid" },
-          { "name": "table_name", "type": "varchar(160)" },
-          { "name": "version", "type": "varchar(80)" },
-          { "name": "table_json", "type": "jsonb" },
-          { "name": "valid_from", "type": "date" },
-          { "name": "valid_to", "type": "date", "nullable": true },
-          { "name": "status", "type": "varchar(40)", "default": "'active'" }
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
+            "name": "catalog_id",
+            "type": "uuid"
+          },
+          {
+            "name": "table_name",
+            "type": "varchar(160)"
+          },
+          {
+            "name": "version",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "table_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "valid_from",
+            "type": "date"
+          },
+          {
+            "name": "valid_to",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'active'"
+          }
         ],
         "indexes": [
           {
@@ -442,16 +491,51 @@
         "table": "signature_policy",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "document_kind", "type": "varchar(80)" },
-          { "name": "required_signers_json", "type": "jsonb" },
-          { "name": "pades_level", "type": "varchar(40)" },
-          { "name": "tsa_required", "type": "boolean", "default": "false" },
-          { "name": "pdfa_required", "type": "boolean", "default": "false" },
-          { "name": "govbr_level", "type": "varchar(40)", "nullable": true },
-          { "name": "status", "type": "varchar(40)", "default": "'active'" }
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
+            "name": "document_kind",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "required_signers_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "pades_level",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "tsa_required",
+            "type": "boolean",
+            "default": "false"
+          },
+          {
+            "name": "pdfa_required",
+            "type": "boolean",
+            "default": "false"
+          },
+          {
+            "name": "govbr_level",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'active'"
+          }
         ],
         "indexes": [
           {
diff --git a/docs/framework/blueprints/BP-OPS-EVIDENCE-001.json b/docs/framework/blueprints/BP-OPS-EVIDENCE-001.json
index 1e54d69..f992d26 100644
--- a/docs/framework/blueprints/BP-OPS-EVIDENCE-001.json
+++ b/docs/framework/blueprints/BP-OPS-EVIDENCE-001.json
@@ -7,24 +7,46 @@
     "version": "1.1.0",
     "ddlFile": "17-ops-evidence.sql",
     "dependencies": {
-      "@detran/ops-core": "workspace:*"
+      "@detran/ops-core": "workspace:*",
+      "@detran/shared": "workspace:*",
+      "zod": "^4.6.5"
     },
     "handwrittenControllers": [
       {
         "target": "handwritten/evidence-custody.controller",
         "symbol": "EvidenceCustodyController"
+      },
+      {
+        "target": "handwritten/evidence-access.controller",
+        "symbol": "EvidenceAccessController"
       }
     ],
     "handwrittenProviders": [
       {
-        "target": "handwritten/evidence-custody.provider",
-        "symbol": "EVIDENCE_CUSTODY_PROVIDER"
+        "target": "handwritten/evidence-commands.provider",
+        "symbol": "EVIDENCE_COMMANDS_PROVIDER"
       }
     ],
     "handwrittenExports": [
+      "handwritten/evidence-runtime",
+      "handwritten/manifest",
+      "handwritten/events",
+      "handwritten/bodycam-projection",
+      "handwritten/local-evidence-storage",
+      "handwritten/initiate-upload.command",
+      "handwritten/complete-upload.command",
+      "handwritten/validate-evidence.command",
+      "handwritten/link-evidence.command",
+      "handwritten/add-custody-event.command",
+      "handwritten/generate-probative-package.command",
+      "handwritten/purge-unverified.command",
+      "handwritten/create-access-request.command",
+      "handwritten/decide-access-request.command",
+      "handwritten/deliver-access-request.command",
+      "handwritten/evidence-commands.service",
+      "handwritten/evidence-commands.provider",
       "handwritten/evidence-custody.controller",
-      "handwritten/evidence-custody.provider",
-      "handwritten/evidence-custody.service"
+      "handwritten/evidence-access.controller"
     ],
     "owners": ["detran-ops"],
     "description": "Evidence metadata, custody and formal access from TEAT evidence workflow and INV-EVIDENCE-001; binary storage remains a STYNX seam.",
diff --git a/docs/framework/blueprints/BP-OPS-SNAPSHOTS-001.json b/docs/framework/blueprints/BP-OPS-SNAPSHOTS-001.json
index db16612..81c2b8d 100644
--- a/docs/framework/blueprints/BP-OPS-SNAPSHOTS-001.json
+++ b/docs/framework/blueprints/BP-OPS-SNAPSHOTS-001.json
@@ -7,7 +7,9 @@
     "version": "1.1.0",
     "ddlFile": "16-ops-snapshots.sql",
     "dependencies": {
-      "@detran/ops-core": "workspace:*"
+      "@detran/ops-core": "workspace:*",
+      "@detran/shared": "workspace:*",
+      "zod": "^4.6.5"
     },
     "handwrittenControllers": [
       {
@@ -17,14 +19,16 @@
     ],
     "handwrittenProviders": [
       {
-        "target": "handwritten/frozen-snapshot.provider",
-        "symbol": "FROZEN_SNAPSHOT_PROVIDER"
+        "target": "handwritten/external-query.provider",
+        "symbol": "EXTERNAL_QUERY_PROVIDER"
       }
     ],
     "handwrittenExports": [
-      "handwritten/frozen-snapshot.controller",
-      "handwritten/frozen-snapshot.provider",
-      "handwritten/frozen-snapshot.service"
+      "handwritten/snapshots-runtime",
+      "handwritten/events",
+      "handwritten/external-query.command",
+      "handwritten/external-query.provider",
+      "handwritten/frozen-snapshot.controller"
     ],
     "owners": ["detran-ops"],
     "description": "Frozen external lookup snapshots preserved for legal acts, migrated from TEAT BP-EXTERNAL-SNAPSHOTS-001.",
diff --git a/package.json b/package.json
index e72b475..a5d369e 100644
--- a/package.json
+++ b/package.json
@@ -2,7 +2,7 @@
   "name": "detran",
   "version": "0.0.1",
   "private": true,
-  "description": "DETRAN suite monorepo \u2014 unified modular-monolith backend (inf/est/ch/ops + transversal portal/dashboard), frontend apps, senatran-mock and the senatran-adapter national-API boundary.",
+  "description": "DETRAN suite monorepo — unified modular-monolith backend (inf/est/ch/ops + transversal portal/dashboard), frontend apps, senatran-mock and the senatran-adapter national-API boundary.",
   "type": "module",
   "license": "UNLICENSED",
   "author": "Antonio Augusto Russo <aarusso@nyxk.com.br>",
@@ -30,7 +30,7 @@
     "backend:db:reset": "bash backend/database/apply.sh --full",
     "backend:rls-smoke": "tsx tools/check-rls-smoke.ts",
     "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/ops-agency test:unit && pnpm --filter @detran/ops-field test:unit && pnpm --filter @detran/ops-snapshots test:unit && pnpm --filter @detran/ops-evidence test:unit && pnpm --filter @detran/ops-offline-sync test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-collection test:unit && pnpm --filter @detran/inf-rait-org test:unit && pnpm --filter @detran/inf-rait-integration test:unit",
-    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration",
+    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration",
     "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/ops-agency test:e2e && pnpm --filter @detran/ops-field test:e2e && pnpm --filter @detran/ops-snapshots test:e2e && pnpm --filter @detran/ops-evidence test:e2e && pnpm --filter @detran/ops-offline-sync test:e2e && pnpm --filter @detran/inf-ait test:e2e",
     "backend:test:real": "pnpm --filter @detran/app test:real",
     "backend:test:in-house": "pnpm --filter @detran/app test:in-house",

```

## Anexo C — arquivos gerados/regenerados

```text
backend/app/src/app.module.ts
backend/database/ddl/16-ops-snapshots.sql
backend/database/ddl/17-ops-evidence.sql
backend/database/ddl/30-inf-normative.sql
backend/domains/inf/normative/src/controllers/mobile-normative-package.controller.ts
backend/domains/inf/normative/src/controllers/normative-agency-parameter.controller.ts
backend/domains/inf/normative/src/controllers/normative-catalog.controller.ts
backend/domains/inf/normative/src/controllers/normative-document-template.controller.ts
backend/domains/inf/normative/src/controllers/normative-framing.controller.ts
backend/domains/inf/normative/src/controllers/normative-metrological-table.controller.ts
backend/domains/inf/normative/src/controllers/normative-validation-rule.controller.ts
backend/domains/inf/normative/src/controllers/signature-policy.controller.ts
backend/domains/inf/normative/src/dto/create-mobile-normative-package.dto.ts
backend/domains/inf/normative/src/dto/create-normative-agency-parameter.dto.ts
backend/domains/inf/normative/src/dto/create-normative-catalog.dto.ts
backend/domains/inf/normative/src/dto/create-normative-document-template.dto.ts
backend/domains/inf/normative/src/dto/create-normative-framing.dto.ts
backend/domains/inf/normative/src/dto/create-normative-metrological-table.dto.ts
backend/domains/inf/normative/src/dto/create-normative-validation-rule.dto.ts
backend/domains/inf/normative/src/dto/create-signature-policy.dto.ts
backend/domains/inf/normative/src/entities/mobile-normative-package.entity.ts
backend/domains/inf/normative/src/entities/normative-agency-parameter.entity.ts
backend/domains/inf/normative/src/entities/normative-catalog.entity.ts
backend/domains/inf/normative/src/entities/normative-document-template.entity.ts
backend/domains/inf/normative/src/entities/normative-framing.entity.ts
backend/domains/inf/normative/src/entities/normative-metrological-table.entity.ts
backend/domains/inf/normative/src/entities/normative-validation-rule.entity.ts
backend/domains/inf/normative/src/entities/signature-policy.entity.ts
backend/domains/inf/normative/src/index.ts
backend/domains/inf/normative/src/normative.module.ts
backend/domains/inf/normative/src/repositories/mobile-normative-package.repository.ts
backend/domains/inf/normative/src/repositories/normative-agency-parameter.repository.ts
backend/domains/inf/normative/src/repositories/normative-catalog.repository.ts
backend/domains/inf/normative/src/repositories/normative-document-template.repository.ts
backend/domains/inf/normative/src/repositories/normative-framing.repository.ts
backend/domains/inf/normative/src/repositories/normative-metrological-table.repository.ts
backend/domains/inf/normative/src/repositories/normative-validation-rule.repository.ts
backend/domains/inf/normative/src/repositories/signature-policy.repository.ts
backend/domains/inf/normative/src/services/mobile-normative-package.service.ts
backend/domains/inf/normative/src/services/normative-agency-parameter.service.ts
backend/domains/inf/normative/src/services/normative-catalog.service.ts
backend/domains/inf/normative/src/services/normative-document-template.service.ts
backend/domains/inf/normative/src/services/normative-framing.service.ts
backend/domains/inf/normative/src/services/normative-metrological-table.service.ts
backend/domains/inf/normative/src/services/normative-validation-rule.service.ts
backend/domains/inf/normative/src/services/signature-policy.service.ts
backend/domains/ops/evidence/src/controllers/custody-event.controller.ts
backend/domains/ops/evidence/src/controllers/evidence-access-request.controller.ts
backend/domains/ops/evidence/src/controllers/evidence-link.controller.ts
backend/domains/ops/evidence/src/controllers/evidence.controller.ts
backend/domains/ops/evidence/src/controllers/probative-package-item.controller.ts
backend/domains/ops/evidence/src/controllers/probative-package.controller.ts
backend/domains/ops/evidence/src/controllers/storage-intent.controller.ts
backend/domains/ops/evidence/src/dto/create-custody-event.dto.ts
backend/domains/ops/evidence/src/dto/create-evidence-access-request.dto.ts
backend/domains/ops/evidence/src/dto/create-evidence-link.dto.ts
backend/domains/ops/evidence/src/dto/create-evidence.dto.ts
backend/domains/ops/evidence/src/dto/create-probative-package-item.dto.ts
backend/domains/ops/evidence/src/dto/create-probative-package.dto.ts
backend/domains/ops/evidence/src/dto/create-storage-intent.dto.ts
backend/domains/ops/evidence/src/entities/custody-event.entity.ts
backend/domains/ops/evidence/src/entities/evidence-access-request.entity.ts
backend/domains/ops/evidence/src/entities/evidence-link.entity.ts
backend/domains/ops/evidence/src/entities/evidence.entity.ts
backend/domains/ops/evidence/src/entities/probative-package-item.entity.ts
backend/domains/ops/evidence/src/entities/probative-package.entity.ts
backend/domains/ops/evidence/src/entities/storage-intent.entity.ts
backend/domains/ops/evidence/src/evidence.module.ts
backend/domains/ops/evidence/src/index.ts
backend/domains/ops/evidence/src/repositories/custody-event.repository.ts
backend/domains/ops/evidence/src/repositories/evidence-access-request.repository.ts
backend/domains/ops/evidence/src/repositories/evidence-link.repository.ts
backend/domains/ops/evidence/src/repositories/evidence.repository.ts
backend/domains/ops/evidence/src/repositories/probative-package-item.repository.ts
backend/domains/ops/evidence/src/repositories/probative-package.repository.ts
backend/domains/ops/evidence/src/repositories/storage-intent.repository.ts
backend/domains/ops/evidence/src/services/custody-event.service.ts
backend/domains/ops/evidence/src/services/evidence-access-request.service.ts
backend/domains/ops/evidence/src/services/evidence-link.service.ts
backend/domains/ops/evidence/src/services/evidence.service.ts
backend/domains/ops/evidence/src/services/probative-package-item.service.ts
backend/domains/ops/evidence/src/services/probative-package.service.ts
backend/domains/ops/evidence/src/services/storage-intent.service.ts
backend/domains/ops/snapshots/src/controllers/external-query.controller.ts
backend/domains/ops/snapshots/src/controllers/person-document.controller.ts
backend/domains/ops/snapshots/src/controllers/person.controller.ts
backend/domains/ops/snapshots/src/controllers/vehicle-snapshot.controller.ts
backend/domains/ops/snapshots/src/controllers/vehicle.controller.ts
backend/domains/ops/snapshots/src/dto/create-external-query.dto.ts
backend/domains/ops/snapshots/src/dto/create-person-document.dto.ts
backend/domains/ops/snapshots/src/dto/create-person.dto.ts
backend/domains/ops/snapshots/src/dto/create-vehicle-snapshot.dto.ts
backend/domains/ops/snapshots/src/dto/create-vehicle.dto.ts
backend/domains/ops/snapshots/src/entities/external-query.entity.ts
backend/domains/ops/snapshots/src/entities/person-document.entity.ts
backend/domains/ops/snapshots/src/entities/person.entity.ts
backend/domains/ops/snapshots/src/entities/vehicle-snapshot.entity.ts
backend/domains/ops/snapshots/src/entities/vehicle.entity.ts
backend/domains/ops/snapshots/src/index.ts
backend/domains/ops/snapshots/src/repositories/external-query.repository.ts
backend/domains/ops/snapshots/src/repositories/person-document.repository.ts
backend/domains/ops/snapshots/src/repositories/person.repository.ts
backend/domains/ops/snapshots/src/repositories/vehicle-snapshot.repository.ts
backend/domains/ops/snapshots/src/repositories/vehicle.repository.ts
backend/domains/ops/snapshots/src/services/external-query.service.ts
backend/domains/ops/snapshots/src/services/person-document.service.ts
backend/domains/ops/snapshots/src/services/person.service.ts
backend/domains/ops/snapshots/src/services/vehicle-snapshot.service.ts
backend/domains/ops/snapshots/src/services/vehicle.service.ts
backend/domains/ops/snapshots/src/snapshots.module.ts
pnpm-lock.yaml

```

## Anexo — `work/rounds/R-0008/reports/TASK-0006.md`

```markdown
Papel: Inspector (Art. 6)
Tarefa: TASK-0006
Arquivos criados/alterados: seed 27-fixtures-teat-evidence.sql; policy.spec.ts (bloco CTG-0003 §7, 25 casos); ops/evidence/src/handwritten/_.command.spec.ts (7 arquivos, 36 casos) + tests/integration (harness + 4 specs); ops/snapshots/src/handwritten/external-query.command.spec.ts + tests/integration (external-query, senatran-boundary); inf/normative/src/handwritten/_.spec.ts (4) + tests/integration (2); backend/app/tests/e2e/teat-evidence-normative.e2e.spec.ts (14 casos).
Comandos executados e saída resumida: seed idempotente OK; unit/integration vermelhos por módulo ausente (TASK-0007); app e2e 60 pré-existentes verdes + 2/14 novos verdes; shared 140/165; verify:parameter-catalogue OK; typecheck OK; format limpo; pnpm check exit 0.
Critérios de aceitação: todos PASS.
Fora do escopo / deixado: OD-T30/OD-T31 sem teste (sem rota/guarda nesta rodada); tabela metrológica com source_pending.
OD tocadas ou propostas: observações (1) storage_intent.local_evidence_id uuid (DDL) × ≤120 (DTO) — testes seguem a DDL; (2) `GET mobile-packages/sync-metadata` capturado por `GET mobile-packages/:id` gerado (500) — ordem de registro dos controladores.
Bloqueios: nenhum.
Tokens do subagente: 520.935 brutos (168 chamadas, 43 min).
```

## Anexo — `work/rounds/R-0008/reports/TASK-0007.md`

```markdown
Papel: Engineer (Art. 6)
Tarefa: TASK-0007 (iteração 1)
Arquivos criados/alterados: ops/evidence/src/handwritten/* (runtime, manifest, events, bodycam-projection, local-evidence-storage, 10 comandos, service, provider, evidence-access.controller; evidence-custody.controller reescrito; service/provider antigos removidos); ops/snapshots/src/handwritten/* (runtime, external-query command/provider, events; frozen-snapshot.controller reescrito); inf/normative/src/handwritten/* (runtime, manifest, package-signer, events, 5 comandos, 2 queries, service, provider) + normative-commands.controller/lifecycle reescritos; ops/core/src/storage.ts; policy.ts (§7); app teat-evidence/teat-snapshots providers + app.module; package.json (inf-normative integration); blueprints (bloco module) + gerados.
Comandos executados e saída resumida: ops-evidence unit 36/36, integration 5/5; ops-snapshots unit 7/7, integration 2/2; inf-normative unit 17/17, integration 3/3; inf-ait integration 24/24; app e2e 72/72; app integration 11/11; shared 164/165 (contradição WP-T0 × CTG-0003 §7); backend:test:integration/e2e verdes; typecheck ok; blueprints/contracts/decorators(858)/boundary/format/parameter-catalogue ok.
Critérios de aceitação: todos PASS exceto shared test (1 caso WP-T0 contraditório) e backend:test:unit (pelo mesmo elo).
Fora do escopo / deixado: zod não introduzido (sem link); snapshots sem dependência real do adapter (tipagem estrutural); versões dos blueprints mantidas; projeção de bodycam só nas leituras manuscritas; EVIDENCE_TYPE_NOT_IN_CATALOG desligado (OD-T31); quarantined/archived/superseded sem comando (OD-T30).
OD tocadas ou propostas: OD-T51…OD-T59 (ver contrato CTG-0003 §13 — decisões do maestro).
Bloqueios: shared test (OD-T51); `git status` executado uma vez (leitura); outro processo rodou blueprints:generate na mesma worktree concorrentemente (árvore convergiu).
Tokens do subagente: 89.973 reportados (3 chamadas registradas; 69 min) — contagem do harness aparentemente parcial.
```
