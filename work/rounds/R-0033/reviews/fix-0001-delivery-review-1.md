# Delivery-review FIX-0001 — paridade `rait-fixtures.json` × seed (modo `delivery-review`)

> Você é o **reviewer** da orquestra `frontend-preview` (rodada `R-0033`), modelo da família
> **oposta** à do maestro (maestro: Claude Code Fable 5.1; você: Codex Sol 6). Você não escreve
> código: você julga. Papel constitucional: **Auditor** (soft gate, Constituição DEVAI Art. 18).
> Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/rait-fixtures-json-parity` (branch
> `fix/rait-fixtures-json-parity`, um commit sobre `origin/main` 51ec27f0). Responda **apenas** com
> o JSON do §Saída, sem prosa antes ou depois.

## Autoridade (não reabra)

- Decisão do Owner OD-C3-008 (a), 2026-10-15, texto literal: "open a separate fixture PR
  transcribing the missing collections and fields from seed 20-fixtures-rait.sql into
  rait-fixtures.json with the same ids, before TASK-0003." Registro:
  `docs/meta/knowledge-base/open-decisions-rait.md` §C-0003 (na branch da rodada) e
  `work/rounds/R-0033/AUTHORIZATION.md` Adenda B2 (idem). Esta entrega é um **PR próprio contra
  `main`**, não parte do PR da R-0033.
- `docs/framework/arch/rait-fixtures.md` (intro): "Alterar uma fixture é mudança de contrato de
  teste (PR próprio)" — por isso a autoria é do Inspector e a revisão é sua.
- Prompt do worker: `/Volumes/Thiamat II/stech/detran/.claude/worktrees/frontend-preview-5281e3/work/rounds/R-0033/prompts/FIX-0001-rait-fixtures-parity.md`
  (leia-o: fronteira de 3 arquivos, "só adições", "nada inventado", "sem coluna → sem campo").

## Leitura (fechada)

1. `docs/meta/agents/orchestra/README.md` §4 e §5; `docs/meta/agents/inspector-tests.md`.
2. `backend/database/seed/20-fixtures-rait.sql` (a fonte única) e, para os ids de usuários,
   `backend/database/seed/00-fixtures-core.sql`.
3. Os três arquivos entregues: `docs/framework/arch/fixtures/rait-fixtures.json`,
   `docs/framework/arch/rait-fixtures.md` (§7 e §10), `apps/rait/web/src/testing/fixtures-parity.spec.ts`.
4. Consumidores da JSON que devem continuar verdes sem edição: `apps/rait/web/src/testing/http-fixtures.ts`,
   `kb.ts`, `clock.stub.ts` e os specs que os citam (`git diff --stat origin/main...HEAD` mostra
   que nenhum foi tocado).
5. O relatório do worker, transcrito abaixo em §Material.

## Rubrica (cite arquivo e linha)

| #   | Item                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Papel: Inspector autora fixture/spec; nada de produção (`src/app/**`), nada de seed editado (Art. 6/10)                                                                                                                                  |
| 5   | **Nada inventado**: todo valor novo da JSON existe na seed 20 com o mesmo id; nenhum campo sem coluna; nenhum id novo; `tenant_id` omitido; nenhum dado real                                                                             |
| 7   | Gates não enfraquecidos: nenhum spec existente editado; o spec novo é fail-closed (parser rejeita formas desconhecidas) e cobre os dois sentidos (seed → JSON e JSON → seed)                                                             |
| 8   | Vocabulário canônico preservado: nomes camelCase derivados das colunas; apelidos herdados (`protocol`, `pool`, `userId`, `code`, `body`, `session`) mantidos com o mesmo valor                                                           |
| 11  | Entrega completa: todas as 30 tabelas `inf.rait_*` da seed 20 têm coleção; as 13 divergências herdadas data × timestamp estão listadas e **não** alteradas (regra "só adições"); §10 documenta colunas ausentes da seed que ficaram fora |
| 12  | Fronteira: só os 3 arquivos; nenhuma mudança de valor existente (compare `git show origin/main:docs/framework/arch/fixtures/rait-fixtures.json` com a versão nova para as chaves pré-existentes)                                         |

Amostragem mínima exigida: confira na seed, linha a linha, pelo menos 3 registros de 5 coleções
novas distintas e 3 campos novos de `cases`; confira que `raitPools` tem as 3 tuplas do `insert`
único; confira que os 3 `update` da seed (membro 10, impedimento 1) estão refletidos.

## Veredito

- **PASS**: nenhum achado `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um `high` corrigível pelo Inspector sem mudar a decisão do Owner.
- **FAIL**: valor inventado, id novo, valor existente alterado, spec existente editado, seed
  editada, ou arquivo fora da fronteira.

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0033",
  "item": "FIX-0001",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 5,
      "file": "docs/framework/arch/fixtures/rait-fixtures.json",
      "line": 1,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": ["…"]
}
```

## Material anexado pelo maestro

### `git diff --stat origin/main...HEAD`

```text
 apps/rait/web/src/testing/fixtures-parity.spec.ts |  411 ++++++
 docs/framework/arch/fixtures/rait-fixtures.json   | 1621 ++++++++++++++++++++-
 docs/framework/arch/rait-fixtures.md              |   79 +-
 3 files changed, 2034 insertions(+), 77 deletions(-)
```

### Diff de `rait-fixtures.md` (inteiro) e `fixtures-parity.spec.ts` (arquivo novo, inteiro)

```diff
diff --git a/docs/framework/arch/rait-fixtures.md b/docs/framework/arch/rait-fixtures.md
index 39ca1b3e..1ae48a20 100644
--- a/docs/framework/arch/rait-fixtures.md
+++ b/docs/framework/arch/rait-fixtures.md
@@ -3,7 +3,7 @@ id: ARCH-RAIT-FIXTURES
 title: Fixtures canônicas do RAIT — personas, tenant, casos por estado, sessões, relógios e calendário
 status: draft
 apps: [rait, teat]
-updated: 2026-09-16
+updated: 2026-10-15
 ---

 # Fixtures canônicas
@@ -111,7 +111,8 @@ bash backend/database/seed.sh                     # fixtures (idempotente)
```

Testes `integration`/`e2e` assumem a seed aplicada; testes `unit` e do frontend importam
\-`docs/framework/arch/fixtures/rait-fixtures.json`. Para tenant de isolamento em testes de RLS, +`docs/framework/arch/fixtures/rait-fixtures.json`. Desde 2026-10-15 a JSON traz todas as
+coleções e colunas de `20-fixtures-rait.sql`, com os mesmos ids (§10). Para tenant de isolamento em testes de RLS,
crie um segundo tenant efêmero com `randomUUID()` (padrão de `audit-persistence.integration.spec.ts`);
nunca altere o tenant das fixtures.

@@ -204,3 +205,77 @@ Arquivos: `26-fixtures-teat-field.sql` (campo/turno/numeração/sincronização)
o que `25-fixtures-teat.sql` semeia (dispositivos, faixa, reservas, pacote normativo `…e7000001`);
`27-fixtures-teat-evidence.sql` (evidência/custódia/snapshots/catálogo normativo);
`28-fixtures-teat-measures-alcohol.sql` (medidas/alcoolemia/velocidade). +
+## 10. Forma JSON: paridade com a seed (2026-10-15) +
+Decisão do Owner OD-C3-008 (a) (R-0033, FIX-0001): `./fixtures/rait-fixtures.json` transcreve
+de `backend/database/seed/20-fixtures-rait.sql` todas as linhas `insert into inf.rait_*`, com os
+mesmos ids e os mesmos valores. A transcrição só acrescenta: nenhuma chave, id ou valor que já
+existia mudou. A paridade é provada por `apps/rait/web/src/testing/fixtures-parity.spec.ts`, que
+lê a seed do disco. + +**Convenção.** Coleção em camelCase no plural; campo = coluna em camelCase (`case_id` → +`caseId`); `tenant_id` omitido (o tenant está em `tenant`); datas e timestamps exatamente como na
+seed (`'2026-09-14T09:00:00-04:00'` → `"2026-09-14T09:00:00-04:00"`); `null` → `null`; booleanos
+→ `true`/`false`; inteiros → números; `'…'::jsonb` → o valor JSON correspondente (`payload`, +`content`, `missingItems`). Cada registro só traz as colunas que o seu próprio `insert` traz: sem
+coluna na seed, não há campo na JSON (nada completado por analogia). Os três `update` da seed
+(linhas 17, 170 e 171) são aplicados: membro de pool 10 com `status` `ADVERTIDO`, +`lateOpinionCount` 2 e `isSubstitute` `true`; impedimento 1 com `kind` e `legalBasis`. + +**Nomes herdados.** Os campos que a JSON já tinha com outro nome e o mesmo valor da coluna ficam
+como estavam e valem pela coluna: `poolMembers.pool` (`pool_id`), `poolMembers.userId`
+(`person_id`), `cases.protocol` (`protocol_number`), `clocks.code` (`clock_code`), +`sessions.body` (`judging_body`), `agendaItems.session` (`session_id`). `cases.protocolledOn` é só
+da JSON e é a data de `protocolledAt`. O mapa `pools` (`instância → id`) continua como está; os
+registros de `rait_pool` estão na coleção nova `raitPools`, porque `pools` não é uma lista. + +**Formas herdadas que divergem da seed.** Treze campos que já existiam trazem só a data
+(`AAAA-MM-DD`) de um timestamp da seed. Como a transcrição não muda valores existentes, eles
+continuam assim, e o spec confere que cada um é exatamente o prefixo de data da seed: +`raitBatches` `…28000002.drawnAt`, `…28000003.drawnAt` e `.acceptedAt`; `raitBatchItems` +`…28010003.declinedAt`, `…28010004.acceptedAt`; `raitSubstituteDuties` `…29000001.designatedAt` e +`.convenedAt`, `…29000002.designatedAt`; `raitBenches` `…35000002.confirmedAt`, +`…35000003.insufficientAt`, `…35000004.confirmedAt`; `raitPendingContents` `…36000002.closedAt`, +`…36000003.closedAt`. Para trocá-los pelo timestamp completo é preciso mudar um valor existente,
+o que fica fora desta transcrição. +
+| Coleção JSON | Tabela da seed (linhas) | Nº | Campos acrescentados | `source_pending` (obrigatório no modelo, sem coluna na seed) |
+| ----------------------- | ------------------------------------------ | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
+| `raitPools` (nova) | `rait_pool` (3, um `insert` com 3 tuplas) | 3 | `id`, `name`, `instance`, `circuit`, `strategy` | `active`, `priority_policy`, `created_at` |
+| `poolMembers` | `rait_pool_member` (4–16; `update` 17/170) | 13 | `memberRole` já existia; + `status`, `mandateStartsOn`, `mandateEndsOn`; no membro 10, + `lateOpinionCount`, `isSubstitute` | `unjustified_absence_count`, `created_at` |
+| `cases` | `rait_case` (18–75, intercaladas) | 20 | + `circuit`, `intakeChannel`, `protocolledAt`, `lastMovementAt` e, conforme o caso, `admittedAt`, `suspensiveEffect`, `remittedAt`, `judgeBodyReceivedAt`, `decidedAt`, `communicatedAt`, `closedAt`, `archived`, `nonAdmissionReason`, `cetranReceivedAt` | `pending_completion`, `version`, `created_at` |
+| `parties` (nova) | `rait_party` (19–76, intercaladas) | 20 | `id`, `caseId`, `role`, `legitimacyBasis`, `personName`, `documentNumber`, `contactEmail` | `representation_verified`, `created_at` |
+| `documents` (nova) | `rait_document` (20–77, intercaladas) | 20 | `id`, `caseId`, `kind`, `origin`, `storageKey`, `filename`, `contentHash`, `digitisedFromPaper`, `attachedBy` | `attached_at`, `created_at` |
+| `admissibility` (nova) | `rait_admissibility` (78–105) | 28 | `id`, `caseId`, `criterion`, `verdict`, `reason`, `evaluatedBy` | `evaluated_at`, `created_at` |
+| `deadlines` (nova) | `rait_deadline` (106–112) | 7 | `id`, `caseId`, `timerCode`, `startBasis`, `startedOn`, `rawDueOn`, `dueOn`, `businessDays`, `legalBasis` | `extension_count`, `created_at` |
+| `inquiries` (nova) | `rait_inquiry` (113) | 1 | `id`, `caseId`, `addressee`, `subject`, `requestedAt`, `requestedBy`, `dueOn` | `extension_count`, `created_at` |
+| `decisions` (nova) | `rait_decision` (114–118) | 5 | `id`, `caseId`, `circuit`, `decisionKind`, `grounds`, `decidedBy`, `sessionId`, `signatureKind`, `signatureRef`, `publishedAt` | `decided_at`, `created_at` |
+| `communications` (nova) | `rait_communication` (119–121) | 3 | `id`, `caseId`, `decisionId`, `channel`, `sentAt`, `effectiveOn`, `nextDeadlineOn`, `authorityAppealNotice`, `contentRef` | `created_at` |
+| `caseEvents` (nova) | `rait_case_event` (122–126) | 5 | `id`, `caseId`, `eventType`, `fromState`, `toState`, `occurredAt`, `actorId`, `payload` | `created_at` |
+| `assignments` (nova) | `rait_assignment` (127–136) | 10 | `id`, `caseId`, `poolId`, `memberId`, `assignedBy`, `active`; no registro liberado, + `releasedAt`, `releaseReason` | `assigned_at`, `created_at` |
+| `impediments` (nova) | `rait_impediment` (137; `update` 171) | 1 | `id`, `caseId`, `memberId`, `basis`, `kind`, `legalBasis` | `declared_at`, `created_at` |
+| `clocks` | `rait_clock` (138–143) | 6 | + `startedOn`, `legalBasis` | `flag_changed_at`, `created_at` |
+| `clockAlerts` (nova) | `rait_clock_alert` (144–148) | 5 | `id`, `clockId`, `level`, `notifiedRole`, `incidentRef` | `raised_at`, `created_at` |
+| `sessions` | `rait_session` (149–152) | 4 | + `scheduledFor`, `quorumRequired`, `chairMemberId` e, conforme a sessão, `agendaClosedAt`, `convenedAt`, `openedAt`, `closedAt`, `quorumObserved` | `extraordinary`, `modality`, `short_notice_ack`, `version`, `created_at` |
+| `agendaItems` | `rait_agenda_item` (153–155) | 3 | + `position`, `priority`, `rapporteurMemberId`, `opinionSummary`, `opinionAnalysis`, `opinionVote`, `opinionRegisteredAt` e, nos itens 2 e 3, `readAt`, `proclaimedAt` | `withdrawn`, `version`, `created_at` |
+| `attendance` (nova) | `rait_attendance` (156–162) | 7 | `id`, `sessionId`, `memberId`, `present`, `isChair`, `absenceJustified` | `is_chair_substitute`, `created_at` |
+| `votes` (nova) | `rait_vote` (163–166) | 4 | `id`, `agendaItemId`, `memberId`, `vote`, `castAt` | `casting_vote`, `created_at` |
+| `minutes` (nova) | `rait_minutes` (167) | 1 | `id`, `sessionId`, `content`, `generatedAt`, `signedAt`, `signedBy`, `signatureKind`, `signatureRef`, `documentHash`, `publishedAt` | `version`, `created_at` |
+| `raitUnits` | `rait_unit` (174–176) | 3 | + `coordinatorMemberId` (`null`) nas turmas 2 e 3 | `created_at` |
+| `raitSchedules` | `rait_schedule` (178–180) | 3 | + `poolId`, `wipLimit`, `publishedAt`, `publishedBy`; `absenceReason` (`null`) onde faltava | `version`, `created_at` |
+| `raitScheduleSlots` | `rait_schedule_slot` (182–186) | 5 | + `absenceReason` (`null`) onde faltava | `created_at` |
+| `raitBatches` | `rait_batch` (188–190) | 3 | + `seed`, `openedBy`, `homologatedAt`, `homologatedBy`; `drawnAt`/`acceptedAt` (`null`) onde faltavam | `opened_at`, `version`, `created_at` |
+| `raitBatchItems` | `rait_batch_item` (192–195) | 4 | + `memberId`, `claimDueOn`, `acceptedAt`, `declinedAt`, `declineKind` onde faltavam | `created_at` |
+| `raitSubstituteDuties` | `rait_substitute_duty` (197–198) | 2 | + `convenedAt` (`null`) no registro 2 | `created_at` |
+| `raitBenches` | `rait_bench` (200–203) | 4 | + `parityObserved`, `confirmedAt`, `insufficientAt` onde faltavam | `created_at` |
+| `raitPendingContents` | `rait_pending_content` (205–207) | 3 | + `missingItems`, `openedBy`; `closedAt`/`outcome` (`null`) no registro 1 | `opened_at`, `created_at` |
+| `raitRedirects` | `rait_redirect` (209–210) | 2 | + `aitNumber`, `counterpartAgency`, `counterpartRenainfCode`, `redirectedAt`, `redirectedBy`; `caseId`, `originProtocolledOn`, `deadlineRestored` onde faltavam | `created_at` |
+| `raitDrafts` | `rait_draft` (212–215) | 4 | + `authorId`, `contentHash`, `submittedAt`, `returnedAt`, `returnGuidance`, `returnCount` (onde faltava), `documentId` (nos 3 registros que a seed traz) | `created_at` | +
+A coluna `source_pending` lista os campos obrigatórios do tipo gerado (`@detran/api-clients`, +`BP-INF-RAIT-*-001`) que a seed 20 não fixa. A JSON não os traz, e quem a consome (a prévia, +`frontend-preview-mode.md` D-06) os marca `source_pending`. Fixá-los é trabalho da seed, não da
+JSON. Ficam fora desta seção as coleções que não vêm da seed 20 (`raitHolidays` … `raitReconciliations`,
+seeds 40–60) e as infrações, timers e avisos (`30-fixtures-infraction.sql`), que a JSON ainda não
+transcreve.

// FIX-0001 (Inspector, OD-C3-008 (a)). Prova de paridade entre a forma SQL e a forma JSON da
// fixture canônica do RAIT (`docs/framework/arch/rait-fixtures.md` intro e §10: "três formas
// sincronizadas"). Fonte única: `backend/database/seed/20-fixtures-rait.sql`, lida do disco com
// um parser mínimo — nenhum valor é copiado para este arquivo além dos nomes de tabela/coleção,
// das contagens do contrato, dos apelidos herdados e da lista fechada de divergências de forma
// herdadas (rait-fixtures.md §10).
//
// Forma da seed verificada (e imposta — o parser falha fechado em qualquer outra): linhas
// `insert into inf.rait_<tabela> (<cols>) values (<tupla>)[, (<tupla>)…] on conflict …;` com
// literais `'texto'` (aspas simples, `''` como escape), `'…'::jsonb`, `null`, `true`, `false` e
// inteiros; sem subselect nem expressão. Exceções registradas: `rait_pool` tem um `insert` com 3
// tuplas; três linhas `update inf.rait_<tabela> set <col> = <literal>[, …] where id = '<id>';`
// ajustam registros já inseridos (membro de pool 10 e impedimento 1) e são aplicadas por cima.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIXTURES_PATH, REPO_ROOT } from './kb';

type SeedValue =
| string
| number
| boolean
| null
| readonly unknown[]
| Readonly<Record<string, unknown>>;
type SeedRow = Record<string, SeedValue>;

const SEED_PATH = join(REPO_ROOT, 'backend/database/seed/20-fixtures-rait.sql');

/** Tabela da seed 20 → coleção JSON (rait-fixtures.md §10). `rait_pool` vira `raitPools`

- porque `pools` já é o mapa `instância → id` lido por `http-fixtures.ts` (`POOL_IDS`). */
  const TABLE_TO_COLLECTION: Readonly<Record<string, string>> = {
  rait_pool: 'raitPools',
  rait_pool_member: 'poolMembers',
  rait_case: 'cases',
  rait_party: 'parties',
  rait_document: 'documents',
  rait_admissibility: 'admissibility',
  rait_assignment: 'assignments',
  rait_case_event: 'caseEvents',
  rait_clock: 'clocks',
  rait_clock_alert: 'clockAlerts',
  rait_communication: 'communications',
  rait_deadline: 'deadlines',
  rait_decision: 'decisions',
  rait_draft: 'raitDrafts',
  rait_impediment: 'impediments',
  rait_inquiry: 'inquiries',
  rait_minutes: 'minutes',
  rait_pending_content: 'raitPendingContents',
  rait_redirect: 'raitRedirects',
  rait_schedule: 'raitSchedules',
  rait_schedule_slot: 'raitScheduleSlots',
  rait_session: 'sessions',
  rait_agenda_item: 'agendaItems',
  rait_attendance: 'attendance',
  rait_vote: 'votes',
  rait_batch: 'raitBatches',
  rait_batch_item: 'raitBatchItems',
  rait_bench: 'raitBenches',
  rait_substitute_duty: 'raitSubstituteDuties',
  rait_unit: 'raitUnits',
  };

