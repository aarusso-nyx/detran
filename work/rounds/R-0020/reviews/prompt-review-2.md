# Prompt do reviewer — prompt-review-2 (R-0020 devai-sensors)

Você é Claude Code Opus 5.5, reviewer da outra família, papel Auditor. Trabalhe somente em leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. **Segundo e último ciclo:** avalie somente as correções dos achados de `prompt-review-1.json`. Não reabra texto não modificado; um novo achado só é admissível se for FAIL por Constituição, ADR, decisão Owner ou fronteira e disser por que não foi levantado no ciclo 1. Responda JSON puro, sem cerca Markdown ou prosa.

## Correções a verificar

- ADR-0022 Accepted pela OD-R18-002: plano A2, OD-R20-006 estreitada e registro canônico atualizado, sem mudar critérios.
- TASK-0019/0020 Inspector acrescentadas antes da implementação de CI e hooks; dependências e hashes recompostos para 20 tarefas.
- Listas fechadas de leitura e definição de fonte para TASK-0004…0010, 0014, 0016 e 0018; TASK-0018 atualiza waves.md (Maestro + Histórico).
- TASK-0003 trabalha com `--out-dir` temporário e script verifica ausência de escrita em `.devai/`; o maestro materializa baseline. TASK-0006/0009 entregam gate inicialmente RED, o maestro registra/normaliza e só então exige PASS.
- TASK-0014 prepara tabela de recibos para o Owner sem autorizá-los; prévia sem `--since-ref` apontou 43 achados em `c848723c`, contra 11 na medição histórica — diferença fica para caracterização/triagem, sem recibo novo presumido.
- Checkpoints de aceite ADR v2, recibos Owner, bind 1.0.1 por maestro, doctor e seal final incorporados.
- Achado low sobre `db_isolation: none`: `law/schemas/task.schema.json` 2.0.0 só aceita `database` ou `cluster`. `none` é inválido; os 20 JSONs passaram no DEVAI, então mantivemos `database` como menor isolamento disponível. Trate como nota, não como correção de schema.

## Veredito

PASS se todos os high anteriores estão corrigidos. REVIEW se ainda há high corrigível no mesmo texto; FAIL apenas por contradição canônica ou fronteira. A rubrica e os 20 achados originais seguem anexados. Cite arquivo e linha.

## Saída JSON pura

