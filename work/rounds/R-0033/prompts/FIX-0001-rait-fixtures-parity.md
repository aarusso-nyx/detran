# Prompt de worker — `FIX-0001` (`inspector-tests`) — paridade `rait-fixtures.json` × seed (OD-C3-008 a)

> Você é um worker da orquestra `frontend-preview` (rodada `R-0033`), mas esta tarefa é um **PR
> próprio contra `main`**, decidido pelo Owner em 2026-10-15 (OD-C3-008 (a),
> `work/rounds/R-0033/AUTHORIZATION.md` Adenda B2). Você trabalha **exclusivamente** na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/rait-fixtures-json-parity` (branch
> `fix/rait-fixtures-json-parity`, cortado de `origin/main` `51ec27f0`). O caminho contém espaço:
> cite-o sempre. Você executa **uma** tarefa, dentro de uma fronteira de escrita, e entrega um
> relatório. Você **nunca** executa `git`, nunca instala pacotes, nunca edita arquivos gerados,
> nunca altera testes existentes. Se algo impedir a tarefa, pare e escreva o bloqueio no relatório.

## Papel

Papel constitucional (Art. 6): **Inspector**. Declare-o na primeira linha da sua resposta.
Manual do perfil: `docs/meta/agents/inspector-tests.md` — leia-o primeiro. Esta é uma **mudança de
contrato de teste** (`docs/framework/arch/rait-fixtures.md`: "alterar uma fixture é mudança de
contrato de teste (PR próprio)"); por isso o Inspector a autora.

## Contexto

`docs/framework/arch/rait-fixtures.md` diz que a fixture canônica do RAIT vive em três formas
**sincronizadas**: SQL (`backend/database/seed/*.sql`), JSON (`docs/framework/arch/fixtures/rait-fixtures.json`)
e calendário. Na prática a JSON ficou para trás da seed `backend/database/seed/20-fixtures-rait.sql`:
não traz as coleções **partes, documentos, admissibilidade, atribuições, eventos de caso, prazos,
decisões, comunicações, diligências, impedimentos, alertas de relógio, presenças, votos, ata**,
e os registros existentes (`cases`, `raitDrafts`, `sessions`, `agendaItems`, `clocks`,
`poolMembers`, `pools`…) trazem só um subconjunto das colunas da seed (ex.: `cases` sem
`circuit`, `intake_channel`, `protocolled_at`, `last_movement_at`, `admitted_at`,
`suspensive_effect`, `archived`, `non_admission_reason`, `decided_at`, `communicated_at`,
`remitted_at`, `judge_body_received_at`, `closed_at`…). A prévia de frontend da R-0033 lê a JSON
(`docs/framework/arch/frontend-preview-mode.md` D-06/D-07) e hoje 26 telas ficariam parciais e 5
vazias. Decisão do Owner (texto literal): "(a) open a separate fixture PR transcribing the
missing collections and fields from seed 20-fixtures-rait.sql into rait-fixtures.json with the
same ids, before TASK-0003."

## Leitura obrigatória (lista fechada — não leia além dela)

1. `AGENTS.md`; `docs/meta/agents/inspector-tests.md`; `CODESTYLE.md` §Tests e §Docs.
2. `docs/framework/arch/rait-fixtures.md` (inteiro) e `docs/framework/arch/fixtures/rait-fixtures.json`
   (inteiro — forma atual: chaves de nível 1, nomes camelCase, ids).
3. `backend/database/seed/20-fixtures-rait.sql` (inteiro — a fonte única desta transcrição);
   `backend/database/seed/00-fixtures-core.sql` só para os ids de usuários citados.
4. `work/rounds/R-0033/inventory-rait-web.md` §2 e §4 (o que falta e o que os modelos exigem) —
   está na worktree **da rodada** `/Volumes/Thiamat II/stech/detran/.claude/worktrees/frontend-preview-5281e3`
   (leia-o por esse caminho; não o copie).
5. `apps/rait/web/src/app/data/models/*.ts` (tipos `RaitCase`, `RaitParty`, `RaitDocument`,
   `RaitAdmissibility`, `RaitAssignment`, `RaitCaseEvent`, `RaitDeadline`, `RaitDecision`,
   `RaitCommunication`, `RaitInquiry`, `RaitImpediment`, `RaitClockAlert`, `RaitAttendance`,
   `RaitVote`, `RaitMinutes`, `RaitDraft`, `RaitSession`, `RaitAgendaItem`…) — só para saber
   **quais** campos são obrigatórios; os **valores** vêm da seed.
6. Consumidores atuais da JSON (para mantê-los verdes, nunca editá-los):
   `apps/rait/web/src/testing/{http-fixtures,kb,clock}.stub.ts` e `http-fixtures.ts`,
   `apps/rait/web/src/app/core/rait-shell.component.spec.ts`,
   `apps/rait/web/src/app/shared/clocks-panel.component.spec.ts`,
   `apps/rait/web/src/app/data/api/case.client.spec.ts`,
   `apps/rait/web/src/app/forms/{sessao-ao-vivo,lote-sorteio,reatribuicao,escala}.schema.spec.ts`.

## Pode tocar

- `docs/framework/arch/fixtures/rait-fixtures.json` — **só adições**: coleções novas e campos
  novos nos registros existentes. Nenhuma chave, id ou valor existente muda de nome ou de valor.
- `docs/framework/arch/rait-fixtures.md` — seção nova "## 10. Forma JSON: paridade com a seed
  (2026-10-15)" documentando a convenção de nomes, as coleções e os campos acrescentados, a
  origem (linha/tabela da seed) e as lacunas que ficaram `source_pending`; e, no §7, uma frase
  de que a JSON passa a trazer as coleções da seed 20.
- `apps/rait/web/src/testing/fixtures-parity.spec.ts` — **spec novo** (Inspector) que prova a
  paridade: para cada `insert into inf.rait_<tabela>` da seed 20, a coleção JSON
  correspondente contém um registro com o mesmo `id` e, para cada coluna da seed, um campo com
  o mesmo valor (normalizado: camelCase ← snake_case; datas como na seed; `null` ← `null`); e,
  no sentido inverso, nenhum id de coleção JSON derivada da seed 20 está ausente da seed. O spec
  lê a seed com `readFileSync` e um parser mínimo das linhas `insert into … (cols) values (…)`
  (as linhas são de uma tupla por `insert`, aspas simples, `null` literal, sem subselect — verifique
  e registre qualquer exceção). Coloque-o em `src/testing/` para que `vitest` o apanhe
  (`include: src/**/*.spec.ts`).

## Não pode tocar

Tudo o mais: `backend/**` (a seed é fonte, nunca editada), `apps/rait/web/src/app/**`,
`apps/rait/web/src/testing/*` existentes, `packages/**`, `work/**`, outros `docs/**`,
`package.json`, `pnpm-lock.yaml`, `.github/**`, `.devai/**`, `record/**`, `law/**`.

## Tarefa (o quê, não o como)

1. **Transcrever** da seed 20 para a JSON, com os **mesmos ids** e os **mesmos valores**, nesta
   convenção: nomes de coleção camelCase no plural (`parties`, `documents`, `admissibility`,
   `assignments`, `caseEvents`, `deadlines`, `decisions`, `communications`, `inquiries`,
   `impediments`, `clockAlerts`, `attendance`, `votes`, `minutes`); nomes de campo camelCase
   (`case_id` → `caseId`, `protocolled_at` → `protocolledAt`, `person_name` → `personName` …);
   `tenant_id` **omitido** (a JSON já tem `tenant` no topo); datas e timestamps exatamente como
   na seed (`'2026-08-10T09:00:00-04:00'` → `"2026-08-10T09:00:00-04:00"`); `null` → `null`;
   booleanos → `true/false`; inteiros → números. Nos registros **existentes** (`cases`,
   `raitDrafts`, `sessions`, `agendaItems`, `clocks`, `poolMembers`, `pools` (mapa), `raitBatches`,
   `raitBatchItems`, `raitBenches`, `raitUnits`, `raitSchedules`, `raitScheduleSlots`,
   `raitSubstituteDuties`, `raitPendingContents`, `raitRedirects`) acrescente os campos que a seed
   tem e a JSON não — **sem** renomear os existentes (`protocol` continua `protocol`,
   `protocolledOn` continua `protocolledOn`; acrescente `protocolNumber`/`protocolledAt` ao lado
   só se a seed os tiver com outro valor/forma — e documente). Onde a seed **não** tem a tabela
   ou a coluna (ex.: `rait_clock_alert` tem 5 linhas; `rait_inquiry` 1; `rait_impediment` 1;
   `rait_minutes` 1), a JSON reflete só isso: nada é completado por analogia; campo obrigatório
   do modelo TS sem coluna na seed **não** entra na JSON (o consumidor marca `source_pending`).
2. **Documentar** em `rait-fixtures.md` §10 (tabela coleção JSON → tabela da seed → nº de
   registros → campos → observações/`source_pending`).
3. **Provar** com `fixtures-parity.spec.ts` (item do §Pode tocar) — verde na entrega.
4. **Manter verde** a suíte do app: `pnpm --filter @detran/rait-web test` (os 155+ specs
   existentes continuam passando sem edição; se algum quebrar por causa da adição — ex.: contagem
   de chaves —, **não** o edite: registre no relatório como bloqueio com o nome do `it` e a causa).
5. Prettier nos arquivos tocados; `pnpm docs:kb:check` (o `.md` muda).

## Definições que valem como contrato

- `rait-fixtures.md` intro: "Regras: ids fixos e legíveis (`00000000-0000-7000-8000-<prefixo><nnnn>`);
  um registro por estado/persona; nada de dados reais; testes que precisam de variação derivam
  da fixture com `override` nomeado. Alterar uma fixture é mudança de contrato de teste (PR
  próprio)."
- Tenant `00000000-0000-7000-8000-00000000a001`; `today` `2026-09-14`; fuso `America/Manaus`.
- Seed 20 (contagens por tabela, para o seu spec conferir): rait_pool 1 (`insert` único com 3
  tuplas — exceção ao "uma tupla por insert"), rait_pool_member 13, rait_case 20, rait_party 20,
  rait_document 20, rait_admissibility 28, rait_assignment 10, rait_case_event 5, rait_clock 6,
  rait_clock_alert 5, rait_communication 3, rait_deadline 7, rait_decision 5, rait_draft 4,
  rait_impediment 1, rait_inquiry 1, rait_minutes 1, rait_pending_content 3, rait_redirect 2,
  rait_schedule 3, rait_schedule_slot 5, rait_session 4, rait_agenda_item 3, rait_attendance 7,
  rait_vote 4, rait_batch 3, rait_batch_item 4, rait_bench 4, rait_substitute_duty 2, rait_unit 3.

## Critérios de aceitação (todos precisam passar; execute-os na worktree da fixture)

- `node -e "JSON.parse(require('fs').readFileSync('docs/framework/arch/fixtures/rait-fixtures.json','utf8'))"` → sem erro.
- `pnpm --filter @detran/rait-web test` → 0 `failed` (inclui o novo `fixtures-parity.spec.ts`).
- `pnpm --filter @detran/rait-web typecheck` → sem erros.
- `pnpm docs:kb:check` → OK.
- `pnpm exec prettier --check docs/framework/arch/fixtures/rait-fixtures.json docs/framework/arch/rait-fixtures.md apps/rait/web/src/testing/fixtures-parity.spec.ts` → "All matched files use Prettier code style!".
- Só os 3 arquivos acima alterados (o maestro confere com `git status` na worktree da fixture).

## Regras que não admitem exceção

1. Nenhum valor inventado: tudo vem de `20-fixtures-rait.sql`; sem coluna → sem campo.
2. Nenhum dado real; nenhum id novo; nenhum `tenant_id`.
3. Nenhum teste existente editado; nenhum `skip`/`todo`.
4. Nenhum `git`, nenhuma instalação, nenhum processo em segundo plano.

## Entrega (relatório em Markdown, este formato, nada além dele)

```markdown
Papel: <Art. 6>
Tarefa: FIX-0001
Arquivos criados/alterados: <lista com caminho>
Coleções/campos acrescentados: <tabela resumida: coleção → nº registros → campos>
Comandos executados e saída resumida: <um por linha, com o resultado>
Critérios de aceitação: <cada um com PASS/FAIL>
Lacunas (`source_pending`) e exceções do parser: <lista>
Fora do escopo / deixado: <o quê e por quê>
Bloqueios: <ou "nenhum">
```