/** Contagem de tuplas por tabela fixada no prompt FIX-0001 ("Definições que valem como contrato"). */
const EXPECTED_COUNTS: Readonly<Record<string, number>> = {
rait_pool: 3,
rait_pool_member: 13,
rait_case: 20,
rait_party: 20,
rait_document: 20,
rait_admissibility: 28,
rait_assignment: 10,
rait_case_event: 5,
rait_clock: 6,
rait_clock_alert: 5,
rait_communication: 3,
rait_deadline: 7,
rait_decision: 5,
rait_draft: 4,
rait_impediment: 1,
rait_inquiry: 1,
rait_minutes: 1,
rait_pending_content: 3,
rait_redirect: 2,
rait_schedule: 3,
rait_schedule_slot: 5,
rait_session: 4,
rait_agenda_item: 3,
rait_attendance: 7,
rait_vote: 4,
rait_batch: 3,
rait_batch_item: 4,
rait_bench: 4,
rait_substitute_duty: 2,
rait_unit: 3,
};

/** Nomes de campo herdados da JSON anterior a FIX-0001 (mesmo valor da coluna, outro nome);

- não são renomeados (rait-fixtures.md §10). */
  const ALIASES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  rait_pool_member: { pool_id: 'pool', person_id: 'userId' },
  rait_case: { protocol_number: 'protocol' },
  rait_clock: { clock_code: 'code' },
  rait_session: { judging_body: 'body' },
  rait_agenda_item: { session_id: 'session' },
  };