{"mode":"prompt-review","round":"R-0020","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"work/rounds/R-0020/prompts/TASK-0001.md","line":1,"claim":"...","fix":"..."}],"notes":[]}

## Material anexado

### work/rounds/R-0020/reviews/prompt-review-1.json

```json
{
  "mode": "prompt-review",
  "round": "R-0020",
  "verdict": "REVIEW",
  "findings": [
    {
      "severity": "high",
      "item": 5,
      "file": "work/rounds/R-0020/plan.md",
      "line": 261,
      "claim": "The plan still treats ADR-0022 as open. OD-R20-006 offers 'accept, supersede or reject', Meta 7 (line 117) says the round 'defines the fate of ADR-0022 (accept, amend or reject)', and the baseline table (line 59) calls it _Proposed_. But docs/meta/adr/ADR-0022-orchestra-execution-model.md:5 says 'Accepted on 2026-09-27 by Owner decision (OD-R18-002, round R-0018)'. Prompts TASK-0016/0017/0018 (line 48/47/49) say 'ADR-0022 já foi aceita em R-0018'. So the plan contradicts both an Owner decision and its own prompts, and the 'aceitar' option in OD-R20-006 is moot.",
      "fix": "Add a numbered plan addendum that records ADR-0022 as Accepted (OD-R18-002). Narrow OD-R20-006 to 'keep ADR-0022, or amend it by supersession through LAW-ADR-0003'. Mark line 59 as a historical measurement taken at a92ef731. Update the OD-R20-006 wording in the registry. Do not reopen the acceptance."
    },
    {
      "severity": "high",
      "item": 6,
      "file": "work/rounds/R-0020/plan.md",
      "line": 145,
      "claim": "CTG-0005 (TASK-0014→0015) and CTG-0006 (TASK-0016→0017→0018) have no Inspector task. That breaks the Architect→Inspector→Engineer triad and orchestra/README §4.1 and §4.14 ('verifiers → negative case', 'tests only from the Inspector'). TASK-0017 delivers runtime code (tools/devai/authority-hook.mjs, prompt line 28) that refuses writes by path, and TASK-0015 changes CI gates, both with no test written first. R-0010 had its prompt-review rejected for this same reason.",
      "fix": "Add an Inspector task to CTG-0006 between TASK-0016 and TASK-0017: tools/devai/tests/authority-hook.test.mjs, covering allowed and refused paths per role for record/, .devai/, law/ and product/, plus the maestro case. Add an Inspector task to CTG-0005 before TASK-0015, for example a structural test of ci.yml (required steps present, none with continue-on-error) and of the PR template (Inv-Compliance: and Art. 7). Update the JSONs, upstream_task_id and compositions."
    },
    {
      "severity": "high",
      "item": 2,
      "file": "work/rounds/R-0020/prompts/TASK-0018.md",
      "line": 13,
      "claim": "The closed reading list leaves out every file the task must edit: maestro-prompt.template.md, orchestra/README.md, waves.md, backlog.md and .gitignore (lines 26–30). Rule 1 forbids reading outside the list, so the worker must either break the rule or edit blind. The prompt also never asks for the family-swap entry in waves.md (Maestro column and §Histórico), which AUTHORIZATION.md:18 assigns to 'the documentation task'.",
      "fix": "Add all five editable files to the reading list, plus .devai/pin/constitution.md for the Art. 41 fix in .gitignore. Put the waves.md entry required by AUTHORIZATION.md:15-18 in the Tarefa section."
    },
    {
      "severity": "high",
      "item": 2,
      "file": "work/rounds/R-0020/prompts/TASK-0009.md",
      "line": 13,
      "claim": "The task edits docs/meta/agents/orchestra/task.template.json (line 31), but that file is not in the reading list. The list also lacks any sample of the 143 invalid historical tasks, which have 74 non-INV target_invariants, 50 db_isolation errors and 31 coupled_task_group errors. The deterministic normalizer can't be designed without seeing those shapes, so the worker is pushed into a free search.",
      "fix": "Add task.template.json to the reading list. Add either the invalid-task sample listed in CTG-0003.md (the field-by-field normalization table from TASK-0007) or 2–3 representative historical TASK files per error class."
    },
    {
      "severity": "high",
      "item": 2,
      "file": "work/rounds/R-0020/prompts/TASK-0010.md",
      "line": 13,
      "claim": "Sixteen record.md files need the fields record-meta, declared_by, closed_by, phase_closure, merged_as, gates, plan_path and orchestrator_prompt. The reading list has none of their sources: record/proofs/compliance/closures/PC-*.json, work/rounds/R-nnnn/{closure.json,plan.md,prompts/00-maestro.md}. A Luna/low worker would have to search the repository or invent values.",
      "fix": "Have CTG-0003.md (TASK-0007) carry the complete round→PC→merged_as→gates→plan→prompt map as a table, and state in the prompt that this table is the only source. Otherwise, list the per-round closures and closure.json files explicitly."
    },
    {
      "severity": "high",
      "item": 2,
      "file": "work/rounds/R-0020/prompts/TASK-0007.md",
      "line": 13,
      "claim": "The plan (line 137) asks for the round→PC→merged_as→gates→plan/prompt map and a seal rehearsal across 17 rounds. The reading list has no closure PC-*.json, no per-round closure.json and no release-host.js (the seal requirements). The rehearsal also needs `devai round seal` (--write) in a scratch clone, which the prompt's 'Não pode tocar' forbids for workers.",
      "fix": "Add record/proofs/compliance/closures/PC-0001…0016.json and work/rounds/R-00{03…19}/closure.json to the reading list, or a manifest the maestro generates. Move the seal rehearsal into a maestro checkpoint with a report, or allow it explicitly and only in a scratch clone outside the worktree."
    },
    {
      "severity": "high",
      "item": 3,
      "file": "work/rounds/R-0020/prompts/TASK-0003.md",
      "line": 53,
      "claim": "The criterion `pnpm devai:baseline → baseline.json/md gerados` makes the worker write work/rounds/R-0020/baseline.{json,md}. Those files are outside 'Pode tocar' (lines 27–28), and line 47 says the maestro materializes them. The Entrega at line 52 also lists baseline.json/md as the worker's deliverable. The prompt contradicts itself, and running the script would violate the write boundary. On top of that, `audit scorecard` in the plan's baseline wrote observations to .devai/state/audit-observations/ (plan line 58), so a 'read-only' script that calls it may write to .devai/ without anyone noticing.",
      "fix": "Give the script a --out (or stdout) mode. The worker's criterion becomes 'pnpm devai:baseline --out <tmp> runs and passes the tests', and baseline.* is materialized by the maestro. Require the script to run `git status --porcelain` before and after, and to fail if anything under .devai/ changed. The CTG-0001 contract must name each DEVAI command the script may call and confirm that it has no write effect."
    },
    {
      "severity": "high",
      "item": 4,
      "file": "work/rounds/R-0020/prompts/TASK-0006.md",
      "line": 52,
      "claim": "TASK-0006 puts verify:proof-anchors into `pnpm check`, and line 54 requires '0 undeclared orphan lines'. Yet the correction entries that declare the 49 orphans are recorded by the maestro only afterwards. When the worker runs it, `pnpm check` fails by construction, so the acceptance criterion can't be met. The same happens in TASK-0009 (line 57): `verify:round-tasks → 0 invalid` before the maestro applies the normalization.",
      "fix": "Define the order in the prompt: (1) the worker delivers the gate and runs it with the RED count expected by the contract; (2) the maestro records the corrections, or applies the normalization; (3) the maestro runs `pnpm check`/`verify:*` as the green criterion for the CTG. Or state explicitly that `pnpm check` green is a maestro criterion after step 2. Never weaken the gate."
    },
    {
      "severity": "high",
      "item": 9,
      "file": "work/rounds/R-0020/prompts/TASK-0014.md",
      "line": 26,
      "claim": "The plan (line 144) makes the 'proposal for forbidden-action-authorizations.json (11 receipts) for the Owner' part of TASK-0014. The prompt neither asks for it nor gives sources to write it: no forbidden-actions output with the 11 SHAs and rules, and no adr-validation-policy.schema.json for the law/policy/adr-validation.json that it must create. The deliverable disappears from the prompt, and the policy would have to be written without its schema.",
      "fix": "In Tarefa, require the 11 receipts to be drafted in a section of CTG-0005.md (commit, rule, justification; authorized_by left for the Owner). Add to the reading list: node_modules/.../schemas/adr-validation-policy.schema.json, forbidden-actions.json, law/adr/ADR-0001-*.md as the format model, and the output of `devai check --only forbidden-actions` saved by the maestro under reports/."
    },
    {
      "severity": "high",
      "item": 2,
      "file": "work/rounds/R-0020/prompts/TASK-0016.md",
      "line": 13,
      "claim": "The per-path authority contract and the Constitution 1.0.1 ADR must be written without .devai/pin/constitution.md (Art. 6/7/18/41), .devai/config/authority-policy.json, .claude/agents/* or law/policy/mutation-strength.json. The plan (line 42) makes the destination of mutation-strength.json and the CLAUDE.md update part of OD-R20-005. Without these sources the worker would have to search or invent.",
      "fix": "Add .devai/pin/constitution.md, .devai/config/authority-policy.json, law/policy/mutation-strength.json, CLAUDE.md, law/adr/README.md and DESIGN-DECISIONS.md §law/adr to the reading list."
    },
    {
      "severity": "low",
      "item": 12,
      "file": "work/rounds/R-0020/plan.md",
      "line": 165,
      "claim": "No checkpoint or task schedules the Owner's acceptance of ADR v2, meaning the Accepted status commit authored by DEVAI Owner or Architect under an Owner decision, before TASK-0015. Nothing schedules `init bind --constitution` 1.0.1 in a segregated Owner commit either. In TASK-0015.json, upstream_task_id only covers TASK-0014, although the plan (line 145) also requires 'recibos do Owner'.",
      "fix": "Add named checkpoints (e) ADR v2 accepted by the Owner and receipts applied, before TASK-0015 is dispatched, and (f) bind of Constitution 1.0.1 by the maestro after a scratch-clone rehearsal. Record both as blocks for TASK-0015 and TASK-0017."
    },
    {
      "severity": "low",
      "item": 3,
      "file": "work/rounds/R-0020/prompts/TASK-0015.md",
      "line": 53,
      "claim": "Line 53 lists 'recibos aprovados' as the worker's deliverable, but law/policy/forbidden-action-authorizations.json is not in 'Pode tocar', and line 39 says the maestro applies it. The TASK-0015.json lock (MOD-forbidden-receipts) doesn't match the prompt's boundary.",
      "fix": "Remove 'recibos aprovados' from the Entrega/criterion. Keep MOD-forbidden-receipts only as a maestro lock, or move it out of the worker JSON."
    },
    {
      "severity": "low",
      "item": 8,
      "file": "work/rounds/R-0020/prompts/TASK-0008.md",
      "line": 54,
      "claim": "The criterion only runs normalize-tasks.test.mjs. verify-round-tasks.test.mjs, which is also delivered, has no execution criterion.",
      "fix": "Use `node --test tools/devai/tests/normalize-tasks.test.mjs tools/devai/tests/verify-round-tasks.test.mjs`."
    },
    {
      "severity": "low",
      "item": 2,
      "file": "work/rounds/R-0020/prompts/TASK-0004.md",
      "line": 13,
      "claim": "Defining the per-round correction payload requires the orphan jsonl lines (sequence and sha256) and merge 9ac6dd55. The reading list has chain.json but none of the record/proofs/work/generic/*.jsonl files for R-0005/R-0007/R-0013, nor the baseline.json from CTG-0001 that measured them. TASK-0006 has the same gap: it needs the jsonl format to cross-check jsonl × chain.",
      "fix": "Add work/rounds/R-0020/baseline.json (the orphan-anchors axis) and the three affected jsonl files to the reading lists of TASK-0004/0005/0006."
    },
    {
      "severity": "low",
      "item": 9,
      "file": "work/rounds/R-0020/prompts/TASK-0017.md",
      "line": 49,
      "claim": "The plan (line 147) requires 'doctor verde' and an Engineer pre-push hook, but the prompt only has `pnpm check`. `pnpm exec devai doctor … → all [✓] in host-integrated` is a round criterion (plan line 176) and has no place among the per-task or maestro criteria of CTG-0006.",
      "fix": "State explicitly that `devai doctor` all [✓] is the maestro's CTG-0006 criterion after bind/apply, and list it among the checkpoints."
    },
    {
      "severity": "low",
      "item": 9,
      "file": "work/rounds/R-0020/plan.md",
      "line": 170,
      "claim": "Criterion: `round status` closed 'for R-0020 at the end'. No task produces work/rounds/R-0020/record.md or R-0020's closure, both of which `round seal` requires (plan line 67).",
      "fix": "Assign record.md for R-0020 to TASK-0018 (or a maestro closing step) and add the R-0020 seal to the closing checkpoints."
    },
    {
      "severity": "low",
      "item": 3,
      "file": "work/rounds/R-0020/plan.md",
      "line": 83,
      "claim": "Meta 2 (CTG-0002) puts verify:proof-anchors 'no CI' and considers 'cadeia legada verificada no CI'. Any change to ci.yml before the ADR v2 accepted in CTG-0005 triggers FORBID-CI-WITHOUT-ADR. TASK-0006 correctly leaves ci.yml out, but the plan doesn't say that the CI part moves to CTG-0005.",
      "fix": "Add a note: in CTG-0002 the gate enters only through `pnpm check`. The explicit ci.yml step and any legacy-chain check go in CTG-0005, after ADR v2 is accepted."
    },
    {
      "severity": "low",
      "item": 10,
      "file": "work/rounds/R-0020/prompts/TASK-0010.md",
      "line": 1,
      "claim": "TASK-0010 uses Luna/low for 16 record.md files with fields that go through the seal gate, including merged_as and gates. By volume and sensitivity it is not a 'small' task on the ladder. A transcription error would only show up at `round seal` time.",
      "fix": "Keep Luna only if CTG-0003.md provides the complete map (see the TASK-0010 finding). Otherwise raise it to Terra/medium."
    },
    {
      "severity": "low",
      "item": 11,
      "file": "work/rounds/R-0020/tasks/TASK-0001.json",
      "line": 17,
      "claim": "All 18 tasks declare db_isolation 'database', but none uses a database (contracts, docs, node scripts). The schema accepts it, but the value is semantically wrong. The normalization in TASK-0009 itself fixes db_isolation on historical tasks.",
      "fix": "Use the schema's 'none' value (or its equivalent) for tasks that don't touch a database."
    }
  ],
  "notes": [
    "Item 11: `devai check --only schema --schema law/schemas/task.schema.json --instance` returned ok=true for all 18 task JSONs. The shasum-256 of the 18 prompts matches compositions.json exactly. pc_id = PC-<16 hex prefix>, and prompt_composition_id/executor.prompt_composition_id/model/effort match in every JSON. The upstream_task_id chain is serial from 0001 to 0018.",
    "Item 10: the ids gpt-6-sol/gpt-5.6-terra/gpt-6-luna/claude-opus-5-5 match model-ladder.md:23-26 and AUTHORIZATION.md.",
    "Item 5: OD-R20-003=(A) and OD-R20-005=accepted are not reopened. OD-R20-001/002/004 and A1 remain conditions before their effects in the prompts. The exception is OD-R20-006 (first finding).",
    "law/adr/ADR-0002…0004 don't collide with docs/meta/adr: law/adr/README.md defines a separate LAW-ADR- series (OD-R18-001). Adding them to the DESIGN-DECISIONS.md and docs/meta/adr/README.md indexes isn't in any 'Pode tocar', so a maestro or transcription step should cover it.",
    "Every file in the reading lists exists, except those created by earlier tasks (contracts/, reports/, tools/devai/) and .claude/settings.json, which doesn't exist yet and is created by TASK-0017.",
    "The reviews/ folder has empty temporary files (prompt-review-1.json.formatted.*, .raw.*) that the maestro should remove before committing."
  ]
}
```

### work/rounds/R-0020/AUTHORIZATION.md

```markdown
# Autorização do Owner — R-0020 `devai-sensors`

**Data:** 2026-09-27. **Papel decisor:** Owner.

O Owner autoriza a abertura de R-0020 com este prompt e decide a seguinte **troca de famílias**,
que prevalece sobre o que diz o prompt da rodada:

- **Maestro e workers:** família **Codex**. Você é o maestro com **Sol 6**. Os workers são
  subagentes Codex pela escada de `docs/meta/agents/orchestra/model-ladder.md`: Sol 6 para Architect
  e tarefas grandes, e os modelos Codex médio e pequeno vigentes para Inspector, Engineer e
  transcrição. Confirme os ids com `codex --help`.
- **Reviewer:** sempre da outra família, **Claude Code com Opus 5.5**, em nível grande, pela ponte
  `tools/orchestra/bridge.sh claude <id-opus-5.5> …`. Confirme o id com `claude --help`. Nunca
  inverta.
- No bootstrap, registre a troca em três lugares:
  - `work/rounds/R-0020/AUTHORIZATION.md`, com o texto desta seção;
  - `plan.md` §Decisões do maestro, como M1, junto com os ids confirmados;
  - `docs/meta/agents/orchestra/waves.md` (coluna Maestro e §Histórico), na tarefa de documentação.

O restante de `prompts/00-maestro.md` vale sem alteração, exceto o caminho físico da worktree
adaptado ao host nesta sessão: o repositório raiz está em `/Users/aarusso/Development/detran`,
conforme correção do Owner. O branch continua `orchestra/devai-sensors`.

Decisões preexistentes preservadas: OD-R20-003 = (A), autoria por caminho; OD-R20-005 = aceitar
a Constituição 1.0.1 por `devai init bind --constitution` em commit segregado de autoria Owner;
decisões da campanha C-0002 §7, §9 e §10.
```

### work/rounds/R-0020/plan.md

```markdown
# R-0020 — frente `devai-sensors` (ação 5 da C-0002: sensores DEVAI com o máximo de PASS)

**Status:** **ativa — autorizada pelo Owner em 2026-09-27.** Planejada em 2026-09-26
pelo Architect a partir de `work/campaigns/C-0002-consolidacao.md` (§2 fase B, §3.2, §4, §5) e da
inspeção somente leitura de 2026-09-25 (relatório (e), `work/campaigns/C-0002-inspecao-2026-09-25/e-devai.md`, versionado com
a campanha; os fatos usados estão transcritos abaixo). Maestro **Sol 6** (Codex); reviewer **Opus 5.5**
(Claude Code) pela ponte `tools/orchestra/bridge.sh claude`. Worktree deste host:
`/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`.

## Concorrência

Fase B. **Abre após o merge de R-0018** (`index-state`: destino de `law/adr` por OD-R18-001, gate
`verify:state-index`, `.gitignore` de `reports/`, índices) **e de R-0019**
(`law-corpus`: `law/invariants`, `law/trace.json`, `law/schemas`, `adopter-policy`). R-0017 corre
em paralelo; se ainda não tiver `closure` quando o CTG-0003 chegar, o seal de R-0017 fica para o
último CTG ou para a primeira rodada seguinte (registrar em §Concorrência). Esta rodada precede as
rodadas de código (C-0002 §3.2); R-0021 pode correr em paralelo (abre após R-0017): os locks desta
rodada (CI, `.devai/config`, `law/register`, `record/`, método da orquestra) são partilhados por
merge, e cada rodada que abrir depois do CTG-0005 já nasce com os gates novos.
**Bootstrap de 2026-09-27:** `origin/main` em `c848723c`; R-0018 fechada como PC-0015 (PR #131)
e R-0019 como PC-0016 (PR #140), com os CTGs e observações posteriores em `main` (PRs #132,
#137–#142). R-0017 permanece aberta: somente CTG-0001 foi mesclado (PR #133); CTG-0002/0003
aguardam OD-R17-001/002/003. Nenhum PR de outra frente estava aberto na consulta do bootstrap.
CTG-0001→0002→0003→0004→0005→0006 são seriais, com base no merge do CTG anterior, sem base
empilhada neste momento. CTG-0001/0002 podem ser desenvolvidos e mesclados após seus gates.
CTG-0003 sela R-0003…R-0016, R-0018 e R-0019; o selo de R-0017 fica para o último CTG se a
rodada fechar a tempo, ou registrado para a primeira rodada seguinte. `package.json`, o registro
canônico de ODs, `docs/dev` e possivelmente `.github/workflows/ci.yml` (`stack-smoke`) são locks
partilhados com R-0017; integrar `main` por merge e não editar em simultâneo com PR aberto dessa
rodada. R-0021 partilha CI, `.devai/config`, `record/` e o método quando abrir.

**Janelas previstas:** 2 (C-0002 §3), recalibradas no bootstrap; o escopo tem 6 CTGs.

## Decisões do Owner (2026-09-26)

- **OD-R20-003 = (A), controle de autoria por caminho.** Os commits segregados levam as identidades
  `DEVAI Architect|Owner|Machine` conforme o caminho tocado, e a autoridade é aplicada por caminho
  (hooks e `authority-policy`), não por recibo avulso. Os 11 achados históricos recebem recibo do
  Owner uma única vez, no CTG-0005.
- **OD-R20-005 = aceitar a Constituição 1.0.1.** A rodada executa `devai init bind --constitution`
  com pin 1.0.1 num commit segregado de autoria Owner. Atualiza `.devai/pin/constitution.md`,
  `CLAUDE.md` (via proposta de R-0018) e o destino de `law/policy/mutation-strength.json` conforme o
  Art. 18. Esta decisão substitui a restrição "sem `init bind --constitution --write` nesta rodada".

## Linha de base medida (2026-09-26, `a92ef731`, clone descartável, `devai` 1.5.6)

A medição oficial é a do CTG-0001 no HEAD de abertura; esta é a referência de planejamento.
Os números da tabela abaixo são medição **histórica** em `a92ef731`, anterior aos merges de
R-0018/R-0019; o CTG-0001 mede novamente o HEAD de abertura. A ADR-0022 hoje está **Accepted**
por OD-R18-002, sem reabrir essa decisão.

| Eixo                              | Medida                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Membros `devai check --only` (25) | **pass real:** `docs-governance` (com `--skip-publish-check`), `overrides`, `prompt-overlays`, `schemas` (5 bindings). **pass vazio:** `invariants`, `glossary`, `journeys`, `trace`, `sensor-integrity` (0 leituras). **FAIL:** `glob-guards` (0/35), `invariant-strategies` (população 0), `test-trace` (sem trace), `adrs` (resolução semântica não executada), `forbidden-actions` (11: 10 `FORBID-MUTATE-INVARIANTS`, 1 `FORBID-CI-WITHOUT-ADR` em `666dd63e`; 0 recibos), `docs-links` (1: `docs/site/vendor/image-size/Readme.md`), `action-coverage`, `action-effects` e `cli-reference` (membros de autoaplicação do DEVAI: exigem `law/policy/subprocess-effects.json`, `documentation-information-architecture.json` ou o catálogo de ações do próprio pacote). **REVIEW:** `ci-economy` (warn), `dependencies` (scanner indisponível). **Não executados:** `pr-compliance` (exige corpo de PR), `mutation` (N/A, delegado ao `bedel`), `blueprint`, `schema`, `translation` (exigem entrada) |
| Scorecard (`audit scorecard`)     | 45 células F1–F5 × T1–T9: **0 PASS / 43 UNKNOWN / 2 N/A**; 45 observações versionadas idênticas (35 MB), `previous_observation_digest_sha256: null`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Sensores                          | 0 `SensorReading` persistidos; `sense run spec_depth` → `review` (0 invariantes, 36 ADRs, 0 casos de uso); presets `baseline`/`governed` exigem `--write` (build/unit_test são `local-write`/`harness-write`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Rodadas                           | R-0003…R-0016 "active" no DEVAI; 14 PC (`PC-0001…0014`) válidos, todos com gates e critérios `pass`, todos com `D-1`/`D-2` inexistentes; 0 `record.md`, 0 `close-state.jsonl`, sem `law/register/`, sem `record/derived/indexes/rounds.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Cadeia                            | `record/proofs/chain.json` valid (89 registros); **49/106 linhas jsonl sem âncora**: R-0005 {9}, R-0007 {1–36, 38, 39}, R-0013 {4–10, 12–14}; merge `9ac6dd55` descartou âncoras 38/39 de R-0007; cadeia legada `.devai/state/evidence-chain.json` fora do CI                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Tarefas                           | 260 `work/rounds/*/tasks/TASK-*.json`: **143 inválidas** contra `task.schema.json` 2.0.0 (74 `target_invariants` não-INV, 50 `db_isolation`, 31 `coupled_task_group`, …); `.devai/state/tasks/` inexistente                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| PR e commits                      | 0/95 PRs com `Inv-Compliance:`; 59/95 declaram papel; 52/387 commits não-merge desde 2026-09-14 misturam F2 e F3; todo `actor_role` = `harness`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CI e autoridade                   | CI chama só `evidence verify --scope chain` e `doctor`; `authority_enforcement: cli-only`, sem hooks, sem `.claude/settings.json`; Art. 6/7 citados trocados                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Método                            | orquestra (ADR-0022 _Proposed_) substitui `round plan/run`, `round gap`, `triage`, `round tracking` e `executor.prompt_composition_id`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

Fatos de runtime (lidos em `node_modules/@aarusso-nyx/devai/dist/runtime/index/release-host.js`):
`round seal` exige `work/rounds/R-nnnn/record.md` (`record-meta` + `declared_by`, `closed_by`,
`phase_closure`, `merged_as`, `gates`, `plan_path`, `orchestrator_prompt`), decisões resolvíveis em
`law/adr/<D>.md`, `law/register/<D>.md` ou `### <D>` em `law/register/DECISIONS.md`, e o PC citado em
`record/derived/indexes/rounds.md` — **o DEVAI 1.5.6 não tem escritor desse índice**.
`forbidden-actions` aceita commit em `law/`/`work/rounds/` com autor `DEVAI Architect`, `product/`
com `DEVAI Owner`, `record/` com `DEVAI Machine`, ou recibo `authorized_by: Owner` por commit em
`law/policy/forbidden-action-authorizations.json`; mudança de CI só passa com ADR v2 aceita em
`law/adr` cujo `affected_rules` cubra o caminho. `init apply architect --include hooks --hook
pre-push|pre-commit|post-merge` instala hooks; `init bind --host-adapter post-merge|github-actions`
liga o Auditor pós-merge; `project.json` aceita `host-integrated` com `adapter_config`.

## Metas

1. **Linha de base medida e versionada** (CTG-0001): script somente leitura
   `tools/devai/baseline.mjs` que reproduz a tabela acima (25 membros, scorecard, sensores `read`,
   rodadas, âncoras jsonl × `chain.json`, validade de tarefas, trailers de PR, commits mistos) e
   grava `work/rounds/R-0020/baseline.json` + `baseline.md` no HEAD de abertura; rodado de novo no
   fim (`baseline-final.*`). Caracterização antes de toda mudança; regressão é FAIL.
2. **Cadeia reparada sem reescrever histórico** (CTG-0002): uma entrada de correção append-only por
   rodada afetada (`devai evidence record --kind generic`) que declara cada linha órfã (sequência,
   sha256 da linha) e a perda do merge `9ac6dd55`; gate `verify:proof-anchors` (cruza jsonl ×
   notas `proof_sequence`) no `pnpm check` e no CI; `.gitattributes` com `merge=binary` para
   `record/proofs/**` (conflito nunca resolvido por texto); cadeia legada verificada no CI ou
   `AGENTS.md` regra 4 corrigida (M-decisão); issue upstream no DEVAI para o cruzamento no verificador.
   Neste CTG, o gate entra por `pnpm check`; o passo explícito em `ci.yml` e eventual verificação da
   cadeia legada no CI pertencem ao CTG-0005, depois da ADR v2 aceita pelo Owner.
3. **Decisões registradas e rodadas seladas** (CTG-0003): `law/register/DECISIONS.md` conforme
   OD-R20-001; tarefas normalizadas (`tools/devai/normalize-tasks.mjs`, determinístico: refs não-INV
   → `tags` `ref:<id>`, INV do `law/trace.json` quando houver, enums corrigidos) e
   `task.template.json` corrigido; gate `verify:round-tasks` (cada `tasks/*.json` contra
   `law/schemas/task.schema.json` via `devai check --only schema`); `record.md` por rodada;
   `record/derived/indexes/rounds.md` conforme OD-R20-002; `devai round seal` em R-0003…R-0019 com
   PC (R-0001/R-0002 pré-governança: registrados como tal, sem seal). Normalização **antes** do seal.
4. **Sensores ligados** (CTG-0004): leituras `SensorReading` persistidas por `devai sense record`
   para os kinds aplicáveis (presets `baseline` e `governed`; `read` do `sweep`), com os comandos do
   repositório; `triage classify` antes de remediar falha de sensor; Auditor pós-merge por
   `init bind --host-adapter` (M-decisão entre `post-merge` e `github-actions`) com observações
   encadeadas; destino dos 35 MB de `.devai/state/audit-observations/` (OD-R20-004).
5. **Gates DEVAI no CI** (CTG-0005): `law/policy/adr-validation.json` (se R-0018 não o tiver
   entregue) e ADR v2 aceita em `law/adr` com `affected_rules`
   `.github/workflows/ci.yml` — antes de tocar o CI; no job `evidence-gate`: `forbidden-actions
--since-ref <base>`, `glob-guards`, `adrs`, `invariants`, `invariant-strategies`, `glossary`,
   `journeys`, `trace`, `test-trace`, `schemas`, `sensor-integrity`, `docs-governance`,
   `ci-economy` (REVIEW registrado), `pr-compliance --pr-body-file` (trailer `Inv-Compliance:`),
   `verify:proof-anchors`, `verify:round-tasks`; recibos do Owner para os 11 achados históricos em
   `law/policy/forbidden-action-authorizations.json` (OD-R20-003); `.github/pull_request_template.md`
   com Art. 7 e `Inv-Compliance:`. Contextos obrigatórios da proteção de `main` são alterados **pelo
   Owner** (configuração de conta), com o pedido no PR.
6. **Autoridade por caminho e hooks** (CTG-0006): `project.json` `host-integrated` com
   `adapter_config` (hooks de Claude Code em `.claude/settings.json` recusando escrita fora da
   autoridade em `record/`, `.devai/`, `law/`, `product/`; equivalente documentado para Codex);
   hook `pre-push` por `init apply architect --include hooks`; convenção de autoria por caminho
   (OD-R20-003); papel por `--as-role` nas evidências; referências Art. 6/7/41 corrigidas
   (`.gitignore`, template de PR); regra "um commit por papel" no método.
7. **Orquestra × primitivas DEVAI** (CTG-0006): ADR proposta (Owner decide) que mapeia
   `AUTHORIZATION.md`, `tasks/`, `compositions.json` (`executor.prompt_composition_id`; o prefixo
   `PC-<16hex>` é do próprio `task.schema.json` e fica), `reviews/`, OD Markdown (`round gap`/RGR),
   issues (`round tracking`) e `budget.json` a primitivas DEVAI, e define o destino da ADR-0022
   (manter a ADR-0022 já aceita ou emendá-la por supersessão, sem reabrir seu aceite); `round seal` e sensores entram no
   `maestro-prompt.template.md` e em `orchestra/README.md`. Constituição 1.0.1 (NC-M6): **aceita pelo
   Owner** (OD-R20-005); `init bind --constitution` com pin 1.0.1 em commit segregado de autoria Owner.
8. **Meta de PASS** (adenda A1, antes do CTG-0004): a partir da linha de base do CTG-0001, o
   Architect fixa, com decisão do Owner, (i) o conjunto de membros `devai check` obrigatórios em CI
   (todos os aplicáveis ao adotante; os de autoaplicação ficam N/A com issue upstream, nunca
   silenciados) e (ii) o piso de células PASS do scorecard por substrato. Metas só sobem; nenhum
   gate existente é removido, afrouxado ou convertido em aviso.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço           | Lock                                                                | Depende de                   | Entrega                                                                                                                                                                                                                                                                                                    |
| --------- | -------------------- | ------------------- | ------------------------ | ------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-baseline`                                         | —                            | `contracts/CTG-0001.md`: métricas exatas, comandos, formato de `baseline.json`, critérios C-01-nn                                                                                                                                                                                                          |
| TASK-0002 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0001                    | `tools/devai/tests/baseline.test.mjs` (fixtures de jsonl/cadeia, tarefas válidas e inválidas, commits mistos)                                                                                                                                                                                              |
| TASK-0003 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-root-package-json`                          | TASK-0002                    | `tools/devai/baseline.mjs` (somente leitura) + scripts `devai:baseline` e `devai:test`; baseline da abertura materializada **pelo maestro**                                                                                                                                                                |
| TASK-0004 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-chain`                                            | merge CTG-0001               | `contracts/CTG-0002.md`: payload das entradas de correção por rodada, regra do gate de âncoras, `.gitattributes`, decisão sobre a cadeia legada, texto da issue upstream                                                                                                                                   |
| TASK-0005 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0004                    | testes de `verify:proof-anchors` (linha órfã, âncora duplicada, correção declarada)                                                                                                                                                                                                                        |
| TASK-0006 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-root-package-json`, `MOD-gitattributes`     | TASK-0005                    | `tools/devai/verify-proof-anchors.mjs`, script, `pnpm check`; `.gitattributes`; entradas de correção gravadas **pelo maestro** com `evidence record`                                                                                                                                                       |
| TASK-0007 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-seal`, `MOD-law-register`                         | merge CTG-0002               | `contracts/CTG-0003.md` + `law/register/DECISIONS.md` (OD-R20-001); mapa rodada → PC → `merged_as` → gates → plan/prompt; tabela de normalização campo a campo; forma do índice de rodadas (OD-R20-002); roteiro do ensaio de `round seal` em clone descartável **pelo maestro** para as rodadas elegíveis |
| TASK-0008 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0007                    | testes de `normalize-tasks` (idempotência, nenhuma informação perdida) e de `verify:round-tasks`                                                                                                                                                                                                           |
| TASK-0009 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-round-tasks`, `MOD-orchestra-task-template` | TASK-0008                    | `tools/devai/normalize-tasks.mjs` e gate; aplicação a R-0003…R-0019 **pelo maestro**; `task.template.json`; 0 tarefas inválidas                                                                                                                                                                            |
| TASK-0010 | Architect (transcr.) | transcriber-docs    | `gpt-6-luna` / low       | `MOD-round-records`                                                 | TASK-0009                    | `work/rounds/R-nnnn/record.md` para as rodadas com PC; R-0001/R-0002 ficam como exceção pré-método (a mesma declarada por R-0018 em `work/rounds/README.md`), sem seal                                                                                                                                     |
| TASK-0011 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-sensors`                                          | merge CTG-0003               | `contracts/CTG-0004.md`: kind → comando do repo → célula; o que fica N/A e por quê; persistência de leituras; adapter pós-merge; **adenda A1** (meta de PASS) para decisão do Owner                                                                                                                        |
| TASK-0012 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0011                    | testes do wrapper de sensores (leitura válida contra `sensor-reading.schema.json`, falha vira `fail`, nunca `pass`)                                                                                                                                                                                        |
| TASK-0013 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-devai-config`, `MOD-root-package-json`      | TASK-0012                    | `tools/devai/sense.mjs` + script `devai:sense`; binding do adapter pós-merge; primeiras leituras gravadas pelo maestro; scorecard ≥ piso A1                                                                                                                                                                |
| TASK-0014 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-ci`, `MOD-law-adr`                                | merge CTG-0004               | `law/policy/adr-validation.json` se ausente (coerente com OD-R18-001) e ADR v2 de gates de CI em `law/adr` (`check --only adrs` ok); `contracts/CTG-0005.md` (jobs, ordem, `--since-ref`, corpo de PR); proposta de `forbidden-action-authorizations.json` (11 recibos) para o Owner                       |
| TASK-0015 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-ci`, `MOD-pr-template`                                         | TASK-0019 + recibos do Owner | `.github/workflows/ci.yml`; `.github/pull_request_template.md`; recibos aplicados **pelo maestro** em commit segregado de autoria Owner                                                                                                                                                                    |
| TASK-0016 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-authority`, `MOD-law-adr`                         | merge CTG-0005               | ADR proposta orquestra × DEVAI; ADR proposta Constituição 1.0.1; `contracts/CTG-0006.md` (política de hooks por caminho e papel, `adapter_config`, convenção de autoria)                                                                                                                                   |
| TASK-0017 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-config`, `MOD-claude-settings`, `MOD-git-hooks`          | TASK-0020                    | `.devai/config/project.json` via `devai init bind`/`init apply` **pelo maestro**; `.claude/settings.json`; hook `pre-push`; `doctor` verde                                                                                                                                                                 |
| TASK-0018 | Architect (transcr.) | transcriber-docs    | `gpt-6-luna` / low       | `MOD-orchestra-method`, `MOD-docs`                                  | TASK-0017                    | `maestro-prompt.template.md` (seal, sensores, trailer, commit por papel), `orchestra/README.md`, `.gitignore` (Art. 41, se R-0018 não corrigiu), `backlog.md`, `waves.md` §Histórico                                                                                                                       |
| TASK-0019 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`, `MOD-ci-tests`                             | TASK-0014                    | testes estruturais de CI e template de PR: passos obrigatórios presentes, nenhum `continue-on-error`, `Inv-Compliance:` e Art. 7                                                                                                                                                                           |
| TASK-0020 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`, `MOD-authority-hook-tests`                 | TASK-0016                    | testes de autorização por caminho e papel para `record/`, `.devai/`, `law/`, `product/`, inclusive o caso do maestro                                                                                                                                                                                       |

CTG-0001 = 0001 → 0002 → 0003; CTG-0002 = 0004 → 0005 → 0006; CTG-0003 = 0007 → 0008 → 0009 →
0010, depois `round seal` pelo maestro; CTG-0004 = 0011 → 0012 → 0013;
CTG-0005 = 0014 → 0019 → 0015; CTG-0006 = 0016 → 0020 → 0017 → 0018. Os ids 0019/0020
preservam os 18 ids já compostos na primeira revisão; a execução segue a ordem topológica aqui.
**Um PR por CTG**, em série (cada um depende do merge do anterior:
lock de `record/`, `package.json` e CI). Testes do Inspector com `node --test
tools/devai/tests/*.test.mjs` (script `devai:test`, criado na TASK-0003, padrão `parameters:test`).

**Checkpoints (maestro, Engineer):** (a) antes de qualquer `--write` do DEVAI, ensaio no clone
descartável e `git status --porcelain` limpo depois; (b) `evidence record` e `round seal` só pelo
maestro, nunca por worker; (c) após o CTG-0003, `devai round status --round R-nnnn` →
`closed` para cada rodada selada; (d) após TASK-0013, `devai audit scorecard --at <HEAD>` e
comparação com A1; (e) antes de TASK-0015, ADR v2 aceita pelo Owner e recibos históricos
autorizados/aplicados em commit segregado; (f) antes de TASK-0017, ensaio de `init bind
--constitution` 1.0.1 no clone descartável e aplicação pelo maestro em commit segregado de
autoria Owner; após `init bind|apply`, `devai doctor` deve mostrar todos `[✓]`; (g) no fechamento,
`record.md` e `closure.json` da R-0020 pelo maestro antes de `round seal`.

## Critérios de aceitação (comandos → resultado)

- `pnpm devai:baseline` → `baseline-final.json` sem regressão em nenhum eixo contra `baseline.json`
  (regressão = FAIL, não REVIEW).
- `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human` → valid;
  `pnpm verify:proof-anchors` → 0 linhas sem âncora não declaradas; toda linha nova da rodada ancorada.
- `pnpm verify:round-tasks` → 0 inválidas em R-0003…R-0020.
- `pnpm exec devai round status --round R-nnnn --repo-root . --format json` → `location` fechada
  (`close-state.jsonl` presente) para toda rodada com PC de R-0003 a R-0019, e para R-0020 no fim.
- `pnpm exec devai check --only <m> --repo-root . --format json` → `ok: true` para todo membro
  obrigatório de A1 (no mínimo `forbidden-actions --since-ref <base do PR>`, `glob-guards`, `adrs`,
  `invariants`, `invariant-strategies`, `glossary`, `journeys`, `trace`, `test-trace`, `schemas`,
  `sensor-integrity` com `readings_scanned` > 0, `docs-governance`); `pr-compliance --pr-body-file`
  → ok nos PRs desta rodada.
- `pnpm exec devai audit scorecard --repo-root . --at <HEAD-40> --format json` → células PASS ≥ piso
  A1 e nenhuma célula antes PASS agora diferente de PASS.
- `pnpm exec devai doctor --repo-root . --format human` → todos `[✓]` em `host-integrated`.
- `pnpm devai:test`, `pnpm format:check`, `pnpm check` → verdes; CI do PR com os novos passos verdes.

## Comandos de aceitação por tarefa

- **TASK-0001:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0001.md` presente e limitada aos caminhos do prompt.
- **TASK-0002:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/baseline.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0003:** `pnpm check` → exit 0; entrega `tools/devai/baseline.mjs, scripts devai:baseline/devai:test, baseline.json/md` presente e limitada aos caminhos do prompt.
- **TASK-0004:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0002.md` presente e limitada aos caminhos do prompt.
- **TASK-0005:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/verify-proof-anchors.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0006:** `pnpm check` → exit 0; entrega `verify-proof-anchors.mjs, package.json, .gitattributes` presente e limitada aos caminhos do prompt.
- **TASK-0007:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0003.md e law/register/DECISIONS.md quando OD-R20-001/002 decididas` presente e limitada aos caminhos do prompt.
- **TASK-0008:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/normalize-tasks.test.mjs e verify-round-tasks.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0009:** `pnpm check` → exit 0; entrega `normalize-tasks.mjs, verify-round-tasks.mjs, tasks históricas e template` presente e limitada aos caminhos do prompt.
- **TASK-0010:** `pnpm format:check` → exit 0; entrega `record.md por rodada com PC` presente e limitada aos caminhos do prompt.
- **TASK-0011:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0004.md e proposta A1` presente e limitada aos caminhos do prompt.
- **TASK-0012:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/sense.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0013:** `pnpm check` → exit 0; entrega `tools/devai/sense.mjs e script devai:sense; binding pelo maestro` presente e limitada aos caminhos do prompt.
- **TASK-0014:** `pnpm format:check` → exit 0; entrega `adr-validation.json, ADR v2 e contracts/CTG-0005.md` presente e limitada aos caminhos do prompt.
- **TASK-0015:** `pnpm check` → exit 0; entrega `ci.yml, pull_request_template.md e recibos aprovados` presente e limitada aos caminhos do prompt.
- **TASK-0016:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0006.md e ADRs propostas` presente e limitada aos caminhos do prompt.
- **TASK-0017:** `pnpm check` → exit 0; entrega `settings e hooks; bind/apply executados pelo maestro` presente e limitada aos caminhos do prompt.
- **TASK-0018:** `pnpm format:check` → exit 0; entrega `maestro-prompt.template.md, README.md, waves.md, backlog.md` presente e limitada aos caminhos do prompt.
- **TASK-0019:** `pnpm format:check` → exit 0; testes estruturais de CI e template presentes,
  com RED documentado antes da TASK-0015 e PASS obrigatório após a implementação.
- **TASK-0020:** `pnpm format:check` → exit 0; testes positivos e negativos de autoridade por
  caminho presentes, com RED documentado antes da TASK-0017 e PASS após implementação.

## Mapa entregável → definições

| Entregável        | Definição                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| linha de base     | esta seção; `node_modules/@aarusso-nyx/devai/dist/law/policy/{check-suites,sense-presets,sensor-registry}.json`                                                                                                     |
| cadeia            | `record/proofs/{chain.json,work/generic/*.jsonl}`; `.devai/state/evidence-chain.json`; `.devai/pin/constitution.md` Art. 6, 41                                                                                      |
| seal              | `record/proofs/compliance/closures/PC-0001…PC-0014.json`; `work/rounds/R-00{03…19}/{plan.md,prompts/00-maestro.md,AUTHORIZATION.md,closure.json}`; esquemas `record-meta`, `phase-closure`                          |
| tarefas           | `work/rounds/*/tasks/TASK-*.json`; `docs/meta/agents/orchestra/task.template.json`; `law/schemas/task.schema.json` (R-0019); `law/trace.json`                                                                       |
| sensores          | `sensor-registry.json` (59 kinds, célula por kind); `sensor-reading.schema.json`; `scorecard.schema.json`; `.devai/state/audit-observations/`                                                                       |
| CI                | `.github/workflows/{ci.yml,devai-local-rc-verify.yml}`; `law/adr/` (OD-R18-001); `adr-validation-policy.schema.json`, `adr-v2.schema.json`; `forbidden-actions.json`; `forbidden-action-authorizations.schema.json` |
| autoridade        | `.devai/config/{project,authority-policy}.json`; `project-config.schema.json`; `.claude/agents/*`; `.github/pull_request_template.md`                                                                               |
| orquestra × DEVAI | `docs/meta/adr/ADR-0022-orchestra-execution-model.md`; `docs/meta/agents/orchestra/*`; `tools/orchestra/*`; `task.schema.json`, `rgr.schema.json`, `round-tracking-activation.schema.json`                          |

## Riscos

- **Índice de rodadas sem escritor no DEVAI 1.5.6:** sem OD-R20-002 decidida, o seal não roda →
  checkpoint após CTG-0002; nunca escrever `record/` à mão.
- **`forbidden-actions` no CI sem recibos:** o histórico falha até o Owner assinar os recibos; o CI
  usa `--since-ref` da base do PR, e os 11 achados históricos só passam por recibo, nunca por
  exclusão de janela.
- **Membros de autoaplicação** (`action-coverage`, `action-effects`, `cli-reference`): falham por
  arquivos que só existem no repositório do DEVAI; ficam fora do CI como N/A com issue upstream
  registrada em A1 — não é afrouxamento porque nunca foram gate.
- **Hooks de host** podem bloquear o próprio maestro: ensaiar com papel declarado antes de ativar;
  `--no-verify` é ação proibida (`FORBID-NO-VERIFY`).
- **Concorrência com R-0021:** ambas podem tocar `package.json` e CI; integrar `origin/main` por
  merge antes de cada PR e reexecutar os gates; os gates novos valem para R-0021 a partir do merge
  do CTG-0005.
- **Escopo:** 6 CTGs em 2 janelas é apertado; a ordem dos CTGs é a prioridade — o que não couber
  vira checkpoint, não corte de critério.

## Lições aplicadas (C-0001 e método)

- Relatórios versionados (`.gitignore` corrigido por R-0018; conferir `find` × `git ls-files`).
- Critérios imutáveis: A1 é a única adenda prevista e só **fixa** a meta, com decisão do Owner;
  qualquer outra mudança é adenda numerada; critério substituído aparece como não cumprido.
- ODs no registro canônico no mesmo PR (seção da rodada em `open-decisions-rait.md`).
- Âncora da prova: esta rodada cria o gate que torna a regra mecânica; nenhuma rodada fecha ou é
  selada com linha órfã não declarada.
- Orçamento: `budget.json`; estouro → checkpoint.
- Caracterização antes de troca: `baseline.json` antes de qualquer mudança; `baseline-final.json`
  depois; divergência negativa é FAIL.
- Proibido reproduzir as substituições de R-0013/R-0014 e o waiver SQL2 de R-0007.

## Decisões do Owner a obter (registro canônico, seção R-0020)

- **OD-R20-001** — decisões dos 14 PC: (A) registrar `D-1` (autorização do Owner no
  `AUTHORIZATION.md` da rodada) e `D-2` (fechamento pelo maestro após merge com CI verde e PASS do
  reviewer) em `law/register/DECISIONS.md`, com anexo por rodada — sem novo PC; ou (B) novo
  `round close` por rodada com decisões `DII-nnnn` próprias (novos PC, os antigos ficam). Proposta: A.
- **OD-R20-002** — `record/derived/indexes/rounds.md`: (A) pedido upstream ao DEVAI e espera; ou
  (B) gerador local determinístico a partir de `record/proofs/compliance/closures/*.json`, commit
  segregado com recibo do Owner. Proposta: B com issue upstream.
- **OD-R20-003** — **decidida pelo Owner em 2026-09-26: (A).** Autoria por caminho: (A) identidades `DEVAI Architect|Owner|Machine` nos commits
  segregados; ou (B) autor humano e recibo do Owner por commit. Inclui os 11 recibos históricos.
- **OD-R20-004** — `.devai/state/audit-observations/` (35 MB): manter versionado ou só âncora na
  cadeia com artefato externo.
- **OD-R20-005** — **decidida pelo Owner em 2026-09-26: aceitar.** Constituição 1.0.1 (Art. 18: mutação fora de gate): aceitar (`init bind
--constitution`) ou recusar, e destino de `law/policy/mutation-strength.json`.
- **OD-R20-006** — ADR-0022 **já aceita** por OD-R18-002: manter a ADR aceita ou emendá-la por
  supersessão através da ADR orquestra × DEVAI; o aceite não é reaberto.
- **A1** — meta de PASS (Meta 8).

## Decisões do maestro

- **A2 — correção factual pela decisão Owner OD-R18-002:** ADR-0022 já está Accepted em `main`.
  A OD-R20-006 só decide manutenção ou supersessão; nenhum critério de aceitação foi trocado.
- **M4 — cobertura Inspector:** revisão cruzada 1 identificou ausência de testes precedentes nos
  CTGs 0005/0006. Acrescentadas TASK-0019/0020, mantendo os critérios e a ordem Architect →
  Inspector → Engineer; nenhum worker dessas tarefas foi disparado antes da revisão.

- **M1 — troca de famílias autorizada pelo Owner em 2026-09-27:** maestro e workers Codex;
  reviewer Claude Code pela ponte. Escada vigente e ids: Sol 6 `gpt-6-sol` (maestro, Architect
  e tarefas grandes), Terra `gpt-5.6-terra` (médio), Luna `gpt-6-luna` (pequeno), reviewer
  Opus 5.5 `claude-opus-5-5` (grande). `codex --help` e `claude --help` confirmam os parâmetros
  `--model`; os ids constam da confirmação executada em R-0018/R-0019 e de
  `model-ladder.md`. As CLIs locais são `codex-cli 0.157.1` e Claude Code 2.1.283.
- **M2 — worktree do host:** a correção do Owner substitui o caminho em `/Volumes/Thiamat II`;
  worktree gerenciada e limpa criada de `origin/main` em
  `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`.
- **M3 — scaffold:** ensaio isolado de `devai round plan --scaffold --write` retornou
  `ROUND_ALREADY_EXISTS` sem alterar arquivos rastreados: `plan.md` já existe em `main`.
  Não repetir a escrita na worktree.

## Bloqueios

## Triagem

- Bootstrap: `devai check --only adrs` retorna `ACTION_INVOCATION_REFUSED` porque
  `law/policy/adr-validation.json` não existe; TASK-0014 cria a política prevista no plano.
  Classificação: `reference-gap` do binding de adoção, sem alteração de gate.
- Bootstrap: `round plan --scaffold --write` no clone descartável
  `/tmp/r20-scaffold.5I8VY4` retornou `ROUND_ALREADY_EXISTS` (exit 2), sem escrita rastreada;
  scaffold já materializado no repositório. Classificação: `policy-issue` de invocação redundante.
- A leitura inicial sem `--since-ref` de `forbidden-actions` em `c848723c` enumerou 43 achados
  (31 commits únicos: 30 `FORBID-MUTATE-INVARIANTS`, 5 `FORBID-EXTERNAL-MESSAGES`, 4
  `FORBID-DROP-PROD`, 4 `FORBID-RM-RF`), contra os 11 do diagnóstico histórico em `a92ef731`.
  É medição de escopo diferente, não autorização para ampliar os recibos do Owner. CTG-0001
  caracteriza o conjunto; CTG-0005 exige triagem antes de qualquer novo recibo ou mudança de gate.

## Retomada

## Leitura

- HEAD de abertura: `c848723c1ee9053233b7e08732c5b80bbe06d625`.
- Lidos para bootstrap: `AGENTS.md`, `CODESTYLE.md`, manuais dos quatro perfis,
  `docs/meta/agents/README.md`, `orchestra/{README.md,model-ladder.md,waves.md}`,
  `work/campaigns/C-0002-consolidacao.md`, `.devai/pin/constitution.md`,
  `.devai/config/project.json`, ADR-0022, ADR-0028, `law/{README.md,adr/README.md,
invariants/README.md,trace.json}`, `.github/{workflows/ci.yml,pull_request_template.md}`,
  `record/proofs/README.md`, políticas DEVAI `check-suites`, `sense-presets`,
  `sensor-registry`, esquemas `phase-closure`, `record-meta`, `task`, `sensor-reading`,
  `forbidden-action-authorizations`, `project-config`, steering §H e `plan.md`.
```

### docs/meta/knowledge-base/open-decisions-rait.md

```markdown
## R-0020 — sensores DEVAI (C-0002, ação 5)

As decisões já tomadas permanecem fechadas. A ADR-0022 foi aceita pela OD-R18-002; a OD-R20-006
decide apenas se a nova ADR a mantém ou a emenda por supersessão.

| ID         | Questão                                                                | Estado / premissa até decisão                                                                      | Decisor | Fonte                        |
| ---------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------- | ---------------------------- |
| OD-R20-001 | Destino de `D-1` e `D-2` dos PC históricos.                            | Pendente; proposta A: registrar decisões em `law/register/DECISIONS.md` sem reemitir PC.           | Owner   | `work/rounds/R-0020/plan.md` |
| OD-R20-002 | Escritor de `record/derived/indexes/rounds.md` ausente no DEVAI 1.5.6. | Pendente; proposta B: gerador determinístico local com issue upstream, sem editar `record/` à mão. | Owner   | `work/rounds/R-0020/plan.md` |
| OD-R20-003 | Autoria por caminho ou recibo avulso.                                  | **Decidida (A), Owner 2026-09-26:** identidades segregadas e controle de autoridade por caminho.   | Owner   | `work/rounds/R-0020/plan.md` |
| OD-R20-004 | Destino das observações de auditoria versionadas.                      | Pendente; manter os 35 MB versionados ou reter só âncora com artefato externo.                     | Owner   | `work/rounds/R-0020/plan.md` |
| OD-R20-005 | Constituição 1.0.1.                                                    | **Decidida: aceitar**, por `devai init bind --constitution` e commit segregado de autoria Owner.   | Owner   | `work/rounds/R-0020/plan.md` |
| OD-R20-006 | ADR-0022 aceita: manter ou emendar por supersessão?                    | Pendente; o aceite da ADR-0022 por OD-R18-002 não é reaberto.                                      | Owner   | `work/rounds/R-0020/plan.md` |
| A1         | Piso de PASS e membros obrigatórios aplicáveis.                        | Pendente da medição CTG-0001; nenhuma meta é presumida nem reduzida.                               | Owner   | `work/rounds/R-0020/plan.md` |
```

### work/rounds/R-0020/prompts/TASK-0001.md

````markdown
# Prompt de worker — `TASK-0001` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir contrato da linha de base**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `node_modules/@aarusso-nyx/devai/dist/law/policy/check-suites.json`
7. `node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json`
8. `node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json`
9. `record/proofs/chain.json`
10. `law/schemas/task.schema.json`

## Pode tocar

- `work/rounds/R-0020/contracts/CTG-0001.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir contrato da linha de base. Entregar contracts/CTG-0001.md. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: contracts/CTG-0001.md. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0001; predecessor nenhum. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Métricas C1: 25 membros de check, scorecard 45 células, SensorReading persistidas, closures, linha jsonl × chain, validade de TASK, trailers PR, commits mistos. Medir HEAD exato antes de mudar código; saída JSON e Markdown determinística.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `contracts/CTG-0001.md` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0001
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
```
````

````

### work/rounds/R-0020/prompts/TASK-0002.md

```markdown
# Prompt de worker — `TASK-0002` (`inspector-tests`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Inspector**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Testar o medidor da linha de base**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/inspector-tests.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0001.md`
7. `law/schemas/task.schema.json`
8. `record/proofs/chain.json`
9. `work/rounds/R-0020/reports/TASK-0001.md`

## Pode tocar

- `tools/devai/tests/baseline.test.mjs`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Testar o medidor da linha de base. Entregar tools/devai/tests/baseline.test.mjs. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/tests/baseline.test.mjs. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0001; predecessor TASK-0001. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Testes de caracterização: linha sem âncora, linha declarada, tarefa válida/inválida e commit que mistura F2/F3. Testes podem ficar RED antes do Engineer; não reduza asserções.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/tests/baseline.test.mjs` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `node --test tools/devai/tests/baseline.test.mjs` → testes executam; RED de caracterização é documentado e só vira PASS após a tarefa Engineer.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Inspector
Tarefa: TASK-0002
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0003.md

```markdown
# Prompt de worker — `TASK-0003` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Implementar e medir linha de base**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0001.md`
7. `tools/devai/tests/baseline.test.mjs`
8. `package.json`
9. `work/rounds/R-0020/reports/TASK-0002.md`

## Pode tocar

- `tools/devai/baseline.mjs`
- `package.json`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Implementar o medidor da linha de base. Entregar tools/devai/baseline.mjs e scripts devai:baseline/devai:test. O maestro mede e grava baseline.json/md após receber o script; o worker só testa com --out-dir temporário. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/baseline.mjs, scripts devai:baseline/devai:test, baseline.json/md. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0001; predecessor TASK-0002. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Script somente leitura. Não altere a referência para obter PASS; o maestro executa o script e materializa baseline.json/md sob autoria Architect; esses artefatos registram o HEAD de abertura e cada eixo observado, inclusive falhas preexistentes.

## Critérios de aceitação

- `pnpm check` → exit 0 nos arquivos que esta tarefa pode tocar.
- `tools/devai/baseline.mjs` e scripts `devai:baseline`/`devai:test` presentes; os arquivos baseline.json/md são gerados depois pelo maestro.
- `pnpm devai:baseline --out-dir <diretório temporário fora do repositório>` → JSON/Markdown completos para o HEAD de abertura; o próprio script verifica internamente que o status Git antes e depois é idêntico, inclusive `.devai/`; o worker não invoca Git diretamente. O script deve recusar efeitos de escrita de `audit scorecard` ou qualquer membro DEVAI no repositório. O maestro materializa baseline.json/md após a entrega.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0003
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0004.md

```markdown
# Prompt de worker — `TASK-0004` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir reparo da cadeia e gate de âncoras**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `record/proofs/chain.json`
7. `record/proofs/README.md`
8. `.devai/pin/constitution.md`
9. `.devai/state/evidence-chain.json`
10. `work/rounds/R-0020/reports/TASK-0003.md`
11. `work/rounds/R-0020/baseline.json`
12. `record/proofs/work/generic/R-0005.jsonl`
13. `record/proofs/work/generic/R-0007.jsonl`
14. `record/proofs/work/generic/R-0013.jsonl`

## Pode tocar

- `work/rounds/R-0020/contracts/CTG-0002.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir reparo da cadeia e gate de âncoras. Entregar contracts/CTG-0002.md. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: contracts/CTG-0002.md. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0002; predecessor TASK-0003. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0005, R-0007 e R-0013 contêm linhas órfãs históricas. Correção é nova prova declaratória, nunca edição de jsonl/chain. Gate deve rejeitar órfã não declarada e âncora duplicada.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `contracts/CTG-0002.md` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0004
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0005.md

```markdown
# Prompt de worker — `TASK-0005` (`inspector-tests`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Inspector**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Testar verificação de âncoras**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/inspector-tests.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0002.md`
7. `record/proofs/chain.json`
8. `work/rounds/R-0020/reports/TASK-0004.md`
9. `work/rounds/R-0020/baseline.json`
10. `record/proofs/work/generic/R-0005.jsonl`
11. `record/proofs/work/generic/R-0007.jsonl`
12. `record/proofs/work/generic/R-0013.jsonl`

## Pode tocar

- `tools/devai/tests/verify-proof-anchors.test.mjs`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Testar verificação de âncoras. Entregar tools/devai/tests/verify-proof-anchors.test.mjs. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/tests/verify-proof-anchors.test.mjs. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0002; predecessor TASK-0004. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0005, R-0007 e R-0013 contêm linhas órfãs históricas. Correção é nova prova declaratória, nunca edição de jsonl/chain. Gate deve rejeitar órfã não declarada e âncora duplicada.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/tests/verify-proof-anchors.test.mjs` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `node --test tools/devai/tests/verify-proof-anchors.test.mjs` → testes executam; RED de caracterização é documentado e só vira PASS após a tarefa Engineer.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Inspector
Tarefa: TASK-0005
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0006.md

```markdown
# Prompt de worker — `TASK-0006` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Implementar gate de âncoras**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0002.md`
7. `tools/devai/tests/verify-proof-anchors.test.mjs`
8. `record/proofs/chain.json`
9. `work/rounds/R-0020/reports/TASK-0005.md`
10. `work/rounds/R-0020/baseline.json`
11. `record/proofs/work/generic/R-0005.jsonl`
12. `record/proofs/work/generic/R-0007.jsonl`
13. `record/proofs/work/generic/R-0013.jsonl`

## Pode tocar

- `tools/devai/verify-proof-anchors.mjs`
- `package.json`
- `.gitattributes`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Implementar gate de âncoras. Entregar verify-proof-anchors.mjs, package.json, .gitattributes. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: verify-proof-anchors.mjs, package.json, .gitattributes. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0002; predecessor TASK-0005. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0005, R-0007 e R-0013 contêm linhas órfãs históricas. Correção é nova prova declaratória, nunca edição de jsonl/chain. Gate deve rejeitar órfã não declarada e âncora duplicada.

## Critérios de aceitação

- `pnpm format:check` → exit 0. O gate de âncoras deve ficar RED com as órfãs históricas ainda não declaradas; reporte a contagem exata. O maestro grava as correções por evidence record e só então exige `pnpm verify:proof-anchors` e `pnpm check` verdes para o CTG.
- Entrega declarada em `verify-proof-anchors.mjs, package.json, .gitattributes` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `node --test tools/devai/tests/verify-proof-anchors.test.mjs` → PASS para órfã, duplicata e correção declarada; o maestro grava as provas por `devai evidence record`.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0006
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0007.md

```markdown
# Prompt de worker — `TASK-0007` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir decisões e selo das rodadas**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `law/schemas/task.schema.json`
7. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/phase-closure.schema.json`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/record-meta.schema.json`
9. `work/rounds/README.md`
10. `work/rounds/R-0020/reports/TASK-0006.md`
11. `record/proofs/compliance/closures/PC-0001.json`
12. `record/proofs/compliance/closures/PC-0002.json`
13. `record/proofs/compliance/closures/PC-0003.json`
14. `record/proofs/compliance/closures/PC-0004.json`
15. `record/proofs/compliance/closures/PC-0005.json`
16. `record/proofs/compliance/closures/PC-0006.json`
17. `record/proofs/compliance/closures/PC-0007.json`
18. `record/proofs/compliance/closures/PC-0008.json`
19. `record/proofs/compliance/closures/PC-0009.json`
20. `record/proofs/compliance/closures/PC-0010.json`
21. `record/proofs/compliance/closures/PC-0011.json`
22. `record/proofs/compliance/closures/PC-0012.json`
23. `record/proofs/compliance/closures/PC-0013.json`
24. `record/proofs/compliance/closures/PC-0014.json`
25. `record/proofs/compliance/closures/PC-0015.json`
26. `record/proofs/compliance/closures/PC-0016.json`
27. `work/rounds/R-0003/closure.json`
28. `work/rounds/R-0004/closure.json`
29. `work/rounds/R-0005/closure.json`
30. `work/rounds/R-0006/closure.json`
31. `work/rounds/R-0007/closure.json`
32. `work/rounds/R-0008/closure.json`
33. `work/rounds/R-0009/closure.json`
34. `work/rounds/R-0010/closure.json`
35. `work/rounds/R-0011/closure.json`
36. `work/rounds/R-0012/closure.json`
37. `work/rounds/R-0013/closure.json`
38. `work/rounds/R-0014/closure.json`
39. `work/rounds/R-0015/closure.json`
40. `work/rounds/R-0016/closure.json`
41. `work/rounds/R-0018/closure.json`
42. `work/rounds/R-0019/closure.json`
43. `node_modules/@aarusso-nyx/devai/dist/runtime/index/release-host.js`

## Pode tocar

- `work/rounds/R-0020/contracts/CTG-0003.md`
- `law/register/DECISIONS.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir decisões e selo das rodadas. Entregar contracts/CTG-0003.md e law/register/DECISIONS.md quando OD-R20-001/002 decididas. O contrato deve conter tabela completa rodada → PC → merged_as → gates → plan_path → orchestrator_prompt para TASK-0010. O ensaio de round seal com --write é feito somente pelo maestro em clone descartável, não pelo worker. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: contracts/CTG-0003.md e law/register/DECISIONS.md quando OD-R20-001/002 decididas. O contrato deve conter tabela completa rodada → PC → merged_as → gates → plan_path → orchestrator_prompt para TASK-0010. O ensaio de round seal com --write é feito somente pelo maestro em clone descartável, não pelo worker. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0003; predecessor TASK-0006. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0003…R-0016, R-0018 e R-0019 possuem PC; R-0017 só entra após closure em main. R-0001/R-0002 são pré-método. Normalização de TASK precede seal; `record/` só pelo verbo DEVAI e pelo maestro.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `contracts/CTG-0003.md e law/register/DECISIONS.md quando OD-R20-001/002 decididas` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0007
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0008.md

```markdown
# Prompt de worker — `TASK-0008` (`inspector-tests`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Inspector**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Testar normalização e validade das tarefas**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/inspector-tests.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0003.md`
7. `law/schemas/task.schema.json`
8. `docs/meta/agents/orchestra/task.template.json`
9. `work/rounds/R-0020/reports/TASK-0007.md`

## Pode tocar

- `tools/devai/tests/normalize-tasks.test.mjs`
- `tools/devai/tests/verify-round-tasks.test.mjs`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Testar normalização e validade das tarefas. Entregar tools/devai/tests/normalize-tasks.test.mjs e verify-round-tasks.test.mjs. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/tests/normalize-tasks.test.mjs e verify-round-tasks.test.mjs. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0003; predecessor TASK-0007. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0003…R-0016, R-0018 e R-0019 possuem PC; R-0017 só entra após closure em main. R-0001/R-0002 são pré-método. Normalização de TASK precede seal; `record/` só pelo verbo DEVAI e pelo maestro.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/tests/normalize-tasks.test.mjs e verify-round-tasks.test.mjs` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `node --test tools/devai/tests/normalize-tasks.test.mjs tools/devai/tests/verify-round-tasks.test.mjs` → ambas as suítes executam; RED de caracterização é documentado e só vira PASS após a tarefa Engineer.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Inspector
Tarefa: TASK-0008
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0009.md

```markdown
# Prompt de worker — `TASK-0009` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Normalizar tarefas e criar gate**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0003.md`
7. `tools/devai/tests/normalize-tasks.test.mjs`
8. `tools/devai/tests/verify-round-tasks.test.mjs`
9. `law/schemas/task.schema.json`
10. `law/trace.json`
11. `work/rounds/R-0020/reports/TASK-0008.md`
12. `docs/meta/agents/orchestra/task.template.json`

## Pode tocar

- `tools/devai/normalize-tasks.mjs`
- `tools/devai/verify-round-tasks.mjs`
- `docs/meta/agents/orchestra/task.template.json`
- `package.json`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Normalizar tarefas e criar gate. Entregar normalize-tasks.mjs, verify-round-tasks.mjs, tasks históricas e template. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: normalize-tasks.mjs, verify-round-tasks.mjs, tasks históricas e template. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0003; predecessor TASK-0008. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0003…R-0016, R-0018 e R-0019 possuem PC; R-0017 só entra após closure em main. R-0001/R-0002 são pré-método. A tabela campo a campo de CTG-0003.md é a fonte fechada para as classes inválidas; não procure amostras fora dela. Normalização de TASK precede seal; o worker entrega o normalizador e o gate, e o maestro aplica a normalização nos arquivos históricos sob autoria Architect. `record/` só pelo verbo DEVAI e pelo maestro.

## Critérios de aceitação

- `pnpm format:check` → exit 0. O gate pode permanecer RED nas tarefas históricas até o maestro executar o normalizador; reporte a contagem. O maestro então exige `pnpm verify:round-tasks` e `pnpm check` verdes no CTG.
- `normalize-tasks.mjs`, `verify-round-tasks.mjs` e `task.template.json` presentes; o maestro aplica o normalizador aos arquivos históricos.
- `node --test tools/devai/tests/normalize-tasks.test.mjs tools/devai/tests/verify-round-tasks.test.mjs` → PASS nos testes do Inspector; o maestro aplica a normalização e prova 0 TASK inválidas.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0009
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0010.md

```markdown
# Prompt de worker — `TASK-0010` (`transcriber-docs`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect (transcrição)**. Declare na primeira linha da resposta. Modelo `gpt-6-luna`, esforço `low`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Transcrever records das rodadas fechadas**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/transcriber-docs.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0003.md`
7. `work/rounds/README.md`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/record-meta.schema.json`
9. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/phase-closure.schema.json`
10. `work/rounds/R-0020/reports/TASK-0009.md`

## Pode tocar

- `work/rounds/R-0003/record.md`
- `work/rounds/R-0004/record.md`
- `work/rounds/R-0005/record.md`
- `work/rounds/R-0006/record.md`
- `work/rounds/R-0007/record.md`
- `work/rounds/R-0008/record.md`
- `work/rounds/R-0009/record.md`
- `work/rounds/R-0010/record.md`
- `work/rounds/R-0011/record.md`
- `work/rounds/R-0012/record.md`
- `work/rounds/R-0013/record.md`
- `work/rounds/R-0014/record.md`
- `work/rounds/R-0015/record.md`
- `work/rounds/R-0016/record.md`
- `work/rounds/R-0018/record.md`
- `work/rounds/R-0019/record.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Transcrever records das rodadas fechadas. Entregar record.md por rodada com PC. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: record.md por rodada com PC. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0003; predecessor TASK-0009. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- A tabela completa rodada → PC → merged_as → gates → plan_path → orchestrator_prompt de CTG-0003.md é a única fonte para transcrição; não pesquise nem invente valores. R-0003…R-0016, R-0018 e R-0019 possuem PC; R-0017 só entra após closure em main. R-0001/R-0002 são pré-método. Normalização de TASK precede seal; `record/` só pelo verbo DEVAI e pelo maestro.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `record.md por rodada com PC` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect (transcrição)
Tarefa: TASK-0010
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0011.md

```markdown
# Prompt de worker — `TASK-0011` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir sensores e adenda A1**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json`
7. `node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/sensor-reading.schema.json`
9. `work/rounds/R-0020/baseline.json`
10. `work/rounds/R-0020/reports/TASK-0010.md`

## Pode tocar

- `work/rounds/R-0020/contracts/CTG-0004.md`
- `work/rounds/R-0020/plan.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir sensores e adenda A1. Entregar contracts/CTG-0004.md e proposta A1. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: contracts/CTG-0004.md e proposta A1. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0004; predecessor TASK-0010. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- SensorReading deve obedecer ao esquema DEVAI; falha de comando nunca vira PASS. A1 define piso de PASS por substrato após decisão do Owner; não invente piso.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `contracts/CTG-0004.md e proposta A1` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0011
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0012.md

```markdown
# Prompt de worker — `TASK-0012` (`inspector-tests`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Inspector**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Testar wrapper de sensores**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/inspector-tests.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0004.md`
7. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/sensor-reading.schema.json`
8. `work/rounds/R-0020/reports/TASK-0011.md`

## Pode tocar

- `tools/devai/tests/sense.test.mjs`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Testar wrapper de sensores. Entregar tools/devai/tests/sense.test.mjs. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/tests/sense.test.mjs. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0004; predecessor TASK-0011. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- SensorReading deve obedecer ao esquema DEVAI; falha de comando nunca vira PASS. A1 define piso de PASS por substrato após decisão do Owner; não invente piso.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/tests/sense.test.mjs` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `node --test tools/devai/tests/sense.test.mjs` → testes executam; RED de caracterização é documentado e só vira PASS após a tarefa Engineer.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Inspector
Tarefa: TASK-0012
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0013.md

```markdown
# Prompt de worker — `TASK-0013` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Implementar wrapper de sensores**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0004.md`
7. `tools/devai/tests/sense.test.mjs`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/sensor-reading.schema.json`
9. `work/rounds/R-0020/reports/TASK-0012.md`

## Pode tocar

- `tools/devai/sense.mjs`
- `package.json`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Implementar wrapper de sensores. Entregar tools/devai/sense.mjs e script devai:sense; binding pelo maestro. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/sense.mjs e script devai:sense; binding pelo maestro. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0004; predecessor TASK-0012. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- SensorReading deve obedecer ao esquema DEVAI; falha de comando nunca vira PASS. A1 define piso de PASS por substrato após decisão do Owner; não invente piso.

## Critérios de aceitação

- `pnpm check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/sense.mjs e script devai:sense; binding pelo maestro` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `pnpm devai:sense` → leituras válidas, sem converter falha em PASS; o maestro persiste via `devai sense record`.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0013
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0014.md

```markdown
# Prompt de worker — `TASK-0014` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir gates CI e ADR v2**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `law/adr/README.md`
7. `law/schemas/adr-v2.schema.json`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/forbidden-action-authorizations.schema.json`
9. `.github/workflows/ci.yml`
10. `work/rounds/R-0020/reports/TASK-0013.md`
11. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/adr-validation-policy.schema.json`
12. `node_modules/@aarusso-nyx/devai/dist/law/policy/forbidden-actions.json`
13. `law/adr/ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md`
14. `work/rounds/R-0020/reports/forbidden-actions-baseline.json`

## Pode tocar

- `law/policy/adr-validation.json`
- `law/adr/ADR-0002-devai-ci-gates.md`
- `work/rounds/R-0020/contracts/CTG-0005.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir gates CI e ADR v2. Entregar adr-validation.json, ADR v2 e contracts/CTG-0005.md, com seção de proposta de recibos históricos (commit, regra, justificativa; authorized_by reservado ao Owner). A leitura inicial em origin/main apontou 43 achados sem --since-ref, contra 11 no diagnóstico histórico: classifique a diferença, não amplie recibos por conta própria. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: adr-validation.json, ADR v2 e contracts/CTG-0005.md. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0005; predecessor TASK-0013. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Prepare a ADR v2 com affected_rules cobrindo ci.yml. O Owner precisa aceitá-la antes de qualquer mudança de CI; não marque Accepted por inferência. Os 11 achados históricos exigem recibos do Owner; nunca silencie forbidden-actions. O corpo de PR terá Inv-Compliance:.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `adr-validation.json, ADR v2 e contracts/CTG-0005.md` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `pnpm exec devai check --only adrs --repo-root . --format json` → ok=true após a política e ADR.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0014
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0015.md

```markdown
# Prompt de worker — `TASK-0015` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Ligar gates DEVAI no CI**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0005.md`
7. `law/adr/ADR-0002-devai-ci-gates.md`
8. `.github/workflows/ci.yml`
9. `.github/pull_request_template.md`
10. `work/rounds/R-0020/reports/TASK-0014.md`
11. `work/rounds/R-0020/reports/TASK-0019.md`

## Pode tocar

- `.github/workflows/ci.yml`
- `.github/pull_request_template.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Ligar gates DEVAI no CI após TASK-0019, aceite Owner da ADR v2 e recibos históricos aplicados pelo maestro. Entregar ci.yml e pull_request_template.md; os recibos são ato do Owner, aplicado em commit segregado. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: ci.yml, pull_request_template.md e recibos aprovados. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0005; predecessor TASK-0019. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- ADR v2 aceita, com affected_rules cobrindo ci.yml, precede mudança de CI. Os 11 achados históricos exigem recibos do Owner; nunca silencie forbidden-actions. O corpo de PR terá Inv-Compliance:.

## Critérios de aceitação

- `pnpm check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `.github/workflows/ci.yml` e `.github/pull_request_template.md` → arquivos presentes, sem alteração fora da fronteira; recibos aprovados são aplicados pelo maestro em commit Owner.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0015
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0016.md

```markdown
# Prompt de worker — `TASK-0016` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir autoridade por caminho e método**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `docs/meta/adr/ADR-0022-orchestra-execution-model.md`
7. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/project-config.schema.json`
8. `.devai/config/project.json`
9. `work/rounds/R-0020/reports/TASK-0015.md`
10. `.devai/pin/constitution.md`
11. `.devai/config/authority-policy.json`
12. `law/policy/mutation-strength.json`
13. `CLAUDE.md`
14. `law/adr/README.md`
15. `DESIGN-DECISIONS.md`
16. `.claude/agents/architect-blueprint.md`
17. `.claude/agents/engineer-backend.md`
18. `.claude/agents/engineer-frontend.md`
19. `.claude/agents/inspector-tests.md`
20. `.claude/agents/transcriber-docs.md`

## Pode tocar

- `work/rounds/R-0020/contracts/CTG-0006.md`
- `law/adr/ADR-0003-orchestra-devai.md`
- `law/adr/ADR-0004-constitution-1-0-1.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir autoridade por caminho e método. Entregar contracts/CTG-0006.md e ADRs propostas. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: contracts/CTG-0006.md e ADRs propostas. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0006; predecessor TASK-0015. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Host-integrated e hooks devem aplicar autoridade por caminho. A Constituição 1.0.1 foi aceita, mas init bind/apply é operação exclusiva do maestro após ensaio em clone; ADR-0022 já foi aceita em R-0018.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `contracts/CTG-0006.md e ADRs propostas` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0016
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0017.md

```markdown
# Prompt de worker — `TASK-0017` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Implementar hooks de autoridade**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0006.md`
7. `.devai/config/project.json`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/project-config.schema.json`
9. `work/rounds/R-0020/reports/TASK-0016.md`
10. `work/rounds/R-0020/reports/TASK-0020.md`

## Pode tocar

- `.claude/settings.json`
- `tools/devai/authority-hook.mjs`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Implementar hooks de autoridade. Entregar settings e hooks; bind/apply executados pelo maestro. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: settings e hooks; bind/apply executados pelo maestro. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0006; predecessor TASK-0020. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Host-integrated e hooks devem aplicar autoridade por caminho. A Constituição 1.0.1 foi aceita, mas init bind/apply é operação exclusiva do maestro após ensaio em clone; ADR-0022 já foi aceita em R-0018.

## Critérios de aceitação

- `pnpm check` → exit 0 nos arquivos que esta tarefa pode tocar. Após o bind/apply pelo maestro, `pnpm exec devai doctor --repo-root . --format human` deve mostrar todos `[✓]` no modo host-integrated; esse é o checkpoint do CTG-0006.
- Entrega declarada em `settings e hooks; bind/apply executados pelo maestro` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0017
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0018.md

```markdown
# Prompt de worker — `TASK-0018` (`transcriber-docs`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect (transcrição)**. Declare na primeira linha da resposta. Modelo `gpt-6-luna`, esforço `low`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Transcrever método e histórico**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/transcriber-docs.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0006.md`
7. `docs/meta/agents/orchestra/model-ladder.md`
8. `work/rounds/R-0020/reports/TASK-0017.md`
9. `docs/meta/agents/orchestra/maestro-prompt.template.md`
10. `docs/meta/agents/orchestra/README.md`
11. `docs/meta/agents/orchestra/waves.md`
12. `docs/meta/knowledge-base/backlog.md`
13. `.gitignore`
14. `.devai/pin/constitution.md`

## Pode tocar

- `docs/meta/agents/orchestra/maestro-prompt.template.md`
- `docs/meta/agents/orchestra/README.md`
- `docs/meta/agents/orchestra/waves.md`
- `docs/meta/knowledge-base/backlog.md`
- `.gitignore`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Transcrever método e histórico. Em waves.md atualizar coluna Maestro da R-0020 para Sol 6 e acrescentar §Histórico da troca Codex/Claude prevista em AUTHORIZATION.md. Entregar maestro-prompt.template.md, README.md, waves.md, backlog.md. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: maestro-prompt.template.md, README.md, waves.md, backlog.md. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0006; predecessor TASK-0017. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Host-integrated e hooks devem aplicar autoridade por caminho. A Constituição 1.0.1 foi aceita, mas init bind/apply é operação exclusiva do maestro após ensaio em clone; ADR-0022 já foi aceita em R-0018.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `maestro-prompt.template.md, README.md, waves.md, backlog.md` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect (transcrição)
Tarefa: TASK-0018
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0019.md

```markdown
# Prompt de worker — `TASK-0019` (`inspector-tests`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa após o contrato Architect; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Inspector**. Declare na primeira linha. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

Ação 5 da C-0002: sensores DEVAI, gates e autoridade por caminho. R-0018/R-0019 em main; R-0017 só CTG-0001. CTG-0005 é serial após CTG-0004. Esta tarefa vem após TASK-0014 e antes de TASK-0015.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/inspector-tests.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0005.md`
7. `.github/workflows/ci.yml`
8. `.github/pull_request_template.md`
9. `law/adr/ADR-0002-devai-ci-gates.md`
10. `work/rounds/R-0020/reports/TASK-0014.md`

## Pode tocar

- `tools/devai/tests/ci-gates.test.mjs`

## Não pode tocar

- Qualquer outro arquivo, inclusive código, CI, políticas, `record/`, `.devai/` e testes de outra tarefa.
- Git, instalação de pacotes, `devai ... --write`, remoção de gate, `skip`/`todo` ou mudança de asserção para passar.

## Tarefa

Testar gates CI e template de PR. Escreva testes antes da implementação da TASK-0015; RED esperado é caracterização, não falha do Inspector.

## Definições que valem como contrato

- O contrato `CTG-0005` é a fonte fechada. O teste exige cada passo DEVAI obrigatório e prova a ausência de continue-on-error ou filtro de paths; template exige Art. 7 e Inv-Compliance:. Não edite CI nem template.
- OD-R20-003=(A) e OD-R20-005=aceita; decisões restantes não são presumidas. Art. 6 autoridade por caminho, Art. 7 papéis, Art. 41 prova append-only.
- Uma alteração de teste que enfraqueça critério é proibida. Se houver lacuna, reporte RGR ao Architect.

## Critérios de aceitação

- `pnpm format:check` → exit 0.
- `node --test tools/devai/tests/ci-gates.test.mjs` → executa casos positivos e negativos; RED antes da TASK-0015 é registrado, e o maestro exige PASS após implementação.
- `tools/devai/tests/ci-gates.test.mjs` → presente, sem escrita fora da fronteira.

## Regras que não admitem exceção

1. Leia só a lista fechada; use `source_pending` ou OD quando não houver fonte.
2. Não modifique implementação, CI, contrato ou artefatos gerados.
3. Formate apenas o teste com `node_modules/.bin/prettier --write`.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Inspector
Tarefa: TASK-0019
Arquivos criados/alterados: <lista>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0020.md

```markdown
# Prompt de worker — `TASK-0020` (`inspector-tests`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa após o contrato Architect; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Inspector**. Declare na primeira linha. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

Ação 5 da C-0002: sensores DEVAI, gates e autoridade por caminho. R-0018/R-0019 em main; R-0017 só CTG-0001. CTG-0006 é serial após CTG-0005. Esta tarefa vem após TASK-0016 e antes de TASK-0017.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/inspector-tests.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0006.md`
7. `.devai/config/authority-policy.json`
8. `.devai/pin/constitution.md`
9. `.devai/config/project.json`
10. `work/rounds/R-0020/reports/TASK-0016.md`

## Pode tocar

- `tools/devai/tests/authority-hook.test.mjs`

## Não pode tocar

- Qualquer outro arquivo, inclusive código, CI, políticas, `record/`, `.devai/` e testes de outra tarefa.
- Git, instalação de pacotes, `devai ... --write`, remoção de gate, `skip`/`todo` ou mudança de asserção para passar.

## Tarefa

Testar autoridade por caminho e papel. Escreva testes antes da implementação da TASK-0017; RED esperado é caracterização, não falha do Inspector.

## Definições que valem como contrato

- O contrato `CTG-0006` é a fonte fechada. Cobrir caminhos permitidos e recusados em record/, .devai/, law/ e product/ para Owner, Architect, Inspector, Engineer e maestro; negar por padrão. Não edite implementação nem configuração.
- OD-R20-003=(A) e OD-R20-005=aceita; decisões restantes não são presumidas. Art. 6 autoridade por caminho, Art. 7 papéis, Art. 41 prova append-only.
- Uma alteração de teste que enfraqueça critério é proibida. Se houver lacuna, reporte RGR ao Architect.

## Critérios de aceitação

- `pnpm format:check` → exit 0.
- `node --test tools/devai/tests/authority-hook.test.mjs` → executa casos positivos e negativos; RED antes da TASK-0017 é registrado, e o maestro exige PASS após implementação.
- `tools/devai/tests/authority-hook.test.mjs` → presente, sem escrita fora da fronteira.

## Regras que não admitem exceção

1. Leia só a lista fechada; use `source_pending` ou OD quando não houver fonte.
2. Não modifique implementação, CI, contrato ou artefatos gerados.
3. Formate apenas o teste com `node_modules/.bin/prettier --write`.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Inspector
Tarefa: TASK-0020
Arquivos criados/alterados: <lista>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/compositions.json

```json
[
  {
    "task_id": "TASK-0001",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0001.md",
    "sha256": "a2fc3ca74fedef570619b26deac6a2a7bfbdefef1f925ef4def42e4337f56621",
    "pc_id": "PC-a2fc3ca74fedef57",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0002",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0002.md",
    "sha256": "c5626b1ba77dea2cf626af3b58efee4dc97e7980b3433da317219ea974fcf3d2",
    "pc_id": "PC-c5626b1ba77dea2c",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0003",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0003.md",
    "sha256": "2600edb25b0a3a9a05a7ea91f91ad0122bb1b868e0090beed3936963c2fd5345",
    "pc_id": "PC-2600edb25b0a3a9a",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0004",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0004.md",
    "sha256": "02b8d6b1aa5102b9c8634cb78d50e53ce3ca5663308a45f03d5d9ba622091f4c",
    "pc_id": "PC-02b8d6b1aa5102b9",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0005",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0005.md",
    "sha256": "582f53393810785ffcfa887c38c587eab7e16e9d1bc7ad91df9ff84e8492a5b2",
    "pc_id": "PC-582f53393810785f",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0006",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0006.md",
    "sha256": "6fd56a6ece77211d59118817bbeb14890c6e743519922227151e19f9d2aa1a0e",
    "pc_id": "PC-6fd56a6ece77211d",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0007",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0007.md",
    "sha256": "1caafa750e63d159cb4b25cccf5bc8524a3e5438b06789ec3bd4734e04204d46",
    "pc_id": "PC-1caafa750e63d159",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0008",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0008.md",
    "sha256": "ff93e308ca8fb0bf634e994e61d874a373850fc1ae4770287d159fba1282bae8",
    "pc_id": "PC-ff93e308ca8fb0bf",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0009",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0009.md",
    "sha256": "076fd4afcc59170a27d369c10976a3ce20228610e7c2e12e86a5513adb79db0e",
    "pc_id": "PC-076fd4afcc59170a",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0010",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0010.md",
    "sha256": "73ba78b2b2e594e76984a5ccd55c9f27c2c5b0bfebde6703961055fba146c2a6",
    "pc_id": "PC-73ba78b2b2e594e7",
    "model": "gpt-6-luna",
    "effort": "low"
  },
  {
    "task_id": "TASK-0011",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0011.md",
    "sha256": "a61510997eb97132448507b37df8438537a641caefcd1693dc7630c341136c65",
    "pc_id": "PC-a61510997eb97132",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0012",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0012.md",
    "sha256": "31bfd4f7b81eb9b49d95bc5556d7fcbcbac60648ec09a42fd667137e734573a6",
    "pc_id": "PC-31bfd4f7b81eb9b4",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0013",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0013.md",
    "sha256": "71e15dc8ad9c404760408fccaa801a4ac11fb7d0b32d85a23e5f864b430dd7d6",
    "pc_id": "PC-71e15dc8ad9c4047",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0014",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0014.md",
    "sha256": "e85bc8d801e3fea3a4b3904278297881fe68baabfd7db426646edf0386271982",
    "pc_id": "PC-e85bc8d801e3fea3",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0015",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0015.md",
    "sha256": "27060a705148a6b3ae0ce2d0d0623d93d3e4ac39fdd721036b7c2010733f728b",
    "pc_id": "PC-27060a705148a6b3",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0016",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0016.md",
    "sha256": "156733068f0eea3f440fec392dc04168d24b4085eb355809ba2776ccf6525f37",
    "pc_id": "PC-156733068f0eea3f",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0017",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0017.md",
    "sha256": "c93b370d48f042659a1d99ac20998e9e2c8414347cd1b3edde7b4f751beee02d",
    "pc_id": "PC-c93b370d48f04265",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0018",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0018.md",
    "sha256": "1995dfe817e9e72c51eda3f3154eb67cc79d3dcbd5e0f4c5626f092e91b1845a",
    "pc_id": "PC-1995dfe817e9e72c",
    "model": "gpt-6-luna",
    "effort": "low"
  },
  {
    "task_id": "TASK-0019",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0019.md",
    "sha256": "66463aad19bd9b639b3601171201795648e6f4f1386b57aed3cd318eda2ef6bd",
    "pc_id": "PC-66463aad19bd9b63",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0020",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0020.md",
    "sha256": "e60655cde95eda2e4e580940d6d8554eaf47ebf16a9b72ddc6b97a08615518bd",
    "pc_id": "PC-e60655cde95eda2e",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  }
]

````