/** Lista fechada das divergências de forma herdadas (rait-fixtures.md §10): a JSON anterior a

- FIX-0001 traz só a data (`AAAA-MM-DD`) de um timestamp da seed; FIX-0001 não altera valor
- existente, então o campo deve ser exatamente o prefixo de data do valor da seed. Chave:
- `<tabela>/<id>/<coluna>`. */
  const DATE_ONLY_INHERITED: ReadonlySet<string> = new Set([
  'rait_batch/00000000-0000-7000-8000-000028000002/drawn_at',
  'rait_batch/00000000-0000-7000-8000-000028000003/drawn_at',
  'rait_batch/00000000-0000-7000-8000-000028000003/accepted_at',
  'rait_batch_item/00000000-0000-7000-8000-000028010003/declined_at',
  'rait_batch_item/00000000-0000-7000-8000-000028010004/accepted_at',
  'rait_substitute_duty/00000000-0000-7000-8000-000029000001/designated_at',
  'rait_substitute_duty/00000000-0000-7000-8000-000029000001/convened_at',
  'rait_substitute_duty/00000000-0000-7000-8000-000029000002/designated_at',
  'rait_bench/00000000-0000-7000-8000-000035000002/confirmed_at',
  'rait_bench/00000000-0000-7000-8000-000035000003/insufficient_at',
  'rait_bench/00000000-0000-7000-8000-000035000004/confirmed_at',
  'rait_pending_content/00000000-0000-7000-8000-000036000002/closed_at',
  'rait_pending_content/00000000-0000-7000-8000-000036000003/closed_at',
  ]);

function camel(column: string): string {
return column.replace(/_([a-z0-9])/g, (_match, char: string) =>
char.toUpperCase(),
);
}

/** Cursor sobre uma linha da seed. */
class Cursor {
constructor(
private readonly text: string,
private readonly lineNo: number,
public pos = 0,
) {}

fail(message: string): never {
throw new Error(
`seed 20 linha ${this.lineNo}: ${message} em "${this.text.slice(this.pos, this.pos + 40)}"`,
);
}

skipSpaces(): void {
while (this.text[this.pos] === ' ') this.pos += 1;
}

peek(): string | undefined {
return this.text[this.pos];
}

expect(token: string): void {
this.skipSpaces();
if (!this.text.startsWith(token, this.pos))
this.fail(`esperado "${token}"`);
this.pos += token.length;
}

rest(): string {
return this.text.slice(this.pos);
}

/** Um literal: `'texto'`, `'json'::jsonb`, `null`, `true`, `false` ou inteiro. */
literal(): SeedValue {
this.skipSpaces();
if (this.peek() === "'") {
let value = '';
let index = this.pos + 1;
for (;;) {
const char = this.text[index];
if (char === undefined) this.fail('string sem fechamento');
if (char === "'") {
if (this.text[index + 1] === "'") {
value += "'";
index += 2;
continue;
}
break;
}
value += char;
index += 1;
}
this.pos = index + 1;
if (this.text.startsWith('::jsonb', this.pos)) {
this.pos += '::jsonb'.length;
return JSON.parse(value) as SeedValue;
}
if (this.peek() === ':') this.fail('cast não suportado');
return value;
}
const match = /^(null|true|false|-?\d+)(?=[,) ;])/.exec(this.rest());
if (!match?.[1]) return this.fail('literal não suportado');
this.pos += match[1].length;
if (match[1] === 'null') return null;
if (match[1] === 'true') return true;
if (match[1] === 'false') return false;
return Number(match[1]);
}
}

interface SeedData {
readonly rows: ReadonlyMap<string, readonly SeedRow[]>;
readonly updates: number;
}

function parseSeed(): SeedData {
const rows = new Map<string, SeedRow[]>();
let updates = 0;
const lines = readFileSync(SEED_PATH, 'utf8').split('\n');
lines.forEach((line, index) => {
const lineNo = index + 1;
if (line.trim() === '' || line.startsWith('--')) return;
if (line.startsWith("select set_config('app.")) return;
const insert = /^insert into inf\.(rait_\w+) \(([^)]_)\) values /.exec(
line,
);
if (insert?.[1] && insert[2] !== undefined) {
const table = insert[1];
const columns = insert[2].split(',').map((column) => column.trim());
const cursor = new Cursor(line, lineNo, insert[0].length);
const list = rows.get(table) ?? [];
for (;;) {
cursor.expect('(');
const row: SeedRow = {};
columns.forEach((column, position) => {
if (position > 0) cursor.expect(',');
row[column] = cursor.literal();
});
cursor.expect(')');
list.push(row);
cursor.skipSpaces();
if (cursor.peek() !== ',') break;
cursor.pos += 1;
}
cursor.skipSpaces();
if (!/^(on conflict ._)?;$/.test(cursor.rest()))
        cursor.fail('sufixo inesperado depois das tuplas');
      rows.set(table, list);
      return;
    }
    const update = /^update inf\.(rait_\w+) set /.exec(line);
    if (update?.[1]) {
      const table = update[1];
      const cursor = new Cursor(line, lineNo, update[0].length);
      const changes: SeedRow = {};
      for (;;) {
        cursor.skipSpaces();
        const column = /^([a-z_0-9]+) = /.exec(cursor.rest());
        if (!column?.[1]) return cursor.fail('atribuição esperada');
        cursor.pos += column[0].length;
        changes[column[1]] = cursor.literal();
        cursor.skipSpaces();
        if (cursor.peek() !== ',') break;
        cursor.pos += 1;
      }
      cursor.expect('where id =');
      const id = cursor.literal();
      cursor.expect(';');
      const target = (rows.get(table) ?? []).find((row) => row['id'] === id);
      if (!target)
        return cursor.fail(`update de id não inserido: ${String(id)}`);
      Object.assign(target, changes);
      updates += 1;
      return;
    }
    throw new Error(
      `seed 20 linha ${lineNo}: forma não suportada pelo parser: ${line.slice(0, 60)}`,
);
});
return { rows, updates };
}

const seed = parseSeed();
const fixtures = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8')) as Record<
string,
unknown

> ;

function collection(name: string): readonly Record<string, unknown>[] {
const value = fixtures[name];
if (!Array.isArray(value))
throw new Error(
`rait-fixtures.json: coleção ausente ou não-array: ${name}`,
);
return value as readonly Record<string, unknown>[];
}

function seedRows(table: string): readonly SeedRow[] {
return seed.rows.get(table) ?? [];
}

function sameValue(actual: unknown, expected: unknown): boolean {
return JSON.stringify(actual) === JSON.stringify(expected);
}

/** Divergências de um registro JSON em relação à linha da seed (vazio = paridade). */
function divergences(
table: string,
row: SeedRow,
record: Record<string, unknown>,
): string[] {
const found: string[] = [];
const id = String(row['id']);
for (const [column, value] of Object.entries(row)) {
if (column === 'tenant_id') continue;
const field = camel(column);
const alias = ALIASES[table]?.[column];
const key = `${table}/${id}/${column}`;
if (field in record) {
const actual = record[field];
if (DATE_ONLY_INHERITED.has(key)) {
if (typeof value !== 'string' || actual !== value.slice(0, 10))
found.push(
`${key}: herdado ${String(actual)} ≠ data de ${String(value)}`,
);
} else if (!sameValue(actual, value)) {
found.push(
`${key}: ${JSON.stringify(actual)} ≠ ${JSON.stringify(value)}`,
);
}
} else if (alias !== undefined && alias in record) {
if (record[alias] !== value)
found.push(
`${key}: apelido ${alias}=${String(record[alias])} ≠ ${String(value)}`,
);
} else {
found.push(`${key}: campo ${field} ausente`);
}
}
return found;
}

const TABLES = Object.keys(TABLE_TO_COLLECTION);

describe('rait-fixtures.json × seed 20-fixtures-rait.sql (FIX-0001, rait-fixtures.md §10)', () => {
it('dado a seed 20 quando o parser lê inserts e updates então as 30 tabelas têm as contagens do contrato e há 3 updates', () => {
const counts = Object.fromEntries(
[...seed.rows.entries()].map(([table, list]) => [table, list.length]),
);
expect(counts).toStrictEqual(EXPECTED_COUNTS);
expect(seed.updates).toBe(3);
expect([...TABLES].sort()).toStrictEqual(
Object.keys(EXPECTED_COUNTS).sort(),
);
});

it.each(TABLES)(
'dado a tabela %s da seed 20 quando comparada à coleção JSON então cada linha tem registro de mesmo id e cada coluna um campo de mesmo valor',
(table) => {
const list = collection(TABLE_TO_COLLECTION[table] ?? '');
const problems: string[] = [];
for (const row of seedRows(table)) {
const record = list.find((candidate) => candidate['id'] === row['id']);
if (!record) {
problems.push(`${table}/${String(row['id'])}: registro ausente`);
continue;
}
problems.push(...divergences(table, row, record));
}
expect(problems).toStrictEqual([]);
},
);

it.each(TABLES)(
'dado a coleção JSON derivada de %s quando lida então nenhum id está ausente da seed e nenhum registro traz tenant_id',
(table) => {
const ids = new Set(seedRows(table).map((row) => row['id']));
const list = collection(TABLE_TO_COLLECTION[table] ?? '');
expect(
list
.map((record) => record['id'])
.filter((id) => !ids.has(id as string)),
).toStrictEqual([]);
expect(
list.filter((record) => 'tenantId' in record || 'tenant_id' in record),
).toStrictEqual([]);
},
);

it('dado o mapa pools quando comparado à seed então cada instância aponta para o rait_pool da mesma instância', () => {
const pools = fixtures['pools'] as Readonly<Record<string, string>>;
const fromSeed = Object.fromEntries(
seedRows('rait_pool').map((row) => [row['instance'], row['id']]),
);
expect(pools).toStrictEqual(fromSeed);
});

it('dado a lista fechada de datas herdadas quando conferida então cada entrada é de fato só a data do timestamp da seed', () => {
const stale: string[] = [];
for (const key of DATE_ONLY_INHERITED) {
const [table = '', id = '', column = ''] = key.split('/');
const row = seedRows(table).find((candidate) => candidate['id'] === id);
const record = collection(TABLE_TO_COLLECTION[table] ?? '').find(
(candidate) => candidate['id'] === id,
);
const value = row?.[column];
const actual = record?.[camel(column)];
if (
typeof value !== 'string' ||
actual === value ||
actual !== value.slice(0, 10)
)
stale.push(key);
}
expect(stale).toStrictEqual([]);
});
});

````

### Diff de `rait-fixtures.json` — primeiras 400 linhas (o resto está no disco; leia o arquivo)

```diff
diff --git a/docs/framework/arch/fixtures/rait-fixtures.json b/docs/framework/arch/fixtures/rait-fixtures.json
index dc693128..4798622f 100644
--- a/docs/framework/arch/fixtures/rait-fixtures.json
+++ b/docs/framework/arch/fixtures/rait-fixtures.json
@@ -152,79 +152,143 @@
       "id": "00000000-0000-7000-8000-000021000001",
       "pool": "00000000-0000-7000-8000-000020000001",
       "userId": "00000000-0000-4000-8000-0000b0000001",
-      "memberRole": "analista"
+      "memberRole": "analista",
+      "status": "ATIVO",
+      "mandateStartsOn": null,
+      "mandateEndsOn": null
     },
     {
       "id": "00000000-0000-7000-8000-000021000002",
       "pool": "00000000-0000-7000-8000-000020000001",
       "userId": "00000000-0000-4000-8000-0000b0000002",
-      "memberRole": "analista"
+      "memberRole": "analista",
+      "status": "ATIVO",
+      "mandateStartsOn": null,
+      "mandateEndsOn": null
     },
     {
       "id": "00000000-0000-7000-8000-000021000003",
       "pool": "00000000-0000-7000-8000-000020000001",
       "userId": "00000000-0000-4000-8000-0000b0000003",
-      "memberRole": "analista"
+      "memberRole": "analista",
+      "status": "ATIVO",
+      "mandateStartsOn": null,
+      "mandateEndsOn": null
     },
     {
       "id": "00000000-0000-7000-8000-000021000004",
       "pool": "00000000-0000-7000-8000-000020000001",
       "userId": "00000000-0000-4000-8000-0000b0000004",
-      "memberRole": "coordenador"
+      "memberRole": "coordenador",
+      "status": "ATIVO",
+      "mandateStartsOn": null,
+      "mandateEndsOn": null
     },
     {
       "id": "00000000-0000-7000-8000-000021000005",
       "pool": "00000000-0000-7000-8000-000020000001",
       "userId": "00000000-0000-4000-8000-0000b0000005",
-      "memberRole": "secretaria"
+      "memberRole": "secretaria",
+      "status": "ATIVO",
+      "mandateStartsOn": null,
+      "mandateEndsOn": null
     },
     {
       "id": "00000000-0000-7000-8000-000021000008",
       "pool": "00000000-0000-7000-8000-000020000002",
       "userId": "00000000-0000-4000-8000-0000b0000008",
-      "memberRole": "relator"
+      "memberRole": "relator",
+      "status": "ATIVO",
+      "mandateStartsOn": "2025-01-01",
+      "mandateEndsOn": "2026-12-31"
     },
     {
       "id": "00000000-0000-7000-8000-000021000009",
       "pool": "00000000-0000-7000-8000-000020000002",
       "userId": "00000000-0000-4000-8000-0000b0000009",
-      "memberRole": "relator"
+      "memberRole": "relator",
+      "status": "ATIVO",
+      "mandateStartsOn": "2025-01-01",
+      "mandateEndsOn": "2026-12-31"
     },
     {
       "id": "00000000-0000-7000-8000-000021000010",
       "pool": "00000000-0000-7000-8000-000020000002",
       "userId": "00000000-0000-4000-8000-0000b0000010",
-      "memberRole": "relator"
+      "memberRole": "relator",
+      "status": "ADVERTIDO",
+      "mandateStartsOn": "2025-01-01",
+      "mandateEndsOn": "2026-12-31",
+      "lateOpinionCount": 2,
+      "isSubstitute": true
     },
     {
       "id": "00000000-0000-7000-8000-000021000011",
       "pool": "00000000-0000-7000-8000-000020000002",
       "userId": "00000000-0000-4000-8000-0000b0000011",
-      "memberRole": "presidente"
+      "memberRole": "presidente",
+      "status": "ATIVO",
+      "mandateStartsOn": "2025-01-01",
+      "mandateEndsOn": "2026-12-31"
     },
     {
       "id": "00000000-0000-7000-8000-000021000015",
       "pool": "00000000-0000-7000-8000-000020000002",
       "userId": "00000000-0000-4000-8000-0000b0000005",
-      "memberRole": "secretaria"
+      "memberRole": "secretaria",
+      "status": "ATIVO",
+      "mandateStartsOn": "2025-01-01",
+      "mandateEndsOn": "2026-12-31"
     },
     {
       "id": "00000000-0000-7000-8000-000021000018",
       "pool": "00000000-0000-7000-8000-000020000003",
       "userId": "00000000-0000-4000-8000-0000b0000018",
-      "memberRole": "presidente"
+      "memberRole": "presidente",
+      "status": "ATIVO",
+      "mandateStartsOn": "2025-01-01",
+      "mandateEndsOn": "2026-12-31"
     },
     {
       "id": "00000000-0000-7000-8000-000021000019",
       "pool": "00000000-0000-7000-8000-000020000003",
       "userId": "00000000-0000-4000-8000-0000b0000019",
-      "memberRole": "relator"
+      "memberRole": "relator",
+      "status": "ATIVO",
+      "mandateStartsOn": "2025-01-01",
+      "mandateEndsOn": "2026-12-31"
     },
     {
       "id": "00000000-0000-7000-8000-000021000020",
       "pool": "00000000-0000-7000-8000-000020000003",
       "userId": "00000000-0000-4000-8000-0000b0000020",
-      "memberRole": "relator"
+      "memberRole": "relator",
+      "status": "ATIVO",
+      "mandateStartsOn": "2025-01-01",
+      "mandateEndsOn": "2026-12-31"
+    }
+  ],
+  "raitPools": [
+    {
+      "id": "00000000-0000-7000-8000-000020000001",
+      "name": "Defesa prévia — Sub Gerência de Infração",
+      "instance": "defesa_previa",
+      "circuit": 1,
+      "strategy": "pull"
+    },
+    {
+      "id": "00000000-0000-7000-8000-000020000002",
+      "name": "JARI-AM",
+      "instance": "jari",
+      "circuit": 2,
+      "strategy": "round_robin"
+    },
+    {
+      "id": "00000000-0000-7000-8000-000020000003",
+      "name": "CETRAN-AM",
+      "instance": "cetran",
+      "circuit": 2,
+      "strategy": "round_robin"
     }
   ],
   "aits": [
@@ -316,7 +380,11 @@
       "aitId": "00000000-0000-7000-8000-0000f0000001",
       "instance": "defesa_previa",
       "state": "PROTOCOLADO",
-      "protocolledOn": "2026-09-14"
+      "protocolledOn": "2026-09-14",
+      "circuit": 1,
+      "intakeChannel": "postal",
+      "protocolledAt": "2026-09-14T09:00:00-04:00",
+      "lastMovementAt": "2026-09-14T09:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000002",
@@ -324,7 +392,11 @@
       "aitId": "00000000-0000-7000-8000-0000f0000002",
       "instance": "defesa_previa",
       "state": "TRIAGEM_ADMISSIBILIDADE",
-      "protocolledOn": "2026-09-11"
+      "protocolledOn": "2026-09-11",
+      "circuit": 1,
+      "intakeChannel": "portal",
+      "protocolledAt": "2026-09-11T09:00:00-04:00",
+      "lastMovementAt": "2026-09-11T09:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000003",
@@ -332,7 +404,15 @@
       "aitId": "00000000-0000-7000-8000-0000f0000003",
       "instance": "defesa_previa",
       "state": "NAO_CONHECIDO",
-      "protocolledOn": "2026-08-20"
+      "protocolledOn": "2026-08-20",
+      "circuit": 1,
+      "intakeChannel": "sne",
+      "protocolledAt": "2026-08-20T09:00:00-04:00",
+      "lastMovementAt": "2026-08-20T09:00:00-04:00",
+      "archived": true,
+      "nonAdmissionReason": "intempestivo",
+      "decidedAt": "2026-08-22T13:00:00-04:00",
+      "communicatedAt": "2026-08-25T10:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000004",
@@ -340,7 +420,12 @@
       "aitId": "00000000-0000-7000-8000-0000f0000004",
       "instance": "defesa_previa",
       "state": "ADMITIDO",
-      "protocolledOn": "2026-09-10"
+      "protocolledOn": "2026-09-10",
+      "circuit": 1,
+      "intakeChannel": "balcao",
+      "protocolledAt": "2026-09-10T09:00:00-04:00",
+      "lastMovementAt": "2026-09-10T09:00:00-04:00",
+      "admittedAt": "2026-09-11T10:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000005",
@@ -348,7 +433,13 @@
       "aitId": "00000000-0000-7000-8000-0000f0000005",
       "instance": "jari",
       "state": "AGUARDANDO_REMESSA_JARI",
-      "protocolledOn": "2026-09-08"
+      "protocolledOn": "2026-09-08",
+      "circuit": 2,
+      "intakeChannel": "postal",
+      "protocolledAt": "2026-09-08T09:00:00-04:00",
+      "lastMovementAt": "2026-09-08T09:00:00-04:00",
+      "admittedAt": "2026-09-09T10:00:00-04:00",
+      "suspensiveEffect": true
     },
     {
       "id": "00000000-0000-7000-8000-000010000006",
@@ -356,7 +447,12 @@
       "aitId": "00000000-0000-7000-8000-0000f0000006",
       "instance": "defesa_previa",
       "state": "DISTRIBUIDO",
-      "protocolledOn": "2026-09-09"
+      "protocolledOn": "2026-09-09",
+      "circuit": 1,
+      "intakeChannel": "portal",
+      "protocolledAt": "2026-09-09T09:00:00-04:00",
+      "lastMovementAt": "2026-09-09T09:00:00-04:00",
+      "admittedAt": "2026-09-10T09:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000007",
@@ -364,7 +460,12 @@
       "aitId": "00000000-0000-7000-8000-0000f0000007",
       "instance": "defesa_previa",
       "state": "EM_INSTRUCAO",
-      "protocolledOn": "2026-09-01"
+      "protocolledOn": "2026-09-01",
+      "circuit": 1,
+      "intakeChannel": "sne",
+      "protocolledAt": "2026-09-01T09:00:00-04:00",
+      "lastMovementAt": "2026-09-01T09:00:00-04:00",
+      "admittedAt": "2026-09-02T09:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000008",
@@ -372,7 +473,12 @@
       "aitId": "00000000-0000-7000-8000-0000f0000008",
       "instance": "defesa_previa",
       "state": "DILIGENCIA",
-      "protocolledOn": "2026-08-25"
+      "protocolledOn": "2026-08-25",
+      "circuit": 1,
+      "intakeChannel": "balcao",
+      "protocolledAt": "2026-08-25T09:00:00-04:00",
+      "lastMovementAt": "2026-08-25T09:00:00-04:00",
+      "admittedAt": "2026-08-26T09:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000009",
@@ -380,7 +486,12 @@
       "aitId": "00000000-0000-7000-8000-0000f0000009",
       "instance": "defesa_previa",
       "state": "PRONTO_P_DECISAO",
-      "protocolledOn": "2026-08-18"
+      "protocolledOn": "2026-08-18",
+      "circuit": 1,
+      "intakeChannel": "postal",
+      "protocolledAt": "2026-08-18T09:00:00-04:00",
+      "lastMovementAt": "2026-08-18T09:00:00-04:00",
+      "admittedAt": "2026-08-19T09:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000010",
@@ -388,7 +499,13 @@
       "aitId": "00000000-0000-7000-8000-0000f0000010",
       "instance": "defesa_previa",
       "state": "DECIDIDO_AUTORIDADE",
-      "protocolledOn": "2026-08-10"
+      "protocolledOn": "2026-08-10",
+      "circuit": 1,
+      "intakeChannel": "portal",
+      "protocolledAt": "2026-08-10T09:00:00-04:00",
+      "lastMovementAt": "2026-08-10T09:00:00-04:00",
+      "admittedAt": "2026-08-11T09:00:00-04:00",
+      "decidedAt": "2026-09-10T15:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000011",
@@ -396,7 +513,15 @@
       "aitId": "00000000-0000-7000-8000-0000f0000011",
       "instance": "jari",
       "state": "PAUTADO",
-      "protocolledOn": "2026-07-01"
+      "protocolledOn": "2026-07-01",
+      "circuit": 2,
+      "intakeChannel": "sne",
+      "protocolledAt": "2026-07-01T09:00:00-04:00",
+      "lastMovementAt": "2026-07-01T09:00:00-04:00",
+      "admittedAt": "2026-07-02T09:00:00-04:00",
+      "suspensiveEffect": true,
+      "remittedAt": "2026-07-06T09:00:00-04:00",
+      "judgeBodyReceivedAt": "2026-07-10T09:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000012",
@@ -404,7 +529,16 @@
       "aitId": "00000000-0000-7000-8000-0000f0000012",
       "instance": "jari",
       "state": "JULGADO_SESSAO",
-      "protocolledOn": "2026-06-01"
+      "protocolledOn": "2026-06-01",
+      "circuit": 2,
+      "intakeChannel": "balcao",
+      "protocolledAt": "2026-06-01T09:00:00-04:00",
+      "lastMovementAt": "2026-06-01T09:00:00-04:00",
+      "admittedAt": "2026-06-02T09:00:00-04:00",
+      "suspensiveEffect": true,
+      "remittedAt": "2026-06-05T09:00:00-04:00",
+      "judgeBodyReceivedAt": "2026-06-09T09:00:00-04:00",
+      "decidedAt": "2026-09-03T11:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000013",
@@ -412,7 +546,17 @@
       "aitId": "00000000-0000-7000-8000-0000f0000013",
       "instance": "jari",
       "state": "COMUNICADO",
-      "protocolledOn": "2026-05-04"
+      "protocolledOn": "2026-05-04",
+      "circuit": 2,
+      "intakeChannel": "postal",
+      "protocolledAt": "2026-05-04T09:00:00-04:00",
+      "lastMovementAt": "2026-05-04T09:00:00-04:00",
+      "admittedAt": "2026-05-05T09:00:00-04:00",
+      "suspensiveEffect": true,
+      "remittedAt": "2026-05-08T09:00:00-04:00",
+      "judgeBodyReceivedAt": "2026-05-12T09:00:00-04:00",
+      "decidedAt": "2026-08-27T11:00:00-04:00",
+      "communicatedAt": "2026-09-01T10:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000014",
@@ -420,7 +564,15 @@
       "aitId": "00000000-0000-7000-8000-0000f0000014",
       "instance": "defesa_previa",
       "state": "TRANSITADO",
-      "protocolledOn": "2026-04-06"
+      "protocolledOn": "2026-04-06",
+      "circuit": 1,
+      "intakeChannel": "portal",
+      "protocolledAt": "2026-04-06T09:00:00-04:00",
+      "lastMovementAt": "2026-04-06T09:00:00-04:00",
+      "admittedAt": "2026-04-07T09:00:00-04:00",
+      "decidedAt": "2026-05-20T15:00:00-04:00",
+      "communicatedAt": "2026-05-25T10:00:00-04:00",
+      "closedAt": "2026-06-25T00:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000015",
@@ -428,7 +580,17 @@
       "aitId": "00000000-0000-7000-8000-0000f0000015",
       "instance": "jari",
       "state": "REMETIDO_2A_INSTANCIA",
-      "protocolledOn": "2026-03-02"
+      "protocolledOn": "2026-03-02",
+      "circuit": 2,
+      "intakeChannel": "sne",
+      "protocolledAt": "2026-03-02T09:00:00-04:00",
+      "lastMovementAt": "2026-03-02T09:00:00-04:00",
+      "admittedAt": "2026-03-03T09:00:00-04:00",
+      "suspensiveEffect": true,
+      "remittedAt": "2026-03-06T09:00:00-04:00",
+      "judgeBodyReceivedAt": "2026-03-10T09:00:00-04:00",
+      "decidedAt": "2026-07-30T11:00:00-04:00",
+      "communicatedAt": "2026-08-03T10:00:00-04:00"
     },
     {
       "id": "00000000-0000-7000-8000-000010000016",
@@ -436,7 +598,13 @@
       "aitId": "00000000-0000-7000-8000-0000f0000016",
       "instance": "defesa_previa",
       "state": "ENCERRADO_DESISTENCIA",
-      "protocolledOn": "2026-08-03"
+      "protocolledOn": "2026-08-03",
````

### Relatório do worker (resumo; gates reexecutados pelo maestro: test 4498 passed/0 failed, typecheck, prettier, docs:kb:check verdes)

- 15 coleções novas (raitPools, parties, documents, admissibility, assignments, caseEvents,
  deadlines, inquiries, decisions, communications, impediments, clockAlerts, attendance, votes,
  minutes) e campos novos em 15 coleções existentes; 34 → 49 chaves; 0 divergências nas chaves
  pré-existentes (comparação programática contra a versão anterior).
- Colunas obrigatórias dos tipos TS sem coluna na seed (created_at, version, …) ficaram fora
  (tabela em §10). 13 divergências herdadas data × timestamp mantidas e listadas no spec.
- Exceções do parser: `rait_pool` com 3 tuplas num `insert`; `::jsonb` transcrito como JSON; 3
  `update` aplicados por cima; `on conflict` ignorado.
